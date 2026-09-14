import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings, getMenus } from "@/lib/get-settings";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: settings.seo.title,
    description: settings.seo.metaDescription,
    keywords: settings.seo.keywords,
    icons: { icon: settings.general.favicon },
    openGraph: { images: [settings.seo.ogImage] },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const headerMenus = await getMenus("header");
  const footerMenus = await getMenus("footer");

  const cssVars = {
    "--color-primary": settings.general.primaryColor,
    "--color-secondary": settings.general.secondaryColor,
    "--color-button": settings.general.buttonColor,
    "--color-button-text": settings.general.buttonTextColor,
    "--color-text": settings.general.textColor,
    "--color-background": settings.general.backgroundColor,
    "--font-family": settings.general.fontFamily,
    "--font-heading": settings.general.headingFontFamily || "'Playfair Display', serif",
    "--border-radius": settings.general.borderRadius,
    "--site-width": settings.general.siteWidth,
  };

  return (
    <html lang="tr" style={cssVars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&family=Marcellus&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Header settings={settings} menus={headerMenus} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer settings={settings} menus={footerMenus} />
        </Providers>
      </body>
    </html>
  );
}
