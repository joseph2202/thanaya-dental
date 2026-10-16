import { searchProducts, getAllBrands, getAllCategories, getPriceRange } from '@/lib/search';

export const instant = false;
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; brand?: string; sort?: string; minPrice?: string; maxPrice?: string }> }) {
  const params = await searchParams;
  
  const filters = {
    category: params.category,
    brand: params.brand,
    sortBy: params.sort as any,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  };

  const products = searchProducts(filters);
  const brands = getAllBrands();
  const categories = getAllCategories();
  const priceRange = getPriceRange();

  const createQueryString = (key: string, value: string) => {
    const newParams = new URLSearchParams(params as any);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    return newParams.toString();
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-4 text-ink">المنتجات</h1>
        <p className="text-center text-neutral-600 mb-8">{products.length} منتج وجهاز متاح للتسوق</p>

        <div className="grid md:grid-cols-4 gap-6">
          {/* الفلاتر الجانبية */}
          <aside className="md:col-span-1">
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-5 sticky top-24 space-y-6">
              {/* التصنيف */}
              <div>
                <h3 className="font-black mb-3 text-ink">التصنيف</h3>
                <div className="space-y-2">
                  <Link href="/products" className="block text-sm hover:text-brand transition">الكل</Link>
                  {categories.map((c) => (
                    <Link
                      key={c}
                      href={`/products?${createQueryString('category', c)}`}
                      className={`block text-sm transition ${params.category === c ? 'text-brand font-bold' : 'hover:text-brand'}`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>

              {/* الماركة */}
              <div>
                <h3 className="font-black mb-3 text-ink">الماركة</h3>
                <div className="space-y-2">
                  <Link href="/products" className="block text-sm hover:text-brand transition">الكل</Link>
                  {brands.map((b) => (
                    <Link
                      key={b}
                      href={`/products?${createQueryString('brand', b)}`}
                      className={`block text-sm transition ${params.brand === b ? 'text-brand font-bold' : 'hover:text-brand'}`}
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              </div>

              {/* السعر */}
              <div>
                <h3 className="font-black mb-3 text-ink">السعر</h3>
                <form className="space-y-2" action="/products" method="get">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="من"
                    defaultValue={params.minPrice}
                    className="w-full border-2 border-brand/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="إلى"
                    defaultValue={params.maxPrice}
                    className="w-full border-2 border-brand/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                  />
                  <button type="submit" className="w-full bg-brand text-white rounded-lg py-2 text-sm font-bold hover:bg-brand-dark transition">
                    تطبيق
                  </button>
                </form>
              </div>

              {/* إعادة تعيين */}
              <Link href="/products" className="block text-center bg-paper2 border-2 border-brand/30 rounded-lg py-2 text-sm font-bold hover:bg-brand/10 transition">
                إعادة تعيين الفلاتر
              </Link>
            </div>
          </aside>

          {/* المنتجات */}
          <div className="md:col-span-3">
            {/* شريط الترتيب */}
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <span className="font-bold text-sm text-ink">ترتيب حسب:</span>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/products?${createQueryString('sort', 'price-asc')}`} className={`text-sm px-3 py-1 rounded-full transition ${params.sort === 'price-asc' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}`}>
                  السعر: الأقل
                </Link>
                <Link href={`/products?${createQueryString('sort', 'price-desc')}`} className={`text-sm px-3 py-1 rounded-full transition ${params.sort === 'price-desc' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}`}>
                  السعر: الأعلى
                </Link>
                <Link href={`/products?${createQueryString('sort', 'name')}`} className={`text-sm px-3 py-1 rounded-full transition ${params.sort === 'name' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}`}>
                  الاسم
                </Link>
              </div>
            </div>

            {/* شبكة المنتجات */}
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">📦</div>
                <h2 className="text-2xl font-black mb-4 text-ink">لا توجد منتجات</h2>
                <p className="text-neutral-600 mb-8">جرب تغيير الفلاتر</p>
                <Link href="/products" className="bg-brand text-white rounded-full px-8 py-3 font-bold inline-block">
                  عرض كل المنتجات
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:-translate-y-1 transition shadow-[4px_4px_0_#047ba8]"
                  >
                    <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-4xl">{p.emoji}</div>
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
