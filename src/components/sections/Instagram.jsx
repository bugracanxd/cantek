export default function InstagramSection({ data }) {
  const images = data.images || [];
  if (images.length === 0) return null;
  return (
    <section className="site-container my-12">
      {data.title && <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-8 text-center">{data.title}</h2>}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={img} alt="Instagram" className="aspect-square object-cover rounded-site" />
        ))}
      </div>
    </section>
  );
}
