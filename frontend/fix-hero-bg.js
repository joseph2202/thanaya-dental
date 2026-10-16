const fs = require('fs');

// تحديث Hero.tsx - إزالة الخلفية الصلبة
fs.writeFileSync('src/components/home/Hero.tsx', `export default function Hero() {
  return (
    <section className="py-16 text-center px-4">
      <span className="bg-brand/10 text-brand border border-brand/30 rounded-full px-4 py-2 text-sm font-bold inline-block">◆ متجر طبي عراقي — مستلزمات وأجهزة</span>
      <h1 className="text-5xl md:text-7xl font-black leading-tight mt-6 text-ink">
        كل ما تحتاجه عيادتك،
        <br />
        <span className="text-brand">من أصغر أداة إلى أكبر جهاز.</span>
      </h1>
      <p className="max-w-xl mx-auto text-neutral-600 leading-9 mt-6">
        الثنايا متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة: منتجات موثقة، أسعار بالدينار والدولار، وتوصيل لكل المحافظات.
      </p>
      <div className="flex gap-4 justify-center mt-8 flex-wrap">
        <button className="bg-brand text-white rounded-full px-7 py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition">تسوق الآن</button>
        <button className="border-2 border-ink rounded-full px-7 py-3 font-bold bg-white hover:bg-paper2 transition">تصفح الأجهزة</button>
      </div>
    </section>
  );
}
`);

console.log('✅ تم إصلاح خلفية الـ Hero');
console.log(' الآن الـ pattern الطبي راح يظهر بكل الأقسام');
