export default function CheckoutFailedPage({ searchParams }) {
  return (
    <div className="site-container py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">Ödeme Başarısız</h1>
      <p className="text-gray-600">
        Sipariş numaranız: <strong>{searchParams.order}</strong>
      </p>
      <p className="text-gray-500 mt-2 text-sm">Lütfen tekrar deneyin veya farklı bir kart kullanın.</p>
    </div>
  );
}
