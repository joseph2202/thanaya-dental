export default function OfferBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-mark border-2 border-ink rounded-3xl p-10 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-4">عرض الأسبوع: خصم 20% على الأجهزة</h2>
        <p className="text-neutral-700 leading-8 mb-6">لفترة محدودة — استخدم الكود THANAYA20 عند الدفع.</p>
        <button className="bg-ink text-paper rounded-full px-8 py-3 font-bold shadow-[4px_4px_0_#FAF9F6]">اطلب الآن</button>
      </div>
    </section>
  );
}
