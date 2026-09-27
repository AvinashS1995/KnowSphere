export type MessageRole = 'user' | 'assistant';

export interface Source {
  documentId: string;
  documentName: string;
  documentType: string;
  pageRange: string;
  excerpt: string;
  relevanceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  timestamp: string;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

export interface ChatRequest {
  conversationId?: string;
  question: string;
  collectionId?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage;
}
