const items = ["توصيل لكل المحافظات", "أسعار بالدينار والدولار", "منتجات موثقة", "دفع عند الاستلام", "ضمان سنة", "دعم فني"];

export default function Ticker() {
  return (
    <div className="bg-brand text-white py-3 overflow-hidden">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="font-bold">◆ {t}</span>
        ))}
      </div>
    </div>
  );
}
