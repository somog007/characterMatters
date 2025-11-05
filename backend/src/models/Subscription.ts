import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: 'basic' | 'premium' | 'enterprise' | string;
  status: 'active' | 'canceled' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  price: number;
  startDate: Date;
  endDate: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'canceled', 'expired'], 
    default: 'active' 
  },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly'], 
    default: 'monthly'
  },
  price: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  canceledAt: { type: Date },
  stripeSubscriptionId: String
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);