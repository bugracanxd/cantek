export default function FeaturesSection({ data }) {
  const items = data.items || [];
  return (
    <section className="site-container my-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {items.map((item, i) => (
        <div key={i}>
          <div className="text-3xl mb-2">{item.icon || "✓"}</div>
          <div className="font-semibold text-sm">{item.title}</div>
          {item.description && <div className="text-xs text-gray-500 mt-1">{item.description}</div>}
        </div>
      ))}
    </section>
  );
}
