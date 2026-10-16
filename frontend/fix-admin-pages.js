const fs = require('fs');

// 1) إصلاح صفحة الإدارة الرئيسية
fs.writeFileSync('src/app/admin/page.tsx', `"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { getUsers } from '@/lib/auth';
import { getOrders } from '@/lib/orders';
import { products } from '@/data/products';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

  useEffect(() => {
    const users = getUsers();
    const orders = getOrders();
    setStats({
      products: products.length,
      orders: orders.length,
      users: users.length,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
    });
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-3xl font-black mb-8 text-ink">نظرة عامة</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-6">
          <p className="text-neutral-500 text-sm mb-2">المنتجات</p>
          <p className="text-4xl font-black text-brand">{stats.products}</p>
        </div>
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-6">
          <p className="text-neutral-500 text-sm mb-2">الطلبات</p>
          <p className="text-4xl font-black text-brand">{stats.orders}</p>
        </div>
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-6">
          <p className="text-neutral-500 text-sm mb-2">المستخدمين</p>
          <p className="text-4xl font-black text-brand">{stats.users}</p>
        </div>
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-6">
          <p className="text-neutral-500 text-sm mb-2">الإيرادات</p>
          <p className="text-2xl font-black text-brand">{stats.revenue.toLocaleString()} د.ع</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/products" className="bg-white border-2 border-brand/20 rounded-2xl p-6 hover:border-brand transition">
          <h3 className="font-black text-lg mb-2 text-ink">إدارة المنتجات</h3>
          <p className="text-sm text-neutral-600">إضافة، تعديل، وحذف المنتجات</p>
        </Link>
        <Link href="/admin/orders" className="bg-white border-2 border-brand/20 rounded-2xl p-6 hover:border-brand transition">
          <h3 className="font-black text-lg mb-2 text-ink">إدارة الطلبات</h3>
          <p className="text-sm text-neutral-600">عرض وتحديث حالة الطلبات</p>
        </Link>
        <Link href="/admin/users" className="bg-white border-2 border-brand/20 rounded-2xl p-6 hover:border-brand transition">
          <h3 className="font-black text-lg mb-2 text-ink">إدارة المستخدمين</h3>
          <p className="text-sm text-neutral-600">عرض المستخدمين المسجلين</p>
        </Link>
      </div>
    </AdminLayout>
  );
}
`);

// 2) إصلاح صفحة إدارة الطلبات
fs.writeFileSync('src/app/admin/orders/page.tsx', `"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getOrders } from '@/lib/orders';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

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
`);

// 3) إصلاح صفحة إدارة المستخدمين
fs.writeFileSync('src/app/admin/users/page.tsx', `"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getUsers } from '@/lib/auth';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-3xl font-black mb-8 text-ink">إدارة المستخدمين</h2>

      {users.length === 0 ? (
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-neutral-600">لا يوجد مستخدمين مسجلين</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-brand/20 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-paper2">
              <tr>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">الاسم</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">البريد</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">الهاتف</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">الدور</th>
                <th className="px-4 py-3 text-right font-black text-sm text-ink">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-brand/10">
                  <td className="px-4 py-3 font-bold text-sm text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-ink">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-ink">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span className={\`text-xs px-2 py-1 rounded-full \${user.role === 'admin' ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-700'}\`}>
                      {user.role === 'admin' ? 'أدمن' : 'عميل'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {new Date(user.createdAt).toLocaleDateString('ar-IQ')}
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
`);

console.log('✅ تم إصلاح صفحات الإدارة');
console.log(' جميع الصفحات الآن Client Components');
console.log(' localStorage يُقرأ بعد تحميل الصفحة (useEffect)');س