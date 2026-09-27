export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  department: string;
  documentCount: number;
  lastUpdated: string;
  color: string;
  icon: string;
}

export interface SearchResult {
  documentId: string;
  documentName: string;
  documentType: string;
  department: string;
  excerpt: string;
  relevanceScore: number;
  pageNumber?: number;
  uploadedAt: string;
  size: string;
}
