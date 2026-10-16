"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getOrders } from '@/lib/orders';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-3xl font-black mb-8 text-ink">إدارة الطلبات</h2>
      {orders.length === 0 ? (
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-neutral-600">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-brand/20 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-paper2">
              <tr>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">رقم الطلب</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">العميل</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">المبلغ</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">الحالة</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-brand/10">
                  <td className="px-4 py-3 font-bold text-sm text-brand">{order.id}</td>
                  <td className="px-4 py-3 text-sm text-ink">{order.customer.name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-ink">{order.total.toLocaleString()} د.ع</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {order.status === 'pending' ? 'قيد المعالجة' : order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
