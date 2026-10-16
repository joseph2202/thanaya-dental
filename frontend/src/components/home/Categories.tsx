import Link from 'next/link';

const cats = [
  { name: "مستلزمات طبية", icon: "" },
  { name: "طب الأسنان", icon: "🦷" },
  { name: "أجهزة طبية", icon: "🖥️" },
  { name: "مختبرات", icon: "" },
  { name: "تعقيم", icon: "🧼" },
  { name: "كراسي ومتحركة", icon: "🪑" },
];

export default function Categories() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-ink">تصفح التصنيفات</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cats.map((c) => (
          <Link
            key={c.name}
            href={`/products?category=${encodeURIComponent(c.name)}`}
            className="bg-white border-2 border-brand/20 rounded-2xl p-6 text-center font-bold hover:bg-brand hover:text-white hover:border-brand hover:-translate-y-1 transition"
          >
            <span className="text-3xl block mb-2">{c.icon}</span>
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
