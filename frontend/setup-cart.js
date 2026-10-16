const fs = require('fs');

// 1) إنشاء CartContext
fs.mkdirSync('src/context', { recursive: true });
fs.writeFileSync('src/context/CartContext.tsx', `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/data/products';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // تحميل السلة من localStorage عند البدء
  useEffect(() => {
    const saved = localStorage.getItem('thanaya-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // حفظ السلة في localStorage عند أي تغيير
  useEffect(() => {
    localStorage.setItem('thanaya-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
`);

// 2) تحديث layout.tsx ليضيف CartProvider
fs.writeFileSync('src/app/layout.tsx', `import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "ثنايا | مستلزمات وأجهزة طبية",
  description:
    "متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة: منتجات موثقة وأسعار بالدينار والدولار.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@dawod/thmanyah-font-web@1.2.0/index.min.css"
        />
      </head>
      <body className="font-sans antialiased bg-paper text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
`);

// 3) تحديث Header ليعرض عدد المنتجات بالسلة
fs.writeFileSync('src/components/layout/Header.tsx', `"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b-2 border-ink">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black text-xl">
          <span className="bg-ink text-paper rounded-full w-9 h-9 grid place-items-center">ث</span>
          ثنايا
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-bold">
          <Link href="/" className="hover:text-brand">الرئيسية</Link>
          <Link href="/products" className="hover:text-brand">المنتجات</Link>
          <Link href="/categories" className="hover:text-brand">التصنيفات</Link>
          <Link href="/offers" className="hover:text-brand">العروض</Link>
        </nav>
        <Link href="/cart" className="bg-ink text-paper rounded-full px-4 py-2 font-bold relative">
          السلة
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-mark text-ink rounded-full w-6 h-6 grid place-items-center text-xs font-black border border-ink">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
`);

// 4) تحديث صفحة المنتج لتستخدم useCart
fs.writeFileSync('src/app/product/[id]/page.tsx', `import { products, getProduct } from '@/data/products';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AddToCartButton from '@/components/product/AddToCartButton';

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
          <div className="bg-paper2 rounded-3xl aspect-square grid place-items-center text-[180px] border-2 border-ink">
            {product.emoji}
          </div>

          <div>
            {product.badge && (
              <span className="inline-block bg-mark border border-ink rounded-full px-3 py-1 text-xs font-bold mb-4">
                {product.badge === 'new' ? 'جديد' : product.badge === 'sale' ? 'خصم' : 'مطلوب'}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black mb-3">{product.name}</h1>
            <p className="text-neutral-500 mb-4">{product.brand} · {product.category}</p>

            <div className="mb-6">
              <p className="text-4xl font-black text-brand">{product.price.toLocaleString()} د.ع</p>
              <p className="text-neutral-500">≈ {product.usdPrice} دولار</p>
            </div>

            <p className="text-neutral-700 leading-9 mb-6">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <span className={\`inline-block w-3 h-3 rounded-full \${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}\`}></span>
              <span className="font-bold">{product.stock > 0 ? \`متوفر (\${product.stock} قطعة)\` : 'نفد المخزون'}</span>
            </div>

            <div className="flex gap-3 flex-wrap">
              <AddToCartButton product={product} />
              <button className="bg-brand text-paper rounded-full px-8 py-3 font-bold">
                اشتري الآن
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-black mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link key={p.id} href={\`/product/\${p.id}\`} className="bg-white border-2 border-ink rounded-2xl p-5 font-bold hover:-translate-y-1 transition">
                  <div className="bg-paper2 rounded-xl h-24 mb-3 grid place-items-center text-3xl">{p.emoji}</div>
                  <h3 className="text-sm mb-1">{p.name}</h3>
                  <p className="text-brand font-black">{p.price.toLocaleString()} د.ع</p>
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

// 5) إنشاء مكون AddToCartButton (Client Component)
fs.mkdirSync('src/components/product', { recursive: true });
fs.writeFileSync('src/components/product/AddToCartButton.tsx', `"use client";
import { useCart } from '@/context/CartContext';
import { Product } from '@/data/products';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      className={\`bg-ink text-paper rounded-full px-8 py-3 font-bold transition \${
        added ? 'bg-green-600 shadow-[4px_4px_0_#16a34a]' : 'shadow-[4px_4px_0_#FDE047] hover:shadow-[6px_6px_0_#FDE047]'
      }\`}
    >
      {added ? '✓ تمت الإضافة' : 'أضف للسلة'}
    </button>
  );
}
`);

// 6) إنشاء صفحة السلة /cart
fs.mkdirSync('src/app/cart', { recursive: true });
fs.writeFileSync('src/app/cart/page.tsx', `"use client";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-8xl mb-6"></div>
          <h1 className="text-4xl font-black mb-4">سلتك فارغة</h1>
          <p className="text-neutral-600 mb-8">لم تضف أي منتج بعد. تسوق الآن!</p>
          <Link href="/products" className="bg-ink text-paper rounded-full px-8 py-3 font-bold inline-block shadow-[4px_4px_0_#FDE047]">
            تصفح المنتجات
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8">سلة التسوق</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white border-2 border-ink rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-paper2 rounded-xl w-20 h-20 grid place-items-center text-3xl flex-shrink-0">
                {item.product.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.product.name}</h3>
                <p className="text-neutral-500 text-sm">{item.product.brand}</p>
                <p className="text-brand font-black mt-1">{item.product.price.toLocaleString()} د.ع</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border-2 border-ink font-bold hover:bg-mark"
                >
                  -
                </button>
                <span className="font-bold w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border-2 border-ink font-bold hover:bg-mark"
                >
                  +
                </button>
              </div>
              <div className="text-left">
                <p className="font-black text-lg">{(item.product.price * item.quantity).toLocaleString()} د.ع</p>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-600 text-sm font-bold hover:underline"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-paper2 border-2 border-ink rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg">المجموع:</span>
            <span className="text-3xl font-black text-brand">{totalPrice.toLocaleString()} د.ع</span>
          </div>
          <div className="flex gap-3">
            <Link href="/checkout" className="flex-1 bg-ink text-paper rounded-full py-3 font-bold text-center shadow-[4px_4px_0_#FDE047]">
              إتمام الطلب
            </Link>
            <button onClick={clearCart} className="bg-white border-2 border-ink rounded-full px-6 py-3 font-bold">
              إفراغ السلة
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`);

console.log('✅ تم إنشاء نظام السلة الكامل: CartContext + Header + Product Page + Cart Page');