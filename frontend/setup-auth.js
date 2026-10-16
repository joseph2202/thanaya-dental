const fs = require('fs');

// 1) إنشاء مكتبة المصادقة
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/auth.ts', `export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export const registerUser = (name: string, email: string, phone: string, password: string): User | null => {
  const users = getUsers();
  
  // تحقق من وجود البريد
  if (users.find((u) => u.email === email)) {
    return null;
  }

  const newUser: User = {
    id: 'user-' + Date.now().toString().slice(-8),
    name,
    email,
    phone,
    createdAt: new Date().toISOString(),
  };

  // حفظ المستخدم (بدون كلمة المرور - للتبسيط)
  users.push(newUser);
  localStorage.setItem('thanaya-users', JSON.stringify(users));
  localStorage.setItem('thanaya-passwords', JSON.stringify({
    ...JSON.parse(localStorage.getItem('thanaya-passwords') || '{}'),
    [email]: password
  }));

  // تسجيل دخول تلقائي
  localStorage.setItem('thanaya-current-user', JSON.stringify(newUser));
  
  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const passwords = JSON.parse(localStorage.getItem('thanaya-passwords') || '{}');
  
  const user = users.find((u) => u.email === email);
  
  if (!user || passwords[email] !== password) {
    return null;
  }

  localStorage.setItem('thanaya-current-user', JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem('thanaya-current-user');
};

export const getCurrentUser = (): User | null => {
  const saved = localStorage.getItem('thanaya-current-user');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

export const getUsers = (): User[] => {
  const saved = localStorage.getItem('thanaya-users');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};
`);

// 2) إنشاء AuthContext
fs.mkdirSync('src/context', { recursive: true });
fs.writeFileSync('src/context/AuthContext.tsx', `"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, logoutUser } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  logout: () => void;
  refreshUser: () => void;
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

  return (
    <AuthContext.Provider value={{ user, logout, refreshUser }}>
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

// 3) تحديث layout.tsx - إضافة AuthProvider
fs.writeFileSync('src/app/layout.tsx', `import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import BackgroundPattern from "@/components/layout/BackgroundPattern";

export const metadata: Metadata = {
  title: "Al Thanaya | الثنايا - مستلزمات وأجهزة طبية",
  description:
    "متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة: منتجات موثقة وأسعار بالدينار والدولار.",
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
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
      <body className="font-sans antialiased bg-paper text-ink relative">
        <BackgroundPattern />
        <div className="relative z-10">
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
`);

// 4) تحديث Header.tsx - إضافة زر تسجيل دخول/خروج
fs.writeFileSync('src/components/layout/Header.tsx', `"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push('/search?q=' + encodeURIComponent(searchQuery.trim()));
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b-2 border-brand/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-icon.png"
            alt="Al Thanaya"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
          <span className="font-black text-xl text-ink">الثنايا</span>
        </Link>

        {/* شريط البحث */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منتج، ماركة، تصنيف..."
            className="w-full border-2 border-brand/30 rounded-full px-5 py-2 font-bold focus:outline-none focus:border-brand bg-white"
          />
          <button
            type="submit"
            className="mr-2 bg-brand text-white rounded-full px-5 py-2 font-bold hover:bg-brand-dark transition"
          >
            بحث
          </button>
        </form>

        <nav className="hidden lg:flex items-center gap-6 font-bold text-ink">
          <Link href="/" className="hover:text-brand transition">الرئيسية</Link>
          <Link href="/products" className="hover:text-brand transition">المنتجات</Link>
          <Link href="/categories" className="hover:text-brand transition">التصنيفات</Link>
          <Link href="/offers" className="hover:text-brand transition">العروض</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
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
          ) : (
            <Link href="/login" className="bg-brand text-white rounded-full px-5 py-2 font-bold hover:bg-brand-dark transition">
              دخول
            </Link>
          )}
          
          <Link href="/cart" className="bg-brand text-white rounded-full px-5 py-2 font-bold relative hover:bg-brand-dark transition">
            السلة
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-ink text-white rounded-full w-6 h-6 grid place-items-center text-xs font-black border-2 border-paper">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* شريط البحث للموبايل */}
      <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث..."
            className="flex-1 border-2 border-brand/30 rounded-full px-4 py-2 font-bold focus:outline-none focus:border-brand bg-white text-sm"
          />
          <button
            type="submit"
            className="bg-brand text-white rounded-full px-4 py-2 font-bold hover:bg-brand-dark transition text-sm"
          >
            بحث
          </button>
        </div>
      </form>
    </header>
  );
}
`);

// 5) إنشاء صفحة تسجيل الدخول
fs.mkdirSync('src/app/login', { recursive: true });
fs.writeFileSync('src/app/login/page.tsx', `"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loginUser } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = loginUser(form.email, form.password);
    
    if (user) {
      refreshUser();
      router.push('/account');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-8">
          <h1 className="text-3xl font-black mb-6 text-center text-ink">تسجيل الدخول</h1>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-2 text-sm text-ink">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">كلمة المرور</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand text-white rounded-full py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition"
            >
              دخول
            </button>
          </form>

          <p className="text-center text-sm text-neutral-600 mt-6">
            ما عندك حساب؟{' '}
            <Link href="/register" className="text-brand font-bold hover:underline">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
`);

// 6) إنشاء صفحة إنشاء حساب
fs.mkdirSync('src/app/register', { recursive: true });
fs.writeFileSync('src/app/register/page.tsx', `"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { registerUser } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = registerUser(form.name, form.email, form.phone, form.password);
    
    if (user) {
      refreshUser();
      router.push('/account');
    } else {
      setError('البريد الإلكتروني مسجل مسبقاً');
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border-2 border-brand/20 rounded-2xl p-8">
          <h1 className="text-3xl font-black mb-6 text-center text-ink">إنشاء حساب</h1>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-2 text-sm text-ink">الاسم الكامل</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="أحمد محمد"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">رقم الهاتف</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="07XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">كلمة المرور</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand text-white rounded-full py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition"
            >
              إنشاء حساب
            </button>
          </form>

          <p className="text-center text-sm text-neutral-600 mt-6">
            عندك حساب؟{' '}
            <Link href="/login" className="text-brand font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
`);

// 7) إنشاء صفحة حسابي
fs.mkdirSync('src/app/account', { recursive: true });
fs.writeFileSync('src/app/account/page.tsx', `"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '@/lib/orders';

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setOrders(getOrders());
  }, [user, router]);

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8 text-ink">حسابي</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* معلومات المستخدم */}
          <div className="md:col-span-1">
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-6">
              <h2 className="font-black text-lg mb-4 text-ink">معلوماتي</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">الاسم</p>
                  <p className="font-bold text-ink">{user.name}</p>
                </div>
                <div>
                  <p className="text-neutral-500">البريد</p>
                  <p className="font-bold text-ink">{user.email}</p>
                </div>
                <div>
                  <p className="text-neutral-500">الهاتف</p>
                  <p className="font-bold text-ink">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* الطلبات */}
          <div className="md:col-span-2">
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-6">
              <h2 className="font-black text-lg mb-4 text-ink">طلباتي ({orders.length})</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4"></div>
                  <p className="text-neutral-600 mb-4">ما عندك طلبات بعد</p>
                  <Link href="/products" className="bg-brand text-white rounded-full px-6 py-2 font-bold inline-block">
                    تسوق الآن
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border-2 border-brand/20 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-brand">{order.id}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {order.status === 'pending' ? 'قيد المعالجة' : order.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {order.items.length} منتج · {order.total.toLocaleString()} د.ع
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`);

console.log('✅ تم إنشاء نظام حساب المستخدم الكامل');
console.log('📄 صفحة /login');
console.log('📄 صفحة /register');
console.log('📄 صفحة /account');
console.log('🔐 AuthContext + حماية الصفحات');
console.log(' زر دخول/خروج بالهيدر');