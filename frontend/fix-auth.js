const fs = require('fs');

// 1) إصلاح مكتبة المصادقة - إضافة validation قوي
fs.writeFileSync('src/lib/auth.ts', `export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  return { valid: true, message: '' };
};

export const validatePhone = (phone: string): boolean => {
  const re = /^07\\d{9}$/;
  return re.test(phone.replace(/\\s/g, ''));
};

export const registerUser = (name: string, email: string, phone: string, password: string): { user: User | null; error: string } => {
  // التحقق من الاسم
  if (name.trim().length < 3) {
    return { user: null, error: 'الاسم يجب أن يكون 3 أحرف على الأقل' };
  }

  // التحقق من البريد
  if (!validateEmail(email)) {
    return { user: null, error: 'البريد الإلكتروني غير صحيح' };
  }

  // التحقق من الهاتف
  if (!validatePhone(phone)) {
    return { user: null, error: 'رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 10 أرقام' };
  }

  // التحقق من كلمة المرور
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return { user: null, error: passwordCheck.message };
  }

  const users = getUsers();
  
  // تحقق من وجود البريد
  if (users.find((u) => u.email === email)) {
    return { user: null, error: 'البريد الإلكتروني مسجل مسبقاً' };
  }

  const newUser: User = {
    id: 'user-' + Date.now().toString().slice(-8),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    createdAt: new Date().toISOString(),
  };

  // حفظ المستخدم
  users.push(newUser);
  localStorage.setItem('thanaya-users', JSON.stringify(users));
  
  // حفظ كلمة المرور (مشفرة بشكل بسيط - للتبسيط)
  const passwords = JSON.parse(localStorage.getItem('thanaya-passwords') || '{}');
  passwords[email.toLowerCase().trim()] = btoa(password); // تشفير بسيط
  localStorage.setItem('thanaya-passwords', JSON.stringify(passwords));

  // تسجيل دخول تلقائي
  localStorage.setItem('thanaya-current-user', JSON.stringify(newUser));
  
  return { user: newUser, error: '' };
};

export const loginUser = (email: string, password: string): { user: User | null; error: string } => {
  // التحقق من الحقول الفارغة
  if (!email.trim() || !password.trim()) {
    return { user: null, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  // التحقق من صيغة البريد
  if (!validateEmail(email)) {
    return { user: null, error: 'البريد الإلكتروني غير صحيح' };
  }

  const users = getUsers();
  const passwords = JSON.parse(localStorage.getItem('thanaya-passwords') || '{}');
  
  const user = users.find((u) => u.email === email.toLowerCase().trim());
  
  if (!user) {
    return { user: null, error: 'البريد الإلكتروني غير مسجل' };
  }

  // التحقق من كلمة المرور
  const savedPassword = passwords[email.toLowerCase().trim()];
  if (!savedPassword || atob(savedPassword) !== password) {
    return { user: null, error: 'كلمة المرور غير صحيحة' };
  }

  localStorage.setItem('thanaya-current-user', JSON.stringify(user));
  return { user, error: '' };
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

// 2) إصلاح صفحة تسجيل الدخول
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = loginUser(form.email, form.password);
    
    if (result.user) {
      refreshUser();
      router.push('/account');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
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
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="6 أحرف على الأقل"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white rounded-full py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition disabled:opacity-50"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
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

// 3) إصلاح صفحة إنشاء حساب
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
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // التحقق من تطابق كلمة المرور
    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    const result = registerUser(form.name, form.email, form.phone, form.password);
    
    if (result.user) {
      refreshUser();
      router.push('/account');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
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
                minLength={3}
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
                pattern="07[0-9]{9}"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="07822088894"
              />
              <p className="text-xs text-neutral-500 mt-1">يجب أن يبدأ بـ 07 ويتكون من 10 أرقام</p>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">كلمة المرور</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="6 أحرف على الأقل"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm text-ink">تأكيد كلمة المرور</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full border-2 border-brand/30 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand"
                placeholder="أعد كتابة كلمة المرور"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white rounded-full py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition disabled:opacity-50"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
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

console.log('✅ تم إصلاح نظام المصادقة');
console.log(' التحسينات:');
console.log(' - التحقق من كلمة المرور (6 أحرف على الأقل)');
console.log(' - التحقق من صيغة البريد الإلكتروني');
console.log(' - التحقق من رقم الهاتف (07 + 9 أرقام)');
console.log(' - التحقق من تطابق كلمة المرور');
console.log(' - رسائل خطأ واضحة');
console.log(' - تشفير بسيط لكلمات المرور');
