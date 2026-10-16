import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CategoriesPage() {
  const cats = [
    { name: "مستلزمات طبية", icon: "🩺", desc: "كل المستلزمات الأساسية" },
    { name: "طب الأسنان", icon: "🦷", desc: "أدوات ومعدات الأسنان" },
    { name: "أجهزة طبية", icon: "🖥️", desc: "أجهزة متطورة" },
    { name: "مختبرات", icon: "🧪", desc: "معدات المختبرات" },
    { name: "تعقيم", icon: "", desc: "مواد وأجهزة التعقيم" },
    { name: "كراسي ومتحركة", icon: "🪑", desc: "كراسي المرضى والمتحركة" },
  ];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-8">التصنيفات</h1>
        <p className="text-center text-neutral-600 mb-12">اختر التصنيف اللي تريد تتصفحه</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((c) => (
            <div key={c.name} className="bg-white border-2 border-ink rounded-2xl p-8 text-center font-bold hover:bg-mark hover:-translate-y-2 transition cursor-pointer">
              <span className="text-5xl block mb-4">{c.icon}</span>
              <h3 className="text-xl mb-2">{c.name}</h3>
              <p className="text-neutral-600 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
