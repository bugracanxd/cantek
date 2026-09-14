// Admin panelinden yönetilen "Site Tasarımı" ayarlarının varsayılan (default) şekli.
// SiteSettings.data alanında JSON string olarak saklanır.

export const DEFAULT_SETTINGS = {
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

export function mergeSettings(saved) {
  if (!saved) return DEFAULT_SETTINGS;
  return {
    general: { ...DEFAULT_SETTINGS.general, ...(saved.general || {}) },
    header: { ...DEFAULT_SETTINGS.header, ...(saved.header || {}) },
    footer: { ...DEFAULT_SETTINGS.footer, ...(saved.footer || {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(saved.seo || {}) },
    shipping: { ...DEFAULT_SETTINGS.shipping, ...(saved.shipping || {}) },
  };
}

export function settingsToCssVars(settings) {
  const g = settings.general;
  return {
    "--color-primary": g.primaryColor,
    "--color-secondary": g.secondaryColor,
    "--color-button": g.buttonColor,
    "--color-button-text": g.buttonTextColor,
    "--color-text": g.textColor,
    "--color-background": g.backgroundColor,
    "--font-family": g.fontFamily,
    "--font-heading": g.headingFontFamily || "'Playfair Display', serif",
    "--border-radius": g.borderRadius,
    "--site-width": g.siteWidth,
  };
}
