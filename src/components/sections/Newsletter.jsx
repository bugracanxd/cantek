export default function NewsletterSection({ data }) {
  return (
    <section className="bg-gray-50 py-12 my-12">
      <div className="site-container text-center max-w-lg mx-auto">
        {data.title && <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-2">{data.title}</h2>}
        {data.description && <p className="text-gray-600 mb-6">{data.description}</p>}
        <form className="flex gap-2">
          <input type="email" placeholder="E-posta adresiniz" className="flex-1 border px-4 py-3 rounded-site" />
          <button type="submit" className="btn-primary px-6 py-3">Abone Ol</button>
        </form>
      </div>
    </section>
  );
}
