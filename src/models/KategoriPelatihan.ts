import mongoose, { Schema, Document } from 'mongoose';

export interface IKategoriPelatihan extends Document {
  id: string;
  singkatan: string; // e.g. "PKN"
  kepanjangan: string; // e.g. "Pelatihan Kepemimpinan Nasional"
  min_weight: number; // min_level_weight
}

const KategoriPelatihanSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    singkatan: { type: String, required: true },
    kepanjangan: { type: String, required: true },
    min_weight: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        const r = ret as any;
        r.id = r._id;
        delete r._id;
        delete r.__v;
        return r;
      },
    },
  }
);

export default mongoose.models.KategoriPelatihan || mongoose.model<IKategoriPelatihan>('KategoriPelatihan', KategoriPelatihanSchema);
