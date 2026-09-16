import mongoose, { Document, Schema } from 'mongoose';

export interface IPlaybackSession extends Document {
  user: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  deviceId: string;
  status: 'active' | 'revoked' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

const playbackSessionSchema = new Schema<IPlaybackSession>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  video: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  sessionToken: { type: String, required: true, unique: true, index: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  deviceId: { type: String, required: true, index: true },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // MongoDB TTL Auto-Index
}, { timestamps: true });

export default mongoose.model<IPlaybackSession>('PlaybackSession', playbackSessionSchema);
