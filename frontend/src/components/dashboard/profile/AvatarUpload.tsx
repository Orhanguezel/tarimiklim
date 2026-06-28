"use client";

import { useRef, useState } from "react";
import { useProfile } from "@/lib/hooks/useProfile";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { useToast } from "@/components/providers/ToastProvider";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8088/api/v1").replace(/\/$/, "");

export function AvatarUpload() {
  const { data, update } = useProfile();
  const { user } = useAuthSession();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const avatarSrc = previewUrl ?? data?.avatar_url ?? null;
  const initials = (user?.full_name ?? user?.email ?? "?").charAt(0).toUpperCase();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dosya boyutu 2MB'den büyük olamaz.");
      return;
    }

    const prev = URL.createObjectURL(file);
    setPreviewUrl(prev);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const { getStoredAccessToken } = await import("@/lib/auth-token");
      const token = getStoredAccessToken();

      const res = await fetch(`${API_BASE}/storage/avatars/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) throw new Error("Yükleme başarısız");

      const uploadResult = await res.json();

      if (uploadResult.url) {
        await update({ avatar_url: uploadResult.url });
        toast.success("Profil fotoğrafınız güncellendi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Fotoğraf yüklenemedi. Lütfen tekrar deneyin.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="dashboard-panel dashboard-avatar-panel">
      <div className="dashboard-avatar-upload-wrap">
        <div className="dashboard-profile-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" />
          ) : (
            <div className="dashboard-profile-avatar-fallback">
              {initials}
            </div>
          )}
        </div>

        {uploading && (
          <div className="dashboard-avatar-loading">
            <div className="dashboard-avatar-spinner" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="dashboard-avatar-button"
        >
          <CameraIcon size={22} />
        </button>
      </div>

      <div className="dashboard-avatar-copy">
        <h3>Profil Fotoğrafı</h3>
        <p>
          Fotoğrafınız platformun tüm alanlarında görünür olacaktır. En iyi sonuç için kare formatında bir resim yükleyin.
        </p>
        <div className="dashboard-badges">
          <span>JPG / PNG / WEBP</span>
          <span>MAX 2MB</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

function CameraIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
