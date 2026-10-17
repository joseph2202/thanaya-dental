import { productsAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AddToCartButton from '@/components/product/AddToCartButton';
import BuyNowButton from '@/components/product/BuyNowButton';
import ProductIcon from '@/components/ui/ProductIcon';

export const instant = false;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let product;
  try {
    product = await productsAPI.getById(id);
  } catch (error) {
    notFound();
  }

  let related = [];
  try {
    const allRelated = await productsAPI.getAll({ category: product.category });
    related = allRelated.filter((p: any) => p.id !== product.id).slice(0, 3);
  } catch (error) {
    related = [];
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <nav className="text-sm text-neutral-500 mb-8">
          <Link href="/" className="hover:text-brand">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-brand">المنتجات</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="bg-paper2 rounded-3xl aspect-square grid place-items-center text-brand border-2 border-brand/20">
            <ProductIcon name={product.icon || 'Package'} size={180} />
          </div>

          <div>
            {product.badge && (
              <span className="inline-block bg-brand/10 text-brand border border-brand/30 rounded-full px-3 py-1 text-xs font-bold mb-4">
                {product.badge === 'new' ? 'جديد' : product.badge === 'sale' ? 'خصم' : product.badge === 'popular' ? 'مطلوب' : product.badge}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-ink">{product.name}</h1>
            <p className="text-neutral-500 mb-4">{product.brand} · {product.category}</p>

            <div className="mb-6">
              <p className="text-4xl font-black text-ink">{product.price.toLocaleString()} د.ع</p>
              <p className="text-neutral-500">≈ {product.usdPrice} دولار</p>
            </div>

            {product.description && product.description.trim() !== '' && product.description.trim().toLowerCase() !== 'nothing' && (
              <p className="text-neutral-700 leading-9 mb-6">{product.description}</p>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-block w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-red-500'}`}></span>
              <span className="font-bold text-ink">
                {product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفد المخزون'}
              </span>
            </div>

            <div className="flex gap-3 flex-wrap">
              <AddToCartButton product={product} />
              <BuyNowButton product={product} />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-black mb-6 text-ink">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((p: any) => (
                <Link key={p.id} href={`/product/${p.id}`} className="bg-white border-2 border-brand/20 rounded-2xl p-5 font-bold hover:border-brand hover:-translate-y-1 transition">
                  <div className="bg-paper2 rounded-xl h-24 mb-3 grid place-items-center text-brand">
                    <ProductIcon name={p.icon || 'Package'} size={48} />
                  </div>
                  <h3 className="text-sm mb-1 text-ink">{p.name}</h3>
                  <p className="text-ink font-black">{p.price.toLocaleString()} د.ع</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
