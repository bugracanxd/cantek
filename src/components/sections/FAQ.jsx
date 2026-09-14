export default function FAQSection({ data }) {
  const items = data.items || [];
  return (
    <section className="site-container my-12 max-w-2xl mx-auto">
      {data.title && <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-6">{data.title}</h2>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <details key={i} className="border rounded-site p-4">
            <summary className="font-medium cursor-pointer">{item.question}</summary>
            <p className="mt-2 text-gray-600 text-sm">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
