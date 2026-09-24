export const metadata = {
  title: "Mesafeli Satış Sözleşmesi | CANTEK",
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Mesafeli Satış Sözleşmesi</h1>

      <div className="space-y-6 text-gray-700 leading-8">
        <p><strong>Son Güncelleme:</strong> 24.09.2026</p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Taraflar</h2>
          <p>
            Bu sözleşme, CANTEK internet mağazası üzerinden verilen siparişlerde
            satıcı ile tüketici arasındaki hak ve yükümlülükleri düzenler.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Sipariş ve Ödeme</h2>
          <p>
            Sipariş, ödemenin PayTR güvenli ödeme sistemi üzerinden başarıyla
            tamamlanmasının ardından onaylanır.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">3. Teslimat</h2>
          <p>
            Siparişler belirtilen teslimat adresine gönderilir ve kargo süreci
            teslimat politikasında belirtilen süreler kapsamında yürütülür.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Cayma Hakkı</h2>
          <p>
            Tüketici, ürünü teslim aldığı tarihten itibaren 14 gün içinde cayma
            hakkını kullanabilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">5. İade</h2>
          <p>
            Onaylanan iadeler, ürün kontrolünün ardından PayTR üzerinden ödeme
            yapılan karta iade edilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Yetkili Merciler</h2>
          <p>
            Uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri
            yetkilidir.
          </p>
        </section>
      </div>
    </main>
  );
}
