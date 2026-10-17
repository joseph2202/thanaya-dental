import { productsAPI, categoriesAPI, getAllBrands } from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import ProductIcon from '@/components/ui/ProductIcon';

export const instant = false;

// دالة مساعدة لجلب الماركات (مؤقتاً من المنتجات)
async function getBrandsFromAPI() {
  const products = await productsAPI.getAll();
  return [...new Set(products.map((p: any) => p.brand))];
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; brand?: string; sort?: string; minPrice?: string; maxPrice?: string; search?: string }> }) {
  const params = await searchParams;
  
  const apiParams: any = {};
  if (params.category) apiParams.category = params.category;
  if (params.brand) apiParams.brand = params.brand;
  if (params.sort) apiParams.sort = params.sort;
  if (params.search) apiParams.search = params.search;

  const [products, categories, brands] = await Promise.all([
    productsAPI.getAll(apiParams),
    categoriesAPI.getAll().catch(() => []),
    getBrandsFromAPI()
  ]);

  const createQueryString = (key: string, value: string) => {
    const newParams = new URLSearchParams(params as any);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    return newParams.toString();
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-4 text-ink">المنتجات</h1>
        <p className="text-center text-neutral-600 mb-8">{products.length} منتج وجهاز متاح للتسوق</p>

        <div className="grid md:grid-cols-4 gap-6">
          <aside className="md:col-span-1">
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-5 sticky top-24 space-y-6">
              <div>
                <h3 className="font-black mb-3 text-ink">التصنيف</h3>
                <div className="space-y-2">
                  <Link href="/products" className="block text-sm hover:text-brand transition">الكل</Link>
                  {categories.map((c: any) => (
                    <Link key={c.id} href={`/products?${createQueryString('category', c.name)}`} className={`block text-sm transition ${params.category === c.name ? 'text-brand font-bold' : 'hover:text-brand'}`}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-black mb-3 text-ink">الماركة</h3>
                <div className="space-y-2">
                  <Link href="/products" className="block text-sm hover:text-brand transition">الكل</Link>
                  {brands.map((b: string) => (
                    <Link key={b} href={`/products?${createQueryString('brand', b)}`} className={`block text-sm transition ${params.brand === b ? 'text-brand font-bold' : 'hover:text-brand'}`}>
                      {b}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/products" className="block text-center bg-paper2 border-2 border-brand/30 rounded-lg py-2 text-sm font-bold hover:bg-brand/10 transition">
                إعادة تعيين الفلاتر
              </Link>
            </div>
          </aside>

          <div className="md:col-span-3">
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <span className="font-bold text-sm text-ink">ترتيب حسب:</span>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/products?${createQueryString('sort', 'price-asc')}`} className={`text-sm px-3 py-1 rounded-full transition ${params.sort === 'price-asc' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}`}>السعر: الأقل</Link>
                <Link href={`/products?${createQueryString('sort', 'price-desc')}`} className={`text-sm px-3 py-1 rounded-full transition ${params.sort === 'price-desc' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}`}>السعر: الأعلى</Link>
                <Link href={`/products?${createQueryString('sort', 'name')}`} className={`text-sm px-3 py-1 rounded-full transition ${params.sort === 'name' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}`}>الاسم</Link>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">📦</div>
                <h2 className="text-2xl font-black mb-4 text-ink">لا توجد منتجات</h2>
                <Link href="/products" className="bg-brand text-white rounded-full px-8 py-3 font-bold inline-block">عرض كل المنتجات</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.id}`} className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:-translate-y-1 transition shadow-[4px_4px_0_#047ba8]">
                    <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-brand">
                      <ProductIcon name={p.icon || 'Package'} size={64} />
                    </div>
                    {p.badge && <span className="inline-block bg-brand/10 text-brand border border-brand/30 rounded-full px-2 py-0.5 text-xs mb-2">{p.badge === 'new' ? 'جديد' : p.badge === 'sale' ? 'خصم' : 'مطلوب'}</span>}
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
