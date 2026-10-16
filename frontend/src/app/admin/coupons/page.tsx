"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

type Coupon = { id: string; code: string; discount: number; active: boolean };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('thanaya-coupons');
    if (saved) {
      setCoupons(JSON.parse(saved));
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const coupon: Coupon = {
      id: 'coupon-' + Date.now(),
      code: newCoupon.code.toUpperCase(),
      discount: newCoupon.discount,
      active: true,
    };
    const updated = [...coupons, coupon];
    setCoupons(updated);
    localStorage.setItem('thanaya-coupons', JSON.stringify(updated));
    setNewCoupon({ code: '', discount: 0 });
  };

  const handleToggle = (id: string) => {
    const updated = coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
    setCoupons(updated);
    localStorage.setItem('thanaya-coupons', JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
      const updated = coupons.filter(c => c.id !== id);
      setCoupons(updated);
      localStorage.setItem('thanaya-coupons', JSON.stringify(updated));
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-3xl font-black mb-8 text-ink">إدارة الكوبونات</h2>

      <form onSubmit={handleAdd} className="bg-white border-2 border-brand/20 rounded-2xl p-6 mb-6 flex gap-4">
        <input
          type="text"
          placeholder="كود الكوبون (مثل THANAYA20)"
          value={newCoupon.code}
          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
          className="flex-1 border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="number"
          placeholder="نسبة الخصم %"
          value={newCoupon.discount}
          onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
          className="w-32 border-2 border-brand/30 rounded-xl px-4 py-2"
          required
          min="1"
          max="100"
        />
        <button type="submit" className="bg-brand text-white rounded-full px-6 py-2 font-bold">
          إضافة
        </button>
      </form>

      <div className="bg-white border-2 border-brand/20 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-paper2">
            <tr>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">الكود</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">الخصم</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">الحالة</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-brand/10">
                <td className="px-4 py-3 font-bold text-brand">{coupon.code}</td>
                <td className="px-4 py-3 text-ink">{coupon.discount}%</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(coupon.id)}
                    className={`text-xs px-3 py-1 rounded-full font-bold ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {coupon.active ? 'نشط' : 'معطل'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-xs bg-red-50 text-red-600 rounded-lg px-3 py-1 font-bold hover:bg-red-100"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
