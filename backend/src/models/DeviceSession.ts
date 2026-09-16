import mongoose, { Document, Schema } from 'mongoose';

export interface IDeviceSession extends Document {
  user: mongoose.Types.ObjectId;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  lastActive: Date;
  isBlocked: boolean;
}

const deviceSessionSchema = new Schema<IDeviceSession>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  deviceId: { type: String, required: true },
  deviceName: { type: String, required: true },
  ipAddress: { type: String, required: true },
  lastActive: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

deviceSessionSchema.index({ user: 1, deviceId: 1 }, { unique: true });

export default mongoose.model<IDeviceSession>('DeviceSession', deviceSessionSchema);
