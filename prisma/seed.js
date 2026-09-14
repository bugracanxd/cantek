require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@cantek.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: "CANTEK Admin", email: adminEmail, passwordHash, role: "ADMIN" },
  });
  console.log(`✔ Admin kullanıcı hazır: ${adminEmail}`);

  // Varsayılan site ayarları (src/lib/theme.js ile aynı şekil - ESM/CJS
  // uyumsuzluğu olmaması için burada ayrıca tanımlandı)
  const DEFAULT_SETTINGS = {
    general: {
      siteName: "CANTEK",
      siteDescription: "Premium erkek ayakkabı markası",
      logo: "/uploads/logo-placeholder.svg",
      favicon: "/favicon.ico",
      primaryColor: "#111111",
      secondaryColor: "#C9A66B",
      buttonColor: "#111111",
      buttonTextColor: "#FFFFFF",
      textColor: "#1A1A1A",
      backgroundColor: "#FFFFFF",
      fontFamily: "'Poppins', sans-serif",
      headingFontFamily: "'Playfair Display', serif",
      borderRadius: "6px",
      siteWidth: "1280px",
    },
    header: {
      height: "80px",
      backgroundColor: "#FFFFFF",
      textColor: "#111111",
      showSearch: true,
      showAccount: true,
      showCart: true,
    },
    footer: {
      aboutText: "CANTEK, şıklığı ve konforu bir araya getiren premium erkek ayakkabı markasıdır.",
      phone: "+90 212 000 00 00",
      email: "info@cantek.com",
      address: "İstanbul, Türkiye",
      instagram: "https://instagram.com/cantek",
      facebook: "https://facebook.com/cantek",
      tiktok: "https://tiktok.com/@cantek",
      whatsapp: "https://wa.me/905000000000",
      copyrightText: "© 2026 CANTEK. Tüm hakları saklıdır.",
    },
    seo: {
      title: "CANTEK | Premium Erkek Ayakkabı",
      metaDescription: "CANTEK ile şıklığı ve konforu keşfedin.",
      keywords: "erkek ayakkabı, premium ayakkabı, cantek",
      ogImage: "/uploads/og-placeholder.svg",
    },
    shipping: {
      flatRate: 49.9,
      freeShippingThreshold: 1500,
    },
  };

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", data: JSON.stringify(DEFAULT_SETTINGS) },
  });
  console.log("✔ Site ayarları hazır");

  // Header/footer menüleri
  const headerMenus = [
    { label: "Tüm Ürünler", url: "/products" },
    { label: "Klasik", url: "/category/klasik" },
    { label: "Spor", url: "/category/spor" },
    { label: "Çizme", url: "/category/cizme" },
  ];
  for (let i = 0; i < headerMenus.length; i++) {
    const existing = await prisma.menu.findFirst({ where: { label: headerMenus[i].label, location: "header" } });
    if (!existing) {
      await prisma.menu.create({ data: { ...headerMenus[i], location: "header", order: i } });
    }
  }

  const footerMenus = [
    { label: "Hakkımızda", url: "/hakkimizda" },
    { label: "İletişim", url: "/iletisim" },
    { label: "Kargo & İade", url: "/kargo-iade" },
    { label: "Gizlilik Politikası", url: "/gizlilik" },
  ];
  for (let i = 0; i < footerMenus.length; i++) {
    const existing = await prisma.menu.findFirst({ where: { label: footerMenus[i].label, location: "footer" } });
    if (!existing) {
      await prisma.menu.create({ data: { ...footerMenus[i], location: "footer", order: i } });
    }
  }
  console.log("✔ Menüler hazır");

  // Kategoriler
  const categoriesData = [
    { name: "Klasik", slug: "klasik" },
    { name: "Spor", slug: "spor" },
    { name: "Çizme", slug: "cizme" },
  ];
  const categories = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, isActive: true },
    });
    categories[c.slug] = cat;
  }
  console.log("✔ Kategoriler hazır");

  // Örnek ürünler
  const productsData = [
    {
      name: "CANTEK Oxford Klasik",
      slug: "cantek-oxford-klasik",
      description: "Gerçek deriden üretilmiş, iş ve özel günler için ideal klasik oxford ayakkabı.",
      price: 2499,
      discountedPrice: 1999,
      sku: "CTK-OXF-001",
      stock: 25,
      sizes: JSON.stringify(["40", "41", "42", "43", "44", "45"]),
      colors: JSON.stringify(["Siyah", "Kahverengi"]),
      categoryId: categories["klasik"].id,
      isFeatured: true,
      isNew: true,
    },
    {
      name: "CANTEK Urban Sneaker",
      slug: "cantek-urban-sneaker",
      description: "Günlük kullanım için konforlu, hafif ve şık spor ayakkabı.",
      price: 1799,
      sku: "CTK-SNK-002",
      stock: 40,
      sizes: JSON.stringify(["40", "41", "42", "43", "44"]),
      colors: JSON.stringify(["Beyaz", "Siyah"]),
      categoryId: categories["spor"].id,
      isFeatured: true,
      isBestSeller: true,
    },
    {
      name: "CANTEK Chelsea Boot",
      slug: "cantek-chelsea-boot",
      description: "Kışlık kullanım için su geçirmez, gerçek deri Chelsea bot.",
      price: 2999,
      sku: "CTK-BOOT-003",
      stock: 15,
      sizes: JSON.stringify(["41", "42", "43", "44", "45"]),
      colors: JSON.stringify(["Kahverengi"]),
      categoryId: categories["cizme"].id,
      isNew: true,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("✔ Örnek ürünler hazır");

  // Ana sayfa bölümleri
  const existingSections = await prisma.homepageSection.count();
  if (existingSections === 0) {
    const sections = [
      { type: "hero", order: 0, data: { title: "CANTEK", subtitle: "Şıklığı ve konforu bir arada yaşayın.", buttonText: "Koleksiyonu Keşfet", buttonLink: "/category/klasik" } },
      { type: "category_grid", order: 1, data: { title: "Kategoriler", limit: 3 } },
      { type: "product_grid", order: 2, data: { title: "Öne Çıkan Ürünler", filter: "featured", limit: 8 } },
      { type: "product_grid", order: 3, data: { title: "Yeni Ürünler", filter: "new", limit: 4 } },
      { type: "brand_story", order: 4, data: { title: "CANTEK Hikayesi", text: "CANTEK, 2010 yılından bu yana İtalyan deri ustalığını modern tasarımla buluşturuyor." } },
      { type: "newsletter", order: 5, data: { title: "Kampanyalardan Haberdar Olun", description: "E-posta listemize katılın." } },
    ];
    for (const s of sections) {
      await prisma.homepageSection.create({
        data: { type: s.type, order: s.order, title: "", isActive: true, data: JSON.stringify(s.data) },
      });
    }
    console.log("✔ Ana sayfa bölümleri hazır");
  }

  console.log("\n🎉 Seed tamamlandı.");
  console.log(`   Admin giriş: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
