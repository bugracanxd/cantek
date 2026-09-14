export default function VideoSection({ data }) {
  if (!data.videoUrl) return null;
  return (
    <section className="site-container my-12">
      {data.title && <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-8 text-center">{data.title}</h2>}
      <div className="aspect-video rounded-site overflow-hidden">
        <iframe
          src={data.videoUrl}
          title={data.title || "Video"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}
