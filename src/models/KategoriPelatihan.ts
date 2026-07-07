import mongoose, { Schema, Document } from 'mongoose';

export interface IKategoriPelatihan extends Document {
  id: string;
  name: string; // Nama
  kepanjangan?: string;
  min_weight: number; // min_level_weight
}

const KategoriPelatihanSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Keep string IDs to match existing seed/frontend
    name: { type: String, required: true }, // Nama
    kepanjangan: { type: String, default: '' },
    min_weight: { type: Number, required: true }, // min_level_weight
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

export default mongoose.models.KategoriPelatihan || mongoose.model<IKategoriPelatihan>('KategoriPelatihan', KategoriPelatihanSchema);