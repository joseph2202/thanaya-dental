import { searchProducts } from '@/lib/search';

export const instant = false;
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductIcon from '@/components/ui/ProductIcon';
import Link from 'next/link';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q || '';
  const results = searchProducts({ query });

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-4 text-ink">نتائج البحث</h1>
        <p className="text-neutral-600 mb-8">
          {results.length > 0
            ? `عُثر على ${results.length} نتيجة لـ "${query}"`
            : `لم يُعثر على نتائج لـ "${query}"`}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-2xl font-black mb-4 text-ink">لا توجد نتائج</h2>
            <p className="text-neutral-600 mb-8">جرب كلمات بحث مختلفة أو تصفح المنتجات</p>
            <Link href="/products" className="bg-brand text-white rounded-full px-8 py-3 font-bold inline-block shadow-[4px_4px_0_#047ba8]">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:-translate-y-1 transition shadow-[4px_4px_0_#047ba8]"
              >
                <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-brand"><ProductIcon name={p.icon} size={64} /></div>
                {p.badge && (
                  <span className="inline-block bg-brand/10 text-brand border border-brand/30 rounded-full px-2 py-0.5 text-xs mb-2">
                    {p.badge === 'new' ? 'جديد' : p.badge === 'sale' ? 'خصم' : 'مطلوب'}
                  </span>
                )}
                <h3 className="mb-1 text-sm text-ink">{p.name}</h3>
                <p className="text-xs text-neutral-500 mb-2">{p.brand}</p>
                <p className="text-ink font-black text-lg">{p.price.toLocaleString()} د.ع</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
