import mongoose, { Document, Schema } from 'mongoose';

export interface IEBook extends Document {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  fileURL: string;
  price: number;
  category: mongoose.Types.ObjectId;
  pages: number;
  language: string;
  publisher: string;
  publishedDate: Date;
  createdBy: mongoose.Types.ObjectId;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ebookSchema = new Schema<IEBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  fileURL: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  pages: Number,
  language: { type: String, default: 'English' },
  publisher: String,
  publishedDate: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  salesCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IEBook>('EBook', ebookSchema);