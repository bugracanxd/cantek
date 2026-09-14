export default function TextSection({ data }) {
  return (
    <section className="site-container my-10 max-w-2xl mx-auto text-center">
      {data.title && <h2 className="font-heading text-2xl font-semibold mb-3">{data.title}</h2>}
      {data.text && <p className="text-gray-600 leading-relaxed">{data.text}</p>}
    </section>
  );
}
