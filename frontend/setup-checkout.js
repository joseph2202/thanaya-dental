const fs = require('fs');

// 1) مكتبة حفظ الطلبات
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/orders.ts', `import { CartItem } from '@/context/CartContext';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  paymentMethod: 'cod';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
};

export const saveOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
  const fullOrder: Order = {
    ...order,
    id: 'ORD-' + Date.now().toString().slice(-8),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const orders = getOrders();
  orders.push(fullOrder);
  localStorage.setItem('thanaya-orders', JSON.stringify(orders));

  return fullOrder;
};

export const getOrders = (): Order[] => {
  const saved = localStorage.getItem('thanaya-orders');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const getOrder = (id: string): Order | undefined => {
  return getOrders().find((o) => o.id === id);
};
`);

// 2) صفحة Checkout
fs.mkdirSync('src/app/checkout', { recursive: true });
fs.writeFileSync('src/app/checkout/page.tsx', `"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { saveOrder } from '@/lib/orders';
import Link from 'next/link';

const cities = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
  'الأنبار', 'بابل', 'ديالى', 'ذي قار', 'صلاح الدين', 'كركوك',
  'ميسان', 'المثنى', 'واسط', 'دهوك', 'السليمانية', 'حلبجة'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'بغداد',
  });
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black mb-4">السلة فارغة</h1>
          <p className="text-neutral-600 mb-8">أضف منتجات قبل إتمام الطلب.</p>
          <Link href="/products" className="bg-ink text-paper rounded-full px-8 py-3 font-bold inline-block shadow-[4px_4px_0_#FDE047]">
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
        <h1 className="text-4xl font-black mb-8">إتمام الطلب</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* النموذج */}
          <form onSubmit={handleSubmit} className="bg-white border-2 border-ink rounded-2xl p-6 space-y-5 h-fit">
            <h2 className="text-2xl font-black mb-4">بيانات التوصيل</h2>

            <div>
              <label className="block font-bold mb-2 text-sm">الاسم الكامل</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-ink rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="مثال: أحمد محمد"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">رقم الهاتف</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-ink rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="07XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">المحافظة</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border-2 border-ink rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">العنوان التفصيلي</label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full border-2 border-ink rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                placeholder="المنطقة، الشارع، أقرب نقطة دالة..."
              />
            </div>

            <div className="bg-paper2 border-2 border-ink rounded-xl p-4">
              <h3 className="font-black mb-2">طريقة الدفع</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-bold">الدفع عند الاستلام</p>
                  <p className="text-sm text-neutral-600">تدفع نقداً عند استلام الطلب</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ink text-paper rounded-full py-4 font-black text-lg shadow-[4px_4px_0_#FDE047] hover:shadow-[6px_6px_0_#FDE047] transition disabled:opacity-50"
            >
              {submitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}
            </button>
          </form>

          {/* ملخص الطلب */}
          <div className="bg-paper2 border-2 border-ink rounded-2xl p-6 h-fit">
            <h2 className="text-2xl font-black mb-4">ملخص الطلب</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-ink/20">
                  <div className="w-12 h-12 bg-paper2 rounded-lg grid place-items-center text-2xl flex-shrink-0">
                    {item.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-neutral-500">{item.quantity} × {item.product.price.toLocaleString()} د.ع</p>
                  </div>
                  <p className="font-black text-sm">{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-ink pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">المجموع الفرعي</span>
                <span className="font-black">{totalPrice.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">الشحن</span>
                <span className="font-black text-brand">يحدد لاحقاً</span>
              </div>
              <div className="flex justify-between text-xl pt-2 border-t border-ink/20">
                <span className="font-black">الإجمالي</span>
                <span className="font-black text-brand">{totalPrice.toLocaleString()} د.ع</span>
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

// 3) صفحة تأكيد الطلب
fs.mkdirSync('src/app/order/confirmation', { recursive: true });
fs.writeFileSync('src/app/order/confirmation/page.tsx', `"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getOrder } from '@/lib/orders';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';
  const order = getOrder(orderId);

  if (!order) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black mb-4">الطلب غير موجود</h1>
          <Link href="/products" className="bg-ink text-paper rounded-full px-8 py-3 font-bold inline-block">
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
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-8xl mb-6">✅</div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">تم تأكيد طلبك!</h1>
        <p className="text-neutral-600 mb-8">شكراً لك، راح نتواصل معك قريباً لتأكيد التفاصيل.</p>

        <div className="bg-white border-2 border-ink rounded-2xl p-8 text-right max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-ink">
            <span className="font-bold">رقم الطلب:</span>
            <span className="font-black text-xl text-brand">{order.id}</span>
          </div>

          <div className="space-y-2 mb-4">
            <p className="font-bold">الاسم: <span className="font-normal">{order.customer.name}</span></p>
            <p className="font-bold">الهاتف: <span className="font-normal">{order.customer.phone}</span></p>
            <p className="font-bold">العنوان: <span className="font-normal">{order.customer.address}، {order.customer.city}</span></p>
          </div>

          <div className="border-t-2 border-ink pt-4">
            <p className="font-bold mb-2">المنتجات ({order.items.length}):</p>
            <ul className="space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item.product.id} className="flex justify-between">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span className="font-bold">{(item.product.price * item.quantity).toLocaleString()} د.ع</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t-2 border-ink mt-4 pt-4 flex justify-between items-center">
            <span className="font-black text-lg">الإجمالي:</span>
            <span className="font-black text-2xl text-brand">{order.total.toLocaleString()} د.ع</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/products" className="bg-ink text-paper rounded-full px-8 py-3 font-bold shadow-[4px_4px_0_#FDE047]">
            تسوق المزيد
          </Link>
          <Link href="/" className="bg-white border-2 border-ink rounded-full px-8 py-3 font-bold">
            الرئيسية
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p>جاري التحميل...</p>
        </main>
        <Footer />
      </>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
`);

console.log('✅ تم إنشاء: Checkout + Order Confirmation + Orders Library');