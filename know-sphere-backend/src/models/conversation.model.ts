import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    documentId: string;
    documentName: string;
    documentType: string;
    pageRange: string;
    excerpt: string;
    relevanceScore?: number;
  }[];
  createdAt: Date;
}

export interface IConversation extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  collectionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sources: [
      {
        documentId: String,
        documentName: String,
        documentType: String,
        pageRange: String,
        excerpt: String,
        relevanceScore: Number
      }
    ],
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const conversationSchema = new Schema<IConversation>(
  {
    title: { type: String, default: 'New Conversation' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [messageSchema],
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' }
  },
  { timestamps: true }
);

export const ConversationModel = mongoose.model<IConversation>('Conversation', conversationSchema);
