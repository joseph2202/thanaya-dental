import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function OffersPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-8 text-ink">العروض الخاصة</h1>
        <p className="text-center text-neutral-600 mb-12">عروض الأسبوع والشهر — خصومات حصرية</p>
        
        <div className="bg-gradient-to-br from-brand to-brand-dark border-2 border-brand rounded-3xl p-10 text-center mb-12 text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-4">عرض الأسبوع: خصم 20% على الأجهزة</h2>
          <p className="text-white/90 leading-8 mb-6">لفترة محدودة — استخدم الكود THANAYA20 عند الدفع.</p>
          <button className="bg-white text-brand rounded-full px-8 py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition">اطلب الآن</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:border-brand transition">
              <div className="bg-brand/10 text-brand rounded-lg inline-block px-3 py-1 text-sm mb-4 font-bold">خصم {i * 10}%</div>
              <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-4xl">📦</div>
              <h3 className="mb-2 text-ink">منتج بعرض {i}</h3>
              <p className="text-ink font-black text-lg mb-2">00,000 د.ع</p>
              <p className="text-neutral-400 line-through text-sm">00,000 د.ع</p>
              <button className="mt-4 w-full bg-brand text-white rounded-full py-2 font-bold hover:bg-brand-dark transition">أضف للسلة</button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
