export interface OnboardingStep {
  targetSelector: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const adminOnboardingSteps: OnboardingStep[] = [
  {
    targetSelector: "[data-onboarding='sidebar']",
    title: "Navigasi Dashboard",
    description: "Gunakan sidebar ini untuk berpindah antara Dasbor Ringkasan, Data Master, Penjadwalan Pelatihan, dan Laporan & Analisis.",
    placement: "right",
  },
  {
    targetSelector: "[data-onboarding='overview-charts']",
    title: "Ringkasan Kinerja",
    description: "Pantau performa Widyaiswara secara real-time melalui grafik batang dan diagram lingkaran berdasarkan pola anggaran.",
    placement: "bottom",
  },
  {
    targetSelector: "[data-onboarding='overview-table']",
    title: "Tabel Penyeimbangan Beban",
    description: "Lihat rincian JP per Widyaiswara, termasuk breakdown APBD, Kontribusi, dan Kemitraan. Gunakan filter untuk melihat data spesifik.",
    placement: "top",
  },
  {
    targetSelector: "[data-onboarding='scheduling-nav']",
    title: "Penjadwalan Pelatihan",
    description: "Akses halaman Penjadwalan Pelatihan untuk membuat dan mengelola sesi mengajar, alokasi WI, dan JP tracking.",
    placement: "right",
  },
  {
    targetSelector: "[data-onboarding='reports-nav']",
    title: "Laporan & Analisis",
    description: "Buka Laporan & Analisis untuk mengekspor data, melihat tren, dan menganalisis distribusi beban mengajar.",
    placement: "right",
  },
];

export const wiOnboardingSteps: OnboardingStep[] = [
  {
    targetSelector: "[data-onboarding='wi-sidebar']",
    title: "Navigasi Portal",
    description: "Gunakan sidebar untuk melihat Ikhtisar jadwal Anda dan mengakses Laporan pribadi.",
    placement: "right",
  },
  {
    targetSelector: "[data-onboarding='wi-whatsapp']",
    title: "Hubungi Admin",
    description: "Butuh bantuan? Klik tombol WhatsApp untuk langsung terhubung dengan admin melalui chat.",
    placement: "left",
  },
];