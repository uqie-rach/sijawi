import mongoose, { Schema, Document } from 'mongoose';

export interface ILokasi extends Document {
  id: string;
  name: string; // nama_lokasi / name
  alamat?: string;
}

const LokasiSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Keep string IDs to match existing seed/frontend
    name: { type: String, required: true }, // nama_lokasi / name
    alamat: { type: String, default: '' },
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

export default mongoose.models.Lokasi || mongoose.model<ILokasi>('Lokasi', LokasiSchema);