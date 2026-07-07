import mongoose, { Schema, Document } from 'mongoose';

export interface IPelatihan extends Document {
  id: string;
  name: string; // nama_batch / name
  kategori_id: string;
  pola: 'APBD' | 'Kontribusi' | 'Kemitraan'; // pola_pelaksanaan / pola
  start_date: string; // tanggal_mulai / start_date
  end_date: string; // tanggal_selesai / end_date
  lokasi_id?: string;
}

const PelatihanSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Keep string IDs to match existing seed/frontend
    name: { type: String, required: true }, // nama_batch / name
    kategori_id: { type: String, required: true },
    pola: { type: String, enum: ['APBD', 'Kontribusi', 'Kemitraan'], required: true }, // pola_pelaksanaan / pola
    start_date: { type: String, required: true }, // tanggal_mulai / start_date
    end_date: { type: String, required: true }, // tanggal_selesai / end_date
    lokasi_id: { type: String },
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

export default mongoose.models.Pelatihan || mongoose.model<IPelatihan>('Pelatihan', PelatihanSchema);