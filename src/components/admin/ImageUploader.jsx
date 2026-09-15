"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ImageUploader({
  images = [],
  onChange,
  multiple = true,
}) {
  const [uploading, setUploading] = useState(false);

  const normalize = (list = []) =>
    list
      .map((i) => (typeof i === "string" ? i : i?.url))
      .filter(Boolean);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);

    try {
      const uploaded = [];

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Yükleme başarısız");

        uploaded.push(data.url);
      }

      const current = normalize(images);

      onChange(multiple ? [...current, ...uploaded] : uploaded[0]);

      // Aynı dosyayı tekrar seçebilsin
      e.target.value = "";
    } catch (err) {
      toast.error(err.message || "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    onChange(normalize(images).filter((i) => i !== url));
  }

  const list = normalize(multiple ? images : images ? [images] : []);

  return (
    <div>
      {list.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {list.map((url) => (
            <div key={url} className="relative h-20 w-20">
              <img
                src={url}
                alt=""
                className="h-full w-full rounded-lg border object-cover"
              />

              {multiple && (
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-red-600 text-xs text-white"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFiles}
        disabled={uploading}
      />

      {uploading && (
        <p className="mt-1 text-xs text-gray-500">Yükleniyor...</p>
      )}
    </div>
  );
}
