import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'subscriber' | 'free-user';
  status: 'active' | 'suspended' | 'blocked';
  avatar?: string;
  subscription?: mongoose.Types.ObjectId;
  customCategoryPermissions: mongoose.Types.ObjectId[];
  customVideoPermissions: mongoose.Types.ObjectId[];
  maxAllowedDevices: number;
  purchasedEBooks: mongoose.Types.ObjectId[];
  watchHistory: mongoose.Types.ObjectId[];
  stripeCustomerId?: string;
  paystackCustomerCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'subscriber', 'free-user'], 
    default: 'free-user' 
  },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'blocked'], 
    default: 'active' 
  },
  avatar: String,
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  customCategoryPermissions: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  customVideoPermissions: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  maxAllowedDevices: { type: Number, default: 2 },
  purchasedEBooks: [{ type: Schema.Types.ObjectId, ref: 'EBook' }],
  watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  stripeCustomerId: { type: String },
  paystackCustomerCode: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema);