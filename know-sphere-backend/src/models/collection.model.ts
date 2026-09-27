import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  department: string;
  color: string;
  icon: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    department: { type: String, required: true },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'folder' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const CollectionModel = mongoose.model<ICollection>('Collection', collectionSchema);
