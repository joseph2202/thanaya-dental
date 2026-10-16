"use client";
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import Link from 'next/link';

export default function Products() {
  const { addToCart } = useCart();

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-ink">منتجات مختارة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p) => (
          <div key={p.id} className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:border-brand transition">
            <Link href={`/product/${p.id}`}>
              <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-4xl">{p.emoji}</div>
              <h3 className="mb-2 text-ink">{p.name}</h3>
              <p className="text-ink font-black text-lg">{p.price.toLocaleString()} د.ع</p>
            </Link>
            <button
              onClick={() => addToCart(p)}
              className="mt-4 w-full bg-brand text-white rounded-full py-2 font-bold hover:bg-brand-dark transition"
            >
              أضف للسلة
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
