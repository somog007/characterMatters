import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityLog extends Document {
  user?: mongoose.Types.ObjectId;
  eventType: 
    | 'UNAUTHORIZED_VIDEO_ACCESS'
    | 'CONCURRENT_DEVICE_EXCEEDED'
    | 'EXPIRED_TOKEN_ATTEMPT'
    | 'WATERMARK_TAMPER_DETECTED'
    | 'SUSPICIOUS_IP_CHANGE'
    | 'SESSION_REVOKED';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

const securityLogSchema = new Schema<ISecurityLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  eventType: { type: String, required: true, index: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export default mongoose.model<ISecurityLog>('SecurityLog', securityLogSchema);
