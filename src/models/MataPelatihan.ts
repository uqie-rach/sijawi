import mongoose, { Schema, Document } from 'mongoose';

export interface IMataPelatihan extends Document {
  id: string;
  name: string; // Nama
  kategori_id: string;
  jp_total: number; // maps to max_jp / jp_total
  min_jp?: number;
  max_jp?: number;
}

const MataPelatihanSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Keep string IDs to match existing seed/frontend
    name: { type: String, required: true }, // Nama
    kategori_id: { type: String, required: true },
    jp_total: { type: Number, required: true },
    min_jp: { type: Number, default: 2 },
    max_jp: { type: Number, default: 6 },
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

export default mongoose.models.MataPelatihan || mongoose.model<IMataPelatihan>('MataPelatihan', MataPelatihanSchema);