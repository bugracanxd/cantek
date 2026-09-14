# CANTEK E-Ticaret Platformu

Next.js 14 (App Router) + Prisma + PostgreSQL + NextAuth + PAYTR ile geliştirilmiş,
tamamı admin panelinden yönetilebilen premium erkek ayakkabı e-ticaret sitesi.

## Teknoloji Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend:** Next.js API Routes (Node.js runtime)
- **Veritabanı:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Credentials + JWT session, bcrypt şifreleme)
- **Ödeme:** PAYTR iFrame API (gerçek entegrasyon, server-side token + callback doğrulama)
- **State:** React Context (sepet), Zustand kurulu (ileride genişletmek isterseniz)
- **Sürükle-bırak:** @dnd-kit (ana sayfa bölüm sıralaması için)

## Klasör Yapısı

```
cantek/
├── prisma/
│   ├── schema.prisma       # Tüm veritabanı şeması
│   └── seed.js             # İlk admin kullanıcı + örnek veri
├── public/
│   └── uploads/            # Yüklenen görseller (logo, ürün, banner vb.)
├── src/
│   ├── app/
│   │   ├── (mağaza sayfaları: /, /products/[slug], /category/[slug], /cart, /checkout, /login, /register, /account...)
│   │   ├── admin/           # Admin panel sayfaları
│   │   └── api/             # Tüm API route'ları (public + admin)
│   ├── components/          # Header, Footer, ProductCard, homepage section bileşenleri, admin bileşenleri
│   ├── context/CartContext.jsx
│   └── lib/                 # prisma client, auth, paytr, validations, theme, vb.
├── middleware.js            # /admin ve /api/admin korumasi
├── .env.example
└── package.json
```

## Yerelde Çalıştırma

1. Bağımlılıkları kurun:
   ```
   npm install
   ```

2. `.env.example` dosyasını `.env` olarak kopyalayın ve doldurun:
   ```
   cp .env.example .env
   ```
   En azından `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` girilmeli.
   PAYTR bilgileri olmadan da site çalışır, sadece ödeme adımı test/gerçek
   PAYTR hesabı olmadan tamamlanamaz.

