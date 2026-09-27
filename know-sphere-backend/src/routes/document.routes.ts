import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  uploadDocument, getDocuments, getDocument,
  toggleFavorite, archiveDocument, deleteDocument
} from '../controllers/document.controller';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload, management and processing
 */

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department (e.g. HR, Finance, IT)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PDF, DOCX, XLSX, TXT, CSV, PPTX]
 *         description: Filter by document type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [queued, uploading, processing, embedding, completed, failed]
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *         description: Set true to list archived documents
 *       - in: query
 *         name: favorites
 *         schema:
 *           type: boolean
 *         description: Set true to list favorite documents only
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getDocuments);

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a document to S3 and start RAG processing pipeline
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, DOCX, XLSX, TXT – max 50MB)
 *               department:
 *                 type: string
 *                 example: HR
 *                 description: Department this document belongs to
 *               collectionId:
 *                 type: string
 *                 description: Optional knowledge collection ID
 *     responses:
 *       201:
 *         description: Document uploaded, processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: No file uploaded or unsupported file type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Upload or S3 error
 */
router.post('/upload', uploadDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get single document with pre-signed download URL
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB document ID
 *     responses:
 *       200:
 *         description: Document details with signedUrl
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 document:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Document'
 *                     - type: object
 *                       properties:
 *                         signedUrl:
 *                           type: string
 *                           description: Pre-signed S3 URL valid for 1 hour
 *       404:
 *         description: Document not found
 */
router.get('/:id', getDocument);

/**
 * @swagger
 * /api/documents/{id}/favorite:
 *   patch:
 *     summary: Toggle favorite status of a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isFavorite:
 *                   type: boolean
 */
router.patch('/:id/favorite', toggleFavorite);

/**
 * @swagger
 * /api/documents/{id}/archive:
 *   patch:
 *     summary: Archive a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch('/:id/archive', archiveDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document from DB, S3 and Qdrant vector store
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted from all stores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Document not found
 */
router.delete('/:id', deleteDocument);

export default router;
