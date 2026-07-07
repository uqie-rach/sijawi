import mongoose, { Schema } from 'mongoose';

const AdminConfigSchema = new Schema(
  {
    _id: { type: String, default: 'admin-config' },
    passwordHash: { type: String, required: true },
    primaryColor: { type: String, required: true, default: '221 83% 53%' },
  },
  { timestamps: true }
);

export default mongoose.models.AdminConfig ||
  mongoose.model('AdminConfig', AdminConfigSchema);