3. Veritabanı şemasını oluşturun ve örnek verileri yükleyin:
   ```
   npm run db:push
   npm run db:seed
   ```
   Bu size bir admin kullanıcı oluşturur (`.env` içindeki `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

4. Geliştirme sunucusunu başlatın:
   ```
   npm run dev
   ```
   Site: http://localhost:3000
   Admin panel: http://localhost:3000/admin/login

5. Production build almak için:
   ```
   npm run build
   npm run start
   ```

## Veritabanı Bağlantısı

Local geliştirme için Postgres kurmak istemiyorsanız `prisma/schema.prisma`
içindeki `provider = "postgresql"` satırını `"sqlite"` yapıp
`DATABASE_URL="file:./dev.db"` kullanabilirsiniz — ancak **production'da
mutlaka PostgreSQL kullanın** (Railway, Supabase, Neon, Render gibi
sağlayıcılardan birini seçebilirsiniz). `DATABASE_URL`'i o sağlayıcının
panelinden alıp `.env` dosyanıza (ve hosting sağlayıcınızın environment
variable ayarlarına) yapıştırmanız yeterli.

## Environment Variable'lar Nereye Konur?

- **Yerelde:** proje kök dizinindeki `.env` dosyasına.
- **Vercel:** Project Settings → Environment Variables.
- **Railway/Render:** Service → Variables sekmesi.

`.env` dosyası `.gitignore` içinde olduğundan Git'e gönderilmez — bu
kasıtlıdır, gizli bilgileri (PAYTR anahtarları, veritabanı şifresi) asla
repoya koymayın.

## PAYTR Entegrasyonu Nasıl Bağlanır?

1. https://www.paytr.com üzerinden bir Mağaza hesabı açın (veya mevcut
   hesabınıza girin).
2. Mağaza Paneli → **Mağaza Bilgilerim** sayfasından şunları alın:
   - Merchant ID
   - Merchant Key
   - Merchant Salt
3. Bunları `.env` dosyanıza / hosting environment variable'larınıza girin:
   ```
   PAYTR_MERCHANT_ID=...
   PAYTR_MERCHANT_KEY=...
   PAYTR_MERCHANT_SALT=...
   PAYTR_TEST_MODE=1   # canlıya geçince "0" yapın
   ```
4. PAYTR Mağaza Paneli'nde **Bildirim URL (Callback URL)** alanına şunu
   girin:
   ```
   https://SIZINDOMAININIZ.com/api/payment/paytr/callback
   ```
   Bu URL, PAYTR'nin ödeme sonucunu sunucunuza bildirdiği adrestir.
   Sipariş durumu **yalnızca** bu callback doğrulandıktan sonra
   `paid` olarak işaretlenir — frontend'in kendi başına "ödeme başarılı"
   kararı vermesi mümkün değildir (kod içinde bilerek böyle tasarlandı).
5. Test kartlarıyla önce `PAYTR_TEST_MODE=1` ile deneyin, sorunsuz
   çalıştığını gördükten sonra `PAYTR_TEST_MODE=0` yapıp canlıya alın.

**Önemli:** Merchant Key ve Merchant Salt hiçbir zaman frontend koduna
veya tarayıcıya gönderilmez; tüm PAYTR işlemleri `src/lib/paytr.js`
içinde yalnızca sunucu tarafında (API route'ları içinde) çalışır.

## Domain Bağlama ve HTTPS

- **Vercel ile deploy ederseniz:** Project → Settings → Domains
  kısmından domaininizi ekleyin, Vercel DNS talimatlarını (CNAME/A kaydı)
  verir, bunları alan adı sağlayıcınızın (GoDaddy, Natro, vb.) DNS
  panelinden ekleyin. HTTPS sertifikası Vercel tarafından otomatik
  sağlanır — ekstra bir şey yapmanız gerekmez.
- **Kendi sunucunuzda (VPS) çalıştırırsanız:** Nginx/Caddy reverse proxy
  kurup Let's Encrypt (certbot) ile ücretsiz SSL sertifikası
  alabilirsiniz.
- Domaini bağladıktan sonra `.env` içindeki `NEXTAUTH_URL` ve
  `NEXT_PUBLIC_SITE_URL` değerlerini gerçek domaininizle güncelleyin
  (örn. `https://cantek.com`), aksi halde giriş sistemi ve PAYTR
  yönlendirme linkleri yanlış çalışır.

## Production'a Deploy Etme (Örnek: Vercel + Railway)

1. Kod deposunu GitHub'a (veya GitLab) push edin.
2. **Veritabanı:** Railway/Supabase/Neon üzerinde bir PostgreSQL
   instance oluşturun, `DATABASE_URL`'i alın.
3. **Vercel:** GitHub reponuzu Vercel'e bağlayın, "Import Project"
   deyin. Environment Variables kısmına `.env.example` içindeki tüm
   değişkenleri gerçek değerleriyle girin.
4. Deploy başladığında Vercel otomatik olarak `npm install` ve
   `npm run build` çalıştırır (build script'i `postinstall` ile
   `prisma generate` de otomatik çalışır).
5. İlk deploy sonrası, veritabanı şemasını canlı veritabanına da
   uygulamanız gerekir. Yerel makinenizden (canlı `DATABASE_URL`'i
   `.env`'e geçici olarak koyup) şunu çalıştırın:
   ```
   npm run db:push
   npm run db:seed
   ```
6. PAYTR panelinden callback URL'sini canlı domaininize göre güncelleyin.
7. Admin panelden (`/admin/login`) giriş yapıp Site Tasarımı, Ana Sayfa,
   Ürünler vb. bölümlerini kendi içeriğinizle doldurun.

## Neler Admin Panelinden Yönetilebiliyor?

- **Dashboard:** satış istatistikleri, sipariş sayıları, düşük stok uyarısı
- **Ürünler:** ekle/düzenle/sil, çoklu görsel, beden/renk, öne çıkan/yeni/çok satan etiketleri, SEO alanları
- **Kategoriler:** ekle/düzenle/sil, görsel, aktif/pasif
- **Siparişler:** listele, detay görüntüle, durum güncelle
- **Müşteriler:** listele
- **Kuponlar:** yüzde/sabit indirim, minimum sepet tutarı, kullanım limiti
- **Ana Sayfa:** bölüm ekle/sil/gizle/göster, **sürükle-bırak ile sırala**, her bölümün başlık/görsel/buton/link gibi alanlarını düzenle
- **Site Tasarımı:** logo, favicon, renkler (ana/ikincil/buton/yazı/arka plan), font, border radius, site genişliği, header ve footer ayarları — **Taslağı Kaydet** (önizleme) / **Yayınla** akışı
- **Menüler:** header ve footer menü öğeleri, sıralama
- **Bannerlar:** masaüstü/mobil görsel, başlık, buton
- **SEO:** site title, meta description, keywords, OG image

## Güvenlik Notları

- Şifreler bcrypt ile hashlenir (12 round)
- Admin sayfaları ve `/api/admin/*` route'ları hem middleware hem route
  seviyesinde JWT + rol kontrolüyle korunur
- Sipariş toplamları **daima sunucuda, veritabanındaki gerçek fiyatlardan**
  yeniden hesaplanır — frontend'den gelen fiyat bilgisine güvenilmez
- PAYTR callback'i HMAC-SHA256 imza doğrulamasından geçirilir,
  doğrulanamayan istekler reddedilir; aynı sipariş için tekrar gelen
  callback'ler (`paytrProcessed` alanı ile) tekrar işlenmez
- Temel input validasyonu Zod ile yapılır
- Basit in-memory rate limiting (register, sipariş oluşturma) — yüksek
  trafikli production için Redis tabanlı bir çözüm (örn. Upstash
  Ratelimit) önerilir
- Güvenlik header'ları (`X-Frame-Options`, `X-Content-Type-Options` vb.)
  `next.config.js` içinde tanımlıdır

## Bilmeniz Gereken Sınırlamalar / Ek Yapılması Gerekenler

Bu proje çalışır durumda, gerçek entegrasyonlara sahip TAM bir temel
sunar; ancak dürüst olmak gerekirse şu noktalar sizin (veya bir
geliştiricinin) tamamlaması gereken gerçek dünya adımlarıdır — hiçbiri
sahte/mock değildir, sadece gerçek hesap/servis bilgisi gerektirir:

1. **PAYTR hesabı** olmadan ödeme adımı test edilemez (kod PAYTR'nin
   resmi iFrame API akışını uygular, ama gerçek Merchant ID/Key/Salt
   girilmeden `get-token` isteği başarısız döner — bu beklenen bir
   davranıştır, sahte bir "başarılı" sonuç asla üretilmez).
2. **Dosya yükleme** şu an sunucunun yerel diskine (`public/uploads`)
   yazıyor. Vercel gibi "serverless/ephemeral" hosting'lerde bu klasör
   her deploy'da sıfırlanır. Production için Cloudinary, AWS S3 veya
   Vercel Blob gibi kalıcı bir depolama servisine geçmenizi öneririz
   (`src/app/api/admin/upload/route.js` dosyasını değiştirmeniz yeterli).
3. **E-posta gönderimi** (sipariş onayı, şifremi unuttum vb.) bu sürümde
   yok — Resend, SendGrid veya benzeri bir servis eklemeniz gerekir.
4. Bu ortamda internet erişimi olmadığı için `npm install` /
   `npm run build` sizin makinenizde/sunucunuzda ilk kez çalıştırılacak;
   kod, resmi Next.js/Prisma/NextAuth dokümantasyonlarına uygun
   yazılmıştır ama gerçek bir kurulumda küçük paket sürüm
   uyumsuzlukları çıkarsa `npm install` çıktısındaki hatayı bana
   iletebilirsiniz.
