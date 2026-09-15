"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ImageUploader({
  images = [],
  onChange,
  multiple = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);

  const normalize = (list = []) =>
    list
      .map((img) => (typeof img === "string" ? img : img?.url))
      .filter(Boolean);

  useEffect(() => {
    setPreview(normalize(multiple ? images : images ? [images] : []));
  }, [images, multiple]);

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

        const url = data.url || data.secure_url;

        if (!url) throw new Error("Upload URL dönmedi");

        uploaded.push(url);
      }

      const next = multiple
        ? [...normalize(images), ...uploaded]
        : [uploaded[0]];

      setPreview(next);
      onChange(multiple ? next : next[0]);

      toast.success("Görsel yüklendi");
    } catch (err) {
      toast.error(err.message || "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    const next = preview.filter((i) => i !== url);
    setPreview(next);
    onChange(multiple ? next : next[0] || "");
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {preview.map((url) => (
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
