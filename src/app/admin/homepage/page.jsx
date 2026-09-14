"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SectionEditor from "@/components/admin/SectionEditor";

const SECTION_TYPES = [
  { value: "hero", label: "Hero (Ana Banner)" },
  { value: "banner", label: "Banner" },
  { value: "category_grid", label: "Kategori Grid" },
  { value: "product_grid", label: "Ürün Grid" },
  { value: "brand_story", label: "Marka Hikayesi" },
  { value: "features", label: "Özellikler / Avantajlar" },
  { value: "instagram", label: "Instagram" },
  { value: "newsletter", label: "Newsletter" },
  { value: "faq", label: "SSS" },
  { value: "video", label: "Video" },
  { value: "text", label: "Metin" },
  { value: "logo_strip", label: "Logo Alanı" },
];

function SortableRow({ section, onToggle, onDelete, onEdit, isOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm mb-3">
      <div className="flex items-center gap-3 p-4">
        <span {...attributes} {...listeners} className="cursor-grab text-gray-400">⠿</span>
        <div className="flex-1">
          <div className="font-medium">{SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}</div>
          <div className="text-xs text-gray-500">{section.title}</div>
        </div>
        <button onClick={() => onToggle(section)} className={section.isActive ? "text-green-600 text-sm" : "text-gray-400 text-sm"}>
          {section.isActive ? "Aktif" : "Pasif"}
        </button>
        <button onClick={() => onEdit(section)} className="text-blue-600 text-sm">
          {isOpen ? "Kapat" : "Düzenle"}
        </button>
        <button onClick={() => onDelete(section)} className="text-red-600 text-sm">Sil</button>
      </div>
      {isOpen && (
        <div className="border-t p-4">
          <SectionEditor section={section} onSaved={() => onEdit(null)} />
        </div>
      )}
    </div>
  );
}

export default function HomepageBuilder() {
  const [sections, setSections] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [newType, setNewType] = useState("banner");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function load() {
    fetch("/api/admin/homepage-sections").then((r) => r.json()).then((d) => setSections(d.sections || []));
  }
  useEffect(load, []);

  async function handleAdd() {
    const res = await fetch("/api/admin/homepage-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newType, title: "", data: {} }),
    });
    if (!res.ok) return toast.error("Eklenemedi");
    toast.success("Bölüm eklendi");
    load();
  }

  async function toggleActive(section) {
    await fetch(`/api/admin/homepage-sections/${section.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !section.isActive }),
    });
    load();
  }

  async function handleDelete(section) {
    if (!confirm("Bu bölümü silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/homepage-sections/${section.id}`, { method: "DELETE" });
    load();
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);

    await fetch("/api/admin/homepage-sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((s, i) => ({ id: s.id, order: i })) }),
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Ana Sayfa Yönetimi</h1>
      <p className="text-sm text-gray-500 mb-6">Bölümleri sürükleyerek sıralayın, aktif/pasif yapın veya düzenleyin.</p>

      <div className="flex gap-2 mb-6">
        <select className="border rounded-lg px-3 py-2" value={newType} onChange={(e) => setNewType(e.target.value)}>
          {SECTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button onClick={handleAdd} className="bg-black text-white px-4 py-2 rounded-lg text-sm">+ Bölüm Ekle</button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((s) => (
            <SortableRow
              key={s.id}
              section={s}
              isOpen={openId === s.id}
              onToggle={toggleActive}
              onDelete={handleDelete}
              onEdit={(sec) => { setOpenId(sec ? sec.id : null); if (!sec) load(); }}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
