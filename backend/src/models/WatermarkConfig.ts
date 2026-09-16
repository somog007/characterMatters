import mongoose, { Document, Schema } from 'mongoose';

export interface IWatermarkConfig extends Document {
  logoUrl: string;
  websiteDomain: string;
  opacity: number;
  fontSize: number;
  movementIntervalSeconds: number;
  enableUserIdentifier: boolean;
  enableDynamicPositioning: boolean;
  updatedBy?: mongoose.Types.ObjectId;
}

const watermarkConfigSchema = new Schema<IWatermarkConfig>({
  logoUrl: { type: String, required: true, default: '/assets/watermark-logo.png' },
  websiteDomain: { type: String, required: true, default: 'CharacterMatters.com' },
  opacity: { type: Number, default: 0.18, min: 0.05, max: 0.5 },
  fontSize: { type: Number, default: 16 },
  movementIntervalSeconds: { type: Number, default: 20, min: 5, max: 120 },
  enableUserIdentifier: { type: Boolean, default: true },
  enableDynamicPositioning: { type: Boolean, default: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IWatermarkConfig>('WatermarkConfig', watermarkConfigSchema);
