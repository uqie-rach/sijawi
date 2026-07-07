import mongoose, { Schema, Document } from 'mongoose';

export interface IJadwalSesi extends Document {
  id: string;
  batch_id: string; // pelatihan_id / batch_id
  mapel_id: string; // mata_pelatihan_id / mapel_id
  wi_ids: string[]; // array of widyaiswara_ids
  date: string; // YYYY-MM-DD
  start_time: string; // waktu_mulai / start_time
  end_time: string; // waktu_selesai / end_time
  format: 'Klasikal' | 'Virtual' | 'Asinkron'; // format_pelaksanaan / format
  lokasi_id?: string;
  jp_ke: string;
  jp_count: number; // jumlah_jp / jp_count
  detail_kegiatan?: string;
}

const JadwalSesiSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Keep string IDs to match existing seed/frontend
    batch_id: { type: String, required: true }, // pelatihan_id / batch_id
    mapel_id: { type: String, required: true }, // mata_pelatihan_id / mapel_id
    wi_ids: { type: [String], required: true }, // array of widyaiswara_ids
    date: { type: String, required: true }, // YYYY-MM-DD
    start_time: { type: String, required: true }, // waktu_mulai / start_time
    end_time: { type: String, required: true }, // waktu_selesai / end_time
    format: { type: String, enum: ['Klasikal', 'Virtual', 'Asinkron'], required: true }, // format_pelaksanaan / format
    lokasi_id: { type: String },
    jp_ke: { type: String, required: true },
    jp_count: { type: Number, required: true }, // jumlah_jp / jp_count
    detail_kegiatan: { type: String, default: '' },
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

export default mongoose.models.JadwalSesi || mongoose.model<IJadwalSesi>('JadwalSesi', JadwalSesiSchema);