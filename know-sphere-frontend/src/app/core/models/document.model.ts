export type DocumentType = 'PDF' | 'DOCX' | 'XLSX' | 'TXT' | 'CSV' | 'PPTX';
export type DocumentStatus = 'queued' | 'uploading' | 'processing' | 'embedding' | 'completed' | 'failed';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  sizeFormatted: string;
  department: string;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
  s3Key?: string;
  s3Url?: string;
  pageCount?: number;
  chunkCount?: number;
  collectionId?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  processingSteps?: ProcessingStep[];
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  label: string;
}

export interface UploadProgress {
  file: File;
  name: string;
  progress: number;
  status: DocumentStatus;
  error?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber?: number;
  chunkIndex: number;
  embedding?: number[];
}
