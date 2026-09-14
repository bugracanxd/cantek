import Link from "next/link";
import { Instagram, Facebook, MessageCircle, Music2 } from "lucide-react";

export default function Footer({ settings, menus }) {
  const footer = settings.footer;
  const general = settings.general;

  return (
    <footer className="bg-black text-white mt-16">
      <div className="site-container py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        <div>
          <h3 className="font-heading text-xl mb-3">{general.siteName}</h3>
          <p className="opacity-70 leading-relaxed">{footer.aboutText}</p>
          <div className="flex gap-4 mt-5">
            {footer.instagram && (
              <a href={footer.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-200">
                <Instagram size={16} strokeWidth={1.75} />
              </a>
            )}
            {footer.facebook && (
              <a href={footer.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-200">
                <Facebook size={16} strokeWidth={1.75} />
              </a>
            )}
            {footer.tiktok && (
              <a href={footer.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-200">
                <Music2 size={16} strokeWidth={1.75} />
              </a>
            )}
            {footer.whatsapp && (
              <a href={footer.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-200">
                <MessageCircle size={16} strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 tracking-wide text-xs uppercase opacity-60">Kurumsal</h4>
          <ul className="space-y-2.5 opacity-80">
            {menus.map((m) => (
              <li key={m.id}>
                <Link href={m.url} className="hover:opacity-100 hover:pl-1 transition-all duration-200">{m.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 tracking-wide text-xs uppercase opacity-60">İletişim</h4>
          <ul className="space-y-2.5 opacity-80">
            <li>{footer.phone}</li>
            <li>{footer.email}</li>
            <li>{footer.address}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 tracking-wide text-xs uppercase opacity-60">Bülten</h4>
          <p className="opacity-70 mb-4">Kampanyalardan ilk siz haberdar olun.</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-3 py-2.5 rounded-site text-black text-sm outline-none focus:ring-2 focus:ring-[var(--color-secondary)] transition-shadow"
            />
            <button type="submit" className="btn-primary px-4 py-2.5 text-sm">Katıl</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-60">
        {footer.copyrightText}
      </div>
    </footer>
  );
}
