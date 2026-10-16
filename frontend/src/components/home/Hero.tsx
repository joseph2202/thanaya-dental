export default function Hero() {
  return (
    <section className="bg-paper py-16 text-center px-4">
      <span className="bg-mark rounded-full px-4 py-2 text-sm font-bold inline-block">◆ متجر طبي عراقي — مستلزمات وأجهزة</span>
      <h1 className="text-5xl md:text-7xl font-black leading-tight mt-6">
        كل ما تحتاجه عيادتك،
        <br />
        <span className="bg-mark px-2">من أصغر أداة إلى أكبر جهاز.</span>
      </h1>
      <p className="max-w-xl mx-auto text-neutral-600 leading-9 mt-6">
        ثنايا متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة: منتجات موثقة، أسعار بالدينار والدولار، وتوصيل لكل المحافظات.
      </p>
      <div className="flex gap-4 justify-center mt-8 flex-wrap">
        <button className="bg-ink text-paper rounded-full px-7 py-3 font-bold shadow-[4px_4px_0_#FDE047]">تسوق الآن</button>
        <button className="border-2 border-ink rounded-full px-7 py-3 font-bold bg-white">تصفح الأجهزة</button>
      </div>
    </section>
  );
}
