import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: 'platinum' | 'diamond' | 'sapphire' | 'gold' | 'silver' | 'bronze' | 'package_1' | 'package_2' | 'package_3' | 'package_4' | 'package_5' | 'package_6' | string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  billingCycle: 'monthly' | 'yearly' | 'academic_session';
  price: number;
  startDate: Date;
  endDate: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
  stripeSubscriptionId?: string;
  paymentProvider?: 'stripe' | 'paystack' | 'manual';
  providerReference?: string;
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
    enum: ['active', 'canceled', 'expired', 'pending'], 
    default: 'active' 
  },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly', 'academic_session'], 
    default: 'academic_session'
  },
  price: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  canceledAt: { type: Date },
  stripeSubscriptionId: String,
  paymentProvider: { type: String, enum: ['stripe', 'paystack', 'manual'], default: 'stripe' },
  providerReference: String
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);