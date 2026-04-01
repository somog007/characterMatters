import mongoose, { Document, Schema } from 'mongoose';

export interface IGalleryItem extends Document {
  title: string;
  description?: string;
  category: 'Events' | 'School Seminars';
  location?: string;
  school?: string;
  eventDate?: Date;
  mediaType: 'image' | 'video';
  url: string;
  thumbnail?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGalleryItem>(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, enum: ['Events', 'School Seminars'], required: true },
    location: String,
    school: String,
    eventDate: Date,
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    thumbnail: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

gallerySchema.index({ category: 1, createdAt: -1 });

export default mongoose.model<IGalleryItem>('Gallery', gallerySchema);
