import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { products } from '@/data/products';

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-4">المنتجات</h1>
        <p className="text-center text-neutral-600 mb-12">{products.length} منتج وجهاز متاح للتسوق</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="bg-white border-2 border-ink rounded-2xl p-6 font-bold hover:-translate-y-1 transition shadow-[4px_4px_0_#0a0a0a] hover:shadow-[6px_6px_0_#0a0a0a]"
            >
              <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-4xl">{p.emoji}</div>
              {p.badge && (
                <span className="inline-block bg-mark border border-ink rounded-full px-2 py-0.5 text-xs mb-2">
                  {p.badge === 'new' ? 'جديد' : p.badge === 'sale' ? 'خصم' : 'مطلوب'}
                </span>
              )}
              <h3 className="mb-1 text-sm">{p.name}</h3>
              <p className="text-xs text-neutral-500 mb-2">{p.brand}</p>
              <p className="text-brand font-black">{p.price.toLocaleString()} د.ع</p>
              <p className="text-xs text-neutral-400">≈ {p.usdPrice} دولار</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
