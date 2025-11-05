import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  type: 'video' | 'ebook' | 'both';
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: String,
  type: { 
    type: String, 
    enum: ['video', 'ebook', 'both'], 
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.model<ICategory>('Category', categorySchema);