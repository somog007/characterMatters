import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  thumbnail: string;
  videoURL: string;
  duration: number; // in seconds
  category: mongoose.Types.ObjectId;
  accessLevel: 'free' | 'premium';
  price?: number;
  createdBy: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  videoURL: { type: String, required: true },
  duration: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  accessLevel: { type: String, enum: ['free', 'premium'], default: 'free' },
  price: Number,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IVideo>('Video', videoSchema);