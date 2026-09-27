import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DocumentModel } from '../models/document.model';
import { uploadToS3, getPresignedUrl, deleteFromS3 } from '../services/s3.service';
import { extractText } from '../document-processing/text-extractor';
import { cleanText, chunkText } from '../document-processing/text-chunker';
import { storeDocumentChunks } from '../rag/rag.service';
import { VectorStoreService } from '../vector/vector-store.service';

// Multer config – temp disk storage
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/knowsphere-uploads',
    filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['.pdf', '.docx', '.xlsx', '.txt', '.csv', '.pptx'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
}).single('file');

const MIME_TO_TYPE: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/plain': 'TXT',
  'text/csv': 'CSV'
};

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  // Ensure tmp dir
  fs.mkdirSync('/tmp/knowsphere-uploads', { recursive: true });

  upload(req as any, res, async (err) => {
    if (err) { res.status(400).json({ success: false, message: err.message }); return; }
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const file = req.file;
    const { department = 'General', collectionId } = req.body;
    const docType = MIME_TO_TYPE[file.mimetype] || path.extname(file.originalname).replace('.', '').toUpperCase();

    try {
      // 1. Upload to S3
      const { key, url } = await uploadToS3(file.path, file.originalname, file.mimetype);

      // 2. Create DB record
      const doc = await DocumentModel.create({
        name: file.originalname,
        originalName: file.originalname,
        type: docType,
        size: file.size,
        s3Key: key,
        s3Url: url,
        department,
        uploadedBy: req.user!.id,
        collectionId: collectionId || undefined,
        status: 'processing'
      });

      // 3. Process in background (inline for simplicity – use BullMQ in production)
      processDocument(doc.id, file.path, file.mimetype, department, collectionId).catch(console.error);

      res.status(201).json({ success: true, document: doc });
    } catch (uploadErr) {
      res.status(500).json({ success: false, message: (uploadErr as Error).message });
    } finally {
      fs.unlink(file.path, () => {});
    }
  });
};

async function processDocument(docId: string, filePath: string, mime: string, department: string, collectionId?: string): Promise<void> {
  try {
    await DocumentModel.findByIdAndUpdate(docId, { status: 'processing', processingStartedAt: new Date() });

    // Extract text
    const { text, pageCount } = await extractText(filePath, mime);

    // Clean & chunk
    const cleaned = cleanText(text);
    const chunks = chunkText(cleaned);

    await DocumentModel.findByIdAndUpdate(docId, { status: 'embedding', pageCount });

    // Embed & store in Qdrant
    const doc = await DocumentModel.findById(docId);
    const chunkCount = await storeDocumentChunks(docId, doc!.name, doc!.type, collectionId, chunks);

    await DocumentModel.findByIdAndUpdate(docId, { status: 'completed', chunkCount, processingCompletedAt: new Date() });
    console.log(`✅ Document processed: ${doc?.name} (${chunkCount} chunks)`);
  } catch (err) {
    console.error('Document processing error:', err);
    await DocumentModel.findByIdAndUpdate(docId, { status: 'failed', errorMessage: (err as Error).message });
  }
}

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, type, status, archived, favorites } = req.query;
    const filter: Record<string, unknown> = {};
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (archived === 'true') filter.isArchived = true;
    else filter.isArchived = { $ne: true };
    if (favorites === 'true') filter.isFavorite = true;

    const docs = await DocumentModel.find(filter).populate('uploadedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await DocumentModel.findById(req.params.id).populate('uploadedBy', 'name');
    if (!doc) { res.status(404).json({ success: false, message: 'Document not found' }); return; }

    const signedUrl = await getPresignedUrl(doc.s3Key).catch(() => doc.s3Url);
    res.json({ success: true, document: { ...doc.toObject(), signedUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) { res.status(404).json({ success: false, message: 'Document not found' }); return; }
    doc.isFavorite = !doc.isFavorite;
    await doc.save();
    res.json({ success: true, isFavorite: doc.isFavorite });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const archiveDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await DocumentModel.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: 'Document archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) { res.status(404).json({ success: false, message: 'Document not found' }); return; }

    // Delete from S3
    await deleteFromS3(doc.s3Key).catch(console.error);

    // Delete from Qdrant
    const vs = new VectorStoreService();
    await vs.deleteByDocumentId(doc.id).catch(console.error);

    await DocumentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
