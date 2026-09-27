import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  name: string;
  originalName: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'TXT' | 'CSV' | 'PPTX';
  size: number;
  s3Key: string;
  s3Url: string;
  department: string;
  uploadedBy: mongoose.Types.ObjectId;
  status: 'queued' | 'uploading' | 'processing' | 'embedding' | 'completed' | 'failed';
  pageCount?: number;
  chunkCount?: number;
  collectionId?: mongoose.Types.ObjectId;
  isFavorite: boolean;
  isArchived: boolean;
  errorMessage?: string;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    type: { type: String, enum: ['PDF', 'DOCX', 'XLSX', 'TXT', 'CSV', 'PPTX'], required: true },
    size: { type: Number, required: true },
    s3Key: { type: String, required: true },
    s3Url: { type: String, required: true },
    department: { type: String, required: true, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['queued', 'uploading', 'processing', 'embedding', 'completed', 'failed'],
      default: 'queued'
    },
    pageCount: { type: Number },
    chunkCount: { type: Number },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    errorMessage: { type: String },
    processingStartedAt: { type: Date },
    processingCompletedAt: { type: Date }
  },
  { timestamps: true }
);

documentSchema.index({ name: 'text', department: 1, status: 1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
