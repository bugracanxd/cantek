"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Menu as MenuIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Link as LinkIcon,
  Search,
  Home,
  Package,
  Percent,
  Shirt,
  Footprints,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Anasayfa", url: "/", icon: Home },
  { label: "Ürünler", url: "/products", icon: Package },
  { label: "Erkek", url: "/category/erkek", icon: Shirt },
  { label: "Kadın", url: "/category/kadin", icon: Footprints },
  { label: "İndirim", url: "/sale", icon: Percent },
];

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
  const [location, setLocation] = useState("header");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    label: "",
    url: "",
  });

  function load() {
    fetch("/api/admin/menus")
      .then((r) => r.json())
      .then((d) => setMenus(d.menus || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    if (!form.label.trim() || !form.url.trim()) {
      toast.error("Menü adı ve link zorunlu");
      return;
    }

    setCreating(true);

    const res = await fetch("/api/admin/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        location,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      toast.error("Eklenemedi");
      return;
    }

    toast.success("Menü eklendi");
    setForm({ label: "", url: "" });
    load();
  }

  async function addQuick(item) {
    const exists = menus.some(
      (m) =>
        m.location === location &&
        m.label.toLowerCase() === item.label.toLowerCase()
    );

    if (exists) {
      toast("Bu menü zaten ekli.");
      return;
    }

    const res = await fetch("/api/admin/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label: item.label,
        url: item.url,
        location,
      }),
    });

    if (!res.ok) {
      toast.error("Eklenemedi");
      return;
    }

    toast.success(`${item.label} eklendi`);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Bu menü silinsin mi?")) return;

    await fetch(`/api/admin/menus/${id}`, {
      method: "DELETE",
    });

    toast.success("Silindi");
    load();
  }

  async function move(menu, direction) {
    const list = menus
      .filter((m) => m.location === menu.location)
      .sort((a, b) => a.order - b.order);

    const idx = list.findIndex((m) => m.id === menu.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;

    if (swapIdx < 0 || swapIdx >= list.length) return;

    const other = list[swapIdx];

    await Promise.all([
      fetch(`/api/admin/menus/${menu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: other.order }),
      }),
      fetch(`/api/admin/menus/${other.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: menu.order }),
      }),
    ]);

    load();
  }

  const filtered = useMemo(() => {
    return menus
      .filter((m) => m.location === location)
      .filter(
        (m) =>
          m.label.toLowerCase().includes(search.toLowerCase()) ||
          m.url.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.order - b.order);
  }, [menus, location, search]);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <MenuIcon size={16} />
            <span>Admin Panel</span>
            <span>/</span>
            <span className="text-gray-900">Menüler</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Menü Yönetimi
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Header ve Footer menülerini buradan yönetebilirsin.
          </p>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Toplam Menü</p>
            <p className="mt-2 text-3xl font-bold">{menus.length}</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Header</p>
            <p className="mt-2 text-3xl font-bold">
              {menus.filter((m) => m.location === "header").length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Footer</p>
            <p className="mt-2 text-3xl font-bold">
              {menus.filter((m) => m.location === "footer").length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Aktif Liste</p>
            <p className="mt-2 text-3xl font-bold">{filtered.length}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-3">
          {["header", "footer"].map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                location === loc
                  ? "bg-black text-white"
                  : "border bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {loc === "header" ? "Header Menüsü" : "Footer Menüsü"}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* SOL */}
          <div className="space-y-6">
            {/* FORM */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                    <Plus size={18} />
                  </div>

                  <div>
                    <h2 className="font-semibold">Yeni Menü</h2>
                    <p className="text-xs text-gray-500">
                      Yeni bir bağlantı ekle.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleCreate}
                className="space-y-4 p-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Menü Adı
                  </label>

                  <input
                    required
                    placeholder="Örn: Erkek"
                    value={form.label}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        label: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border bg-gray-50 px-3 py-3 text-sm outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Link
                  </label>

                  <div className="relative">
                    <LinkIcon
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      required
                      placeholder="/products"
                      value={form.url}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          url: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border bg-gray-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-black focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  disabled={creating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  <Plus size={16} />
                  {creating ? "Ekleniyor..." : "Menü Ekle"}
                </button>
              </form>
            </div>

            {/* QUICK LINKS */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="font-semibold">Hazır Linkler</h2>
                <p className="text-xs text-gray-500">
                  Tek dokunuşla menüye ekle.
                </p>
              </div>

              <div className="space-y-2 p-5">
                {QUICK_LINKS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      onClick={() => addQuick(item)}
                      className="flex w-full items-center justify-between rounded-xl border p-3 transition hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <Icon size={16} />
                        </div>

                        <div className="text-left">
                          <p className="text-sm font-medium">
                            {item.label}
                          </p>

                          <p className="text-xs text-gray-500">
                            {item.url}
                          </p>
                        </div>
                      </div>

                      <Plus size={16} className="text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SAĞ */}
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Menü Öğeleri</h2>
                <p className="text-xs text-gray-500">
                  {filtered.length} öğe gösteriliyor
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  placeholder="Ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black focus:bg-white"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <MenuIcon size={24} className="text-gray-400" />
                </div>

                <p className="font-medium text-gray-900">
                  Menü bulunamadı
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Soldan yeni bir menü ekleyebilir veya
                  "Ürünler"i tek tıkla ekleyebilirsin.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">
                        {m.label}
                      </div>

                      <div className="truncate text-xs text-gray-500">
                        {m.url}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => move(m, "up")}
                        className="rounded-lg border p-2 hover:bg-gray-50"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        onClick={() => move(m, "down")}
                        className="rounded-lg border p-2 hover:bg-gray-50"
                      >
                        <ArrowDown size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
