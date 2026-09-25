async function handleSubmit(e) {
  e.preventDefault();

  try {
    setLoading(true);

    const payload = {
      ...form,
      images: Array.isArray(form.images)
        ? form.images.filter(Boolean)
        : [],
      price: Number(form.price),
      discountedPrice: form.discountedPrice
        ? Number(form.discountedPrice)
        : null,
      stock: Number(form.stock),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: form.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      categoryIds: form.categoryIds,
    };

    const url = productId
      ? `/api/products/${productId}`
      : "/api/products";

    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Bir hata oluştu");
      return;
    }

    toast.success("Kaydedildi");

    // router.refresh() kaldırıldı
    router.replace("/admin/products");
  } catch (err) {
    console.error(err);
    toast.error("Bir hata oluştu");
  } finally {
    setLoading(false);
  }
}
