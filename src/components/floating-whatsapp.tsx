"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { BRANDING } from "@/lib/config";

export function FloatingWhatsApp() {
  const waNumber = BRANDING.whatsappNumber || "6281234567890";
  const message = encodeURIComponent("Halo Admin, saya ingin bertanya terkait jadwal mengajar.");
  const waLink = `https://wa.me/${waNumber}?text=${message}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-full shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
      title="Hubungi Admin via WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm hidden sm:inline">Hubungi Admin</span>
    </a>
  );
}
