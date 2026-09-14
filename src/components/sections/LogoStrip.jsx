export default function LogoStripSection({ data }) {
  const logos = data.logos || [];
  if (logos.length === 0) return null;
  return (
    <section className="site-container my-10 flex flex-wrap items-center justify-center gap-10 opacity-70">
      {logos.map((logo, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={logo} alt="logo" className="h-8 object-contain" />
      ))}
    </section>
  );
}
