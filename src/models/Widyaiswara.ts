import mongoose, { Schema, Document } from 'mongoose';

export interface IWidyaiswara extends Document {
  id: string;
  nip: string;
  name: string; // Nama
  gelar?: string;
  email: string;
  jabatan: string; // Jabatan
  level: number; // level_weight
  level_label: string;
  jp_last_month: number;
  password_hash?: string; // hashed password
}

const WidyaiswaraSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Keep string IDs to match existing seed/frontend
    nip: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // Nama
    gelar: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    jabatan: { type: String, required: true }, // Jabatan
    level: { type: Number, required: true }, // level_weight
    level_label: { type: String, required: true },
    jp_last_month: { type: Number, default: 0 },
    password_hash: { type: String }, // hashed password
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.models.Widyaiswara || mongoose.model<IWidyaiswara>('Widyaiswara', WidyaiswaraSchema);