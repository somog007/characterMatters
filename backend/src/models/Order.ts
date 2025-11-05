import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  eBook: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eBook: { type: Schema.Types.ObjectId, ref: 'EBook', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentIntentId: String
}, {
  timestamps: true
});

export default mongoose.model<IOrder>('Order', orderSchema);