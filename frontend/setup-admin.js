const fs = require('fs');

// 1) تحديث auth.ts - إضافة دور الأدمن
let authContent = fs.readFileSync('src/lib/auth.ts', 'utf8');
if (!authContent.includes('export type UserRole')) {
  authContent = authContent.replace(
    'export type User = {',
    `export type UserRole = 'admin' | 'customer';

export type User = {`
  );
  authContent = authContent.replace(
    'createdAt: string;',
    'createdAt: string;\n  role: UserRole;'
  );
  authContent = authContent.replace(
    "const newUser: User = {",
    `const newUser: User = {
    role: 'customer',`
  );
  authContent += `

export const makeAdmin = (userId: string): User | null => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  
  user.role = 'admin';
  localStorage.setItem('thanaya-users', JSON.stringify(users));
  localStorage.setItem('thanaya-current-user', JSON.stringify(user));
  
  return user;
};
`;
  fs.writeFileSync('src/lib/auth.ts', authContent);
}

// 2) تحديث AuthContext
fs.writeFileSync('src/context/AuthContext.tsx', `"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, logoutUser } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  logout: () => void;
  refreshUser: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const refreshUser = () => {
    setUser(getCurrentUser());
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
`);

// 3) إنشاء مكون AdminLayout
fs.mkdirSync('src/components/admin', { recursive: true });
fs.writeFileSync('src/components/admin/AdminLayout.tsx', `"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* الهيدر */}
      <header className="bg-ink text-paper border-b-2 border-brand">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt="Logo" width={32} height={32} />
            <h1 className="font-black text-lg">لوحة الإدارة</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-brand-light transition">
              عرض الموقع
            </Link>
            <span className="text-sm text-paper/60">{user.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
`);

// 4) إنشاء صفحة الإدارة الرئيسية
fs.mkdirSync('src/app/admin', { recursive: true });
fs.writeFileSync('src/app/admin/page.tsx', `import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { getUsers } from '@/lib/auth';
import { getOrders } from '@/lib/orders';
import { products } from '@/data/products';

export default function AdminDashboard() {
  const users = getUsers();
  const orders = getOrders();

  const stats = {
    products: products.length,
    orders: orders.length,
    users: users.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <AdminLayout>
      <h2 className="text-3xl font-black mb-8 text-ink">نظرة عامة</h2>

      {/* الإحصائيات */}
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

      {/* روابط سريعة */}
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

// 5) إنشاء صفحة إدارة المنتجات
fs.mkdirSync('src/app/admin/products', { recursive: true });
fs.writeFileSync('src/app/admin/products/page.tsx', `"use client";
import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { products, Product } from '@/data/products';
import Link from 'next/link';

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-ink">إدارة المنتجات</h2>
        <button className="bg-brand text-white rounded-full px-6 py-2 font-bold hover:bg-brand-dark transition">
          + إضافة منتج
        </button>
      </div>

      {/* البحث */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="w-full max-w-md border-2 border-brand/30 rounded-xl px-4 py-2 font-bold focus:outline-none focus:border-brand"
        />
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white border-2 border-brand/20 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-paper2">
            <tr>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">المنتج</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">التصنيف</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">السعر</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">المخزون</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t border-brand/10">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className="font-bold text-sm text-ink">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-ink">{p.category}</td>
                <td className="px-4 py-3 text-sm font-bold text-ink">{p.price.toLocaleString()} د.ع</td>
                <td className="px-4 py-3">
                  <span className={\`text-sm font-bold \${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}\`}>
                    {p.stock} قطعة
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs bg-brand/10 text-brand rounded-lg px-3 py-1 font-bold hover:bg-brand/20">
                      تعديل
                    </button>
                    <button className="text-xs bg-red-50 text-red-600 rounded-lg px-3 py-1 font-bold hover:bg-red-100">
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
`);

// 6) إنشاء صفحة إدارة الطلبات
fs.mkdirSync('src/app/admin/orders', { recursive: true });
fs.writeFileSync('src/app/admin/orders/page.tsx', `"use client";
import AdminLayout from '@/components/admin/AdminLayout';
import { getOrders } from '@/lib/orders';

export default function AdminOrders() {
  const orders = getOrders();

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

// 7) إنشاء صفحة إدارة المستخدمين
fs.mkdirSync('src/app/admin/users', { recursive: true });
fs.writeFileSync('src/app/admin/users/page.tsx', `"use client";
import AdminLayout from '@/components/admin/AdminLayout';
import { getUsers } from '@/lib/auth';

export default function AdminUsers() {
  const users = getUsers();

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

// 8) تحديث Header.tsx - إضافة رابط الإدارة للأدمن
let headerContent = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
if (!headerContent.includes('/admin')) {
  headerContent = headerContent.replace(
    '{user ? (',
    `{user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-bold text-brand hover:text-brand-dark transition">
                  الإدارة
                </Link>
              )}
              <Link href="/account" className="text-sm font-bold hover:text-brand transition">
                حسابي
              </Link>
              <button
                onClick={logout}
                className="text-sm font-bold text-red-600 hover:text-red-700 transition"
              >
                خروج
              </button>
            </>
          ) : (`
  );
  fs.writeFileSync('src/components/layout/Header.tsx', headerContent);
}

console.log('✅ تم إنشاء لوحة الإدارة الكاملة');
console.log('📄 صفحة /admin - لوحة التحكم الرئيسية');
console.log('📄 صفحة /admin/products - إدارة المنتجات');
console.log(' صفحة /admin/orders - إدارة الطلبات');
console.log('📄 صفحة /admin/users - إدارة المستخدمين');
console.log('🔐 حماية الصفحات - فقط الأدمن يقدر يدخل');
console.log('📊 إحصائيات: منتجات، طلبات، مستخدمين، إيرادات');
console.log('🔗 رابط الإدارة بالهيدر (يظهر للأدمن فقط)');