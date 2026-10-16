import Link from 'next/link';

export default function OfferBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-brand to-brand-dark border-2 border-brand rounded-3xl p-10 text-center text-white">
        <h2 className="text-3xl md:text-5xl font-black mb-4">عرض الأسبوع: خصم 20% على الأجهزة</h2>
        <p className="text-white/90 leading-8 mb-6">لفترة محدودة — استخدم الكود THANAYA20 عند الدفع.</p>
        <Link href="/offers" className="inline-block bg-white text-brand rounded-full px-8 py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition">
          اطلب الآن
        </Link>
      </div>
    </section>
  );
}
