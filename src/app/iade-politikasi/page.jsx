export const metadata = {
  title: "İade Politikası | CANTEK",
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">İade Politikası</h1>

      <div className="space-y-6 text-gray-700 leading-8">
        <p><strong>Son Güncelleme:</strong> 24.09.2026</p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">İade Şartları</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade talebi oluşturabilirsiniz.</li>
            <li>Ürün kullanılmamış olmalıdır.</li>
            <li>Orijinal kutusu ve ambalajıyla gönderilmelidir.</li>
            <li>Etiketleri çıkarılmamış olmalıdır.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">İade Edilemeyen Ürünler</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Kullanılmış ürünler.</li>
            <li>Hijyen nedeniyle tekrar satılamayan ürünler.</li>
            <li>Müşteri kaynaklı zarar görmüş ürünler.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">İade Süreci</h2>
          <ol className="list-decimal ml-6 space-y-2">
            <li>İade talebinizi oluşturun.</li>
            <li>Talebiniz incelenir.</li>
            <li>Onaylanması halinde ürünü tarafımıza gönderin.</li>
            <li>Ürün kontrol edildikten sonra PayTR üzerinden ödeme yaptığınız karta iade gerçekleştirilir.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">İade Süresi</h2>
          <p>
            İade işlemi onaylandıktan sonra ücretin hesabınıza yansıma süresi bankanıza bağlı olarak değişebilir.
          </p>
        </section>
      </div>
    </main>
  );
}
