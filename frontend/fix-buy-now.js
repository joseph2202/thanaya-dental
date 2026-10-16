const fs = require('fs');

// تحديث صفحة المنتج - إصلاح زر "اشتري الآن"
fs.writeFileSync('src/app/product/[id]/page.tsx', `import { products, getProduct } from '@/data/products';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AddToCartButton from '@/components/product/AddToCartButton';
import BuyNowButton from '@/components/product/BuyNowButton';

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

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
          <div className="bg-paper2 rounded-3xl aspect-square grid place-items-center text-[180px] border-2 border-brand/20">
            {product.emoji}
          </div>

          <div>
            {product.badge && (
              <span className="inline-block bg-brand/10 text-brand border border-brand/30 rounded-full px-3 py-1 text-xs font-bold mb-4">
                {product.badge === 'new' ? 'جديد' : product.badge === 'sale' ? 'خصم' : 'مطلوب'}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-ink">{product.name}</h1>
            <p className="text-neutral-500 mb-4">{product.brand} · {product.category}</p>

            <div className="mb-6">
              <p className="text-4xl font-black text-ink">{product.price.toLocaleString()} د.ع</p>
              <p className="text-neutral-500">≈ {product.usdPrice} دولار</p>
            </div>

            <p className="text-neutral-700 leading-9 mb-6">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <span className={\`inline-block w-3 h-3 rounded-full \${product.stock > 0 ? 'bg-success' : 'bg-red-500'}\`}></span>
              <span className="font-bold text-ink">
                {product.stock > 0 ? \`متوفر (\${product.stock} قطعة)\` : 'نفد المخزون'}
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
              {related.map((p) => (
                <Link key={p.id} href={\`/product/\${p.id}\`} className="bg-white border-2 border-brand/20 rounded-2xl p-5 font-bold hover:border-brand hover:-translate-y-1 transition">
                  <div className="bg-paper2 rounded-xl h-24 mb-3 grid place-items-center text-3xl">{p.emoji}</div>
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
`);

// إنشاء مكون BuyNowButton
fs.mkdirSync('src/components/product', { recursive: true });
fs.writeFileSync('src/components/product/BuyNowButton.tsx', `"use client";
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/data/products';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BuyNowButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleBuyNow = () => {
    // التحقق من المخزون
    const result = addToCart(product);
    
    if (!result.success) {
      setMessage(result.message);
      setIsError(true);
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    // إذا ما كان مسجل، يروح للـ login أولاً
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // يروح مباشرة للـ checkout
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleBuyNow}
        disabled={product.stock <= 0}
        className="bg-ink text-paper rounded-full px-8 py-3 font-bold hover:bg-ink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {product.stock <= 0 ? 'نفد المخزون' : 'اشتري الآن'}
      </button>
      {message && isError && (
        <p className="text-red-600 text-sm font-bold">{message}</p>
      )}
    </div>
  );
}
`);

console.log('✅ تم إصلاح زر "اشتري الآن"');
console.log(' الآن يضيف المنتج للسلة ويروح مباشرة للـ Checkout');
console.log(' إذا ما كان مسجل، يروح للـ login أولاً');