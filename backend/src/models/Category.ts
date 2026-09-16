import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  type: 'video' | 'ebook' | 'both';
  accessTier: 'free' | 'basic' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  type: { 
    type: String, 
    enum: ['video', 'ebook', 'both'], 
    required: true 
  },
  accessTier: { 
    type: String, 
    enum: ['free', 'basic', 'premium', 'enterprise'], 
    default: 'basic',
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICategory>('Category', categorySchema);