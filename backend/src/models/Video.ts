import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  thumbnail: string;
  videoURL: string;
  hlsManifestPath?: string;
  isEncrypted: boolean;
  encryptionKeyId?: string;
  isPublished: boolean;
  duration: number; // in seconds
  category: mongoose.Types.ObjectId;
  accessLevel: 'free' | 'protected' | 'premium';
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
  hlsManifestPath: { type: String },
  isEncrypted: { type: Boolean, default: true },
  encryptionKeyId: String,
  isPublished: { type: Boolean, default: true },
  duration: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  accessLevel: { type: String, enum: ['free', 'protected', 'premium'], default: 'protected' },
  price: Number,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IVideo>('Video', videoSchema);