import type { MetadataRoute } from "next";
import { getPublicAppName } from "@/lib/public-brand";

/**
 * PWA manifest.
 *
 * İkonlar `src/app/icon.tsx` (ImageResponse) ile `/icon` üzerinden üretilir;
 * eksik public PNG yüzünden 404 oluşmaz.
 */
export default function manifest(): MetadataRoute.Manifest {
  const app = getPublicAppName();
  return {
    name: `${app} — Weather & Frost Alerts`,
    short_name: app,
    description:
      "Tarımsal hava tahmini, don riski uyarıları ve iklim destekli karar servisleri.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e1a",
    theme_color: "#84f04c",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png" },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Canlı Tahmin",
        url: "/tr/don-uyarisi",
        description: "Anlık hava ve don riski verisini aç",
      },
      {
        name: "Hesabım",
        url: "/tr/hesabim",
        description: "Bildirim kuralları ve profil yönetimi",
      },
    ],
    categories: ["food", "utilities"],
    lang: "tr",
    dir: "ltr",
  };
}
