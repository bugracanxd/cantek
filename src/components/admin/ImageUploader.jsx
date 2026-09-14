"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ImageUploader({ images, onChange, multiple = true }) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        uploaded.push(data.url);
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded[0]);
    } catch (err) {
      toast.error(err.message || "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    onChange(images.filter((i) => i !== url));
  }

  const list = multiple ? images : images ? [images] : [];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {list.map((url) => (
          <div key={url} className="relative w-20 h-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover rounded-lg border" />
            {multiple && (
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <input type="file" accept="image/*" multiple={multiple} onChange={handleFiles} disabled={uploading} />
      {uploading && <p className="text-xs text-gray-500 mt-1">Yükleniyor...</p>}
    </div>
  );
}
