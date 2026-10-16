"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const navItems = [
  { href: '/admin', label: 'نظرة عامة', icon: '' },
  { href: '/admin/products', label: 'المنتجات', icon: '' },
  { href: '/admin/orders', label: 'الطلبات', icon: '🛒' },
  { href: '/admin/users', label: 'المستخدمين', icon: '👥' },
  { href: '/admin/categories', label: 'التصنيفات', icon: '️' },
  { href: '/admin/coupons', label: 'الكوبونات', icon: '🎟️' },
  { href: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'الرئيسية', href: '/' }];
    let currentPath = '';
    for (const path of paths) {
      currentPath += '/' + path;
      const item = navItems.find(n => n.href === currentPath);
      if (item) {
        breadcrumbs.push({ label: item.label, href: currentPath });
      } else {
        breadcrumbs.push({ label: path, href: currentPath });
      }
    }
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-paper fixed h-full overflow-y-auto">
        <div className="p-4 border-b border-paper/20">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="Logo" width={32} height={32} />
            <h1 className="font-black text-lg">لوحة الإدارة</h1>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                pathname === item.href
                  ? 'bg-brand text-white'
                  : 'hover:bg-paper/10'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-paper/20 mt-auto">
          <Link href="/" className="block text-sm hover:text-brand-light transition mb-2">
            ← عرض الموقع
          </Link>
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300 transition"
          >
            خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 mr-64">
        {/* Breadcrumb */}
        <div className="bg-white border-b-2 border-brand/20 px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-neutral-400">/</span>}
                {index < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="text-brand hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ink font-bold">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
