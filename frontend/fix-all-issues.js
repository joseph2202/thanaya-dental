const fs = require('fs');

// 1) تحديث products.ts - إضافة دالة للتحقق من المخزون
let productsContent = fs.readFileSync('src/data/products.ts', 'utf8');
if (!productsContent.includes('export const checkStock')) {
  productsContent += `

export const checkStock = (productId: string, quantity: number): { available: boolean; message: string } => {
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return { available: false, message: 'المنتج غير موجود' };
  }
  if (product.stock <= 0) {
    return { available: false, message: 'نفد المخزون' };
  }
  if (quantity > product.stock) {
    return { available: false, message: \`الكمية المطلوبة غير متوفرة (متوفر فقط \${product.stock} قطعة)\` };
  }
  return { available: true, message: 'متوفر' };
};
`;
  fs.writeFileSync('src/data/products.ts', productsContent);
}

// 2) تحديث CartContext - التحقق من المخزون عند الإضافة
fs.writeFileSync('src/context/CartContext.tsx', `"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, checkStock } from '@/data/products';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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

  useEffect(() => {
    localStorage.setItem('thanaya-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1): { success: boolean; message: string } => {
    const stockCheck = checkStock(product.id, quantity);
    if (!stockCheck.available) {
      return { success: false, message: stockCheck.message };
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        const newStockCheck = checkStock(product.id, newQuantity);
        if (!newStockCheck.available) {
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    return { success: true, message: 'تمت الإضافة للسلة' };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true, message: 'تم الحذف' };
    }

    const product = items.find((item) => item.product.id === productId)?.product;
    if (!product) {
      return { success: false, message: 'المنتج غير موجود' };
    }

    const stockCheck = checkStock(productId, quantity);
    if (!stockCheck.available) {
      return { success: false, message: stockCheck.message };
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    return { success: true, message: 'تم التحديث' };
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

// 3) حماية صفحة Checkout - redirect للـ login إذا ما كان مسجل
fs.writeFileSync('src/app/checkout/page.tsx', `"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { saveOrder } from '@/lib/orders';
import Link from 'next/link';

const cities = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
  'الأنبار', 'بابل', 'ديالى', 'ذي قار', 'صلاح الدين', 'كركوك',
  'ميسان', 'المثنى', 'واسط', 'دهوك', 'السليمانية', 'حلبجة'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'بغداد',
  });
  const [submitting, setSubmitting] = useState(false);

  // حماية الصفحة - redirect للـ login إذا ما كان مسجل
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, router]);

  // ملء البيانات تلقائياً من الحساب
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        phone: user.phone,
        address: '',
        city: 'بغداد',
      });
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black mb-4 text-ink">السلة فارغة</h1>
          <p className="text-neutral-600 mb-8">أضف منتجات قبل إتمام الطلب.</p>
          <Link href="/products" className="bg-brand text-white rounded-full px-8 py-3 font-bold inline-block shadow-[4px_4px_0_#047ba8]">
            تصفح المنتجات
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const order = saveOrder({
      items,
      total: totalPrice,
      customer: form,
      paymentMethod: 'cod',
    });

    clearCart();
    router.push('/order/confirmation?id=' + order.id);
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8 text-ink">إتمام الطلب</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-white border-2 border-brand/20 rounded-2xl p-6 space-y-5 h-fit">
            <h2 className="text-2xl font-black mb-4 text-ink">بيانات التوصيل</h2>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">الاسم الكامل</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="مثال: أحمد محمد"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">رقم الهاتف</label>
              <div className="flex gap-2">
                <span className="bg-paper2 border-2 border-brand/30 rounded-xl px-4 py-3 font-bold text-ink">+964</span>
                <input
                  required
                  type="tel"
                  pattern="07[0-9]{9}"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="flex-1 border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                  placeholder="7822088894"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">مثال: 07822088894 أو 07712345678</p>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">المحافظة</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand bg-white"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">العنوان التفصيلي</label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand resize-none"
                placeholder="المنطقة، الشارع، أقرب نقطة دالة..."
              />
            </div>

            <div className="bg-paper2 border-2 border-brand/30 rounded-xl p-4">
              <h3 className="font-black mb-2 text-ink">طريقة الدفع</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-bold text-ink">الدفع عند الاستلام</p>
                  <p className="text-sm text-neutral-600">تدفع نقداً عند استلام الطلب</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-white rounded-full py-4 font-black text-lg shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition disabled:opacity-50"
            >
              {submitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}
            </button>
          </form>

          <div className="bg-paper2 border-2 border-brand/30 rounded-2xl p-6 h-fit">
            <h2 className="text-2xl font-black mb-4 text-ink">ملخص الطلب</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-brand/20">
                  <div className="w-12 h-12 bg-paper2 rounded-lg grid place-items-center text-2xl flex-shrink-0">
                    {item.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-ink">{item.product.name}</p>
                    <p className="text-xs text-neutral-500">{item.quantity} × {item.product.price.toLocaleString()} د.ع</p>
                  </div>
                  <p className="font-black text-sm text-ink">{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-brand/30 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-ink">المجموع الفرعي</span>
                <span className="font-black text-ink">{totalPrice.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-ink">الشحن</span>
                <span className="font-black text-brand">يحدد لاحقاً</span>
              </div>
              <div className="flex justify-between text-xl pt-2 border-t border-brand/20">
                <span className="font-black text-ink">الإجمالي</span>
                <span className="font-black text-2xl text-brand">{totalPrice.toLocaleString()} د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`);

// 4) تحديث صفحة المنتج - إضافة رسالة عند تجاوز المخزون
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
              <button className="bg-ink text-paper rounded-full px-8 py-3 font-bold hover:bg-ink/90 transition">
                اشتري الآن
              </button>
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

// 5) تحديث AddToCartButton - عرض رسالة عند تجاوز المخزون
fs.writeFileSync('src/components/product/AddToCartButton.tsx', `"use client";
import { useCart } from '@/context/CartContext';
import { Product } from '@/data/products';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleAdd = () => {
    const result = addToCart(product);
    setMessage(result.message);
    setIsError(!result.success);
    
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className={\`bg-brand text-white rounded-full px-8 py-3 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed \${
          message && !isError ? 'bg-success shadow-[4px_4px_0_#059669]' : 'shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8]'
        }\`}
      >
        {product.stock <= 0 ? 'نفد المخزون' : message || 'أضف للسلة'}
      </button>
      {message && isError && (
        <p className="text-red-600 text-sm font-bold">{message}</p>
      )}
    </div>
  );
}
`);

console.log('✅ تم إصلاح كل المشاكل');
console.log('🔒 حماية Checkout - redirect للـ login');
console.log('📦 التحقق من المخزون عند الإضافة للسلة');
console.log('📱 رقم الهاتف يبدأ بـ +964');
console.log('⚠️ رسائل خطأ واضحة عند تجاوز المخزون');