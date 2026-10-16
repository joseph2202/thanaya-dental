"use client";
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
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="مثال: أحمد محمد"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">رقم الهاتف</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="07XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">المحافظة</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 bg-white"
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
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none"
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
