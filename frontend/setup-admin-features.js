const fs = require('fs');

// 1) تحديث AdminLayout - إضافة Sidebar + Breadcrumb
fs.writeFileSync('src/components/admin/AdminLayout.tsx', `"use client";
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
              className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition \${
                pathname === item.href
                  ? 'bg-brand text-white'
                  : 'hover:bg-paper/10'
              }\`}
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
`);

// 2) تفعيل أزرار الحذف والتعديل بصفحة المنتجات
fs.writeFileSync('src/app/admin/products/page.tsx', `"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { products as initialProducts, Product } from '@/data/products';
import Link from 'next/link';

export default function AdminProducts() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('thanaya-products');
    if (saved) {
      setProductsList(JSON.parse(saved));
    } else {
      setProductsList(initialProducts);
      localStorage.setItem('thanaya-products', JSON.stringify(initialProducts));
    }
  }, []);

  const handleDelete = (productId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = productsList.filter(p => p.id !== productId);
      setProductsList(updated);
      localStorage.setItem('thanaya-products', JSON.stringify(updated));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleSave = (product: Product) => {
    let updated;
    if (editingProduct) {
      updated = productsList.map(p => p.id === product.id ? product : p);
    } else {
      updated = [...productsList, product];
    }
    setProductsList(updated);
    localStorage.setItem('thanaya-products', JSON.stringify(updated));
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-ink">إدارة المنتجات</h2>
        <button
          onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
          className="bg-brand text-white rounded-full px-6 py-2 font-bold hover:bg-brand-dark transition"
        >
          + إضافة منتج
        </button>
      </div>

      {showAddForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => { setShowAddForm(false); setEditingProduct(null); }}
        />
      )}

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="w-full max-w-md border-2 border-brand/30 rounded-xl px-4 py-2 font-bold focus:outline-none focus:border-brand"
        />
      </div>

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
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-xs bg-brand/10 text-brand rounded-lg px-3 py-1 font-bold hover:bg-brand/20"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs bg-red-50 text-red-600 rounded-lg px-3 py-1 font-bold hover:bg-red-100"
                    >
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

function ProductForm({ product, onSave, onCancel }: { product: Product | null; onSave: (p: Product) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Product>(product || {
    id: 'product-' + Date.now(),
    name: '',
    description: '',
    price: 0,
    usdPrice: 0,
    category: '',
    brand: '',
    emoji: '📦',
    stock: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-white border-2 border-brand/20 rounded-2xl p-6 mb-6">
      <h3 className="font-black text-lg mb-4">{product ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="اسم المنتج"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="text"
          placeholder="التصنيف"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="number"
          placeholder="السعر (د.ع)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="number"
          placeholder="السعر (دولار)"
          value={form.usdPrice}
          onChange={(e) => setForm({ ...form, usdPrice: Number(e.target.value) })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="text"
          placeholder="الماركة"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="number"
          placeholder="المخزون"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="text"
          placeholder="Emoji (مثل 🦷)"
          value={form.emoji}
          onChange={(e) => setForm({ ...form, emoji: e.target.value })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <textarea
          placeholder="الوصف"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border-2 border-brand/30 rounded-xl px-4 py-2 col-span-2"
          rows={3}
          required
        />
        <div className="col-span-2 flex gap-3">
          <button type="submit" className="bg-brand text-white rounded-full px-6 py-2 font-bold">
            حفظ
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 rounded-full px-6 py-2 font-bold">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
`);

// 3) إنشاء صفحة إدارة التصنيفات
fs.mkdirSync('src/app/admin/categories', { recursive: true });
fs.writeFileSync('src/app/admin/categories/page.tsx', `"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

type Category = { id: string; name: string; icon: string };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });

  useEffect(() => {
    const saved = localStorage.getItem('thanaya-categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      const defaultCats: Category[] = [
        { id: '1', name: 'مستلزمات طبية', icon: '🩺' },
        { id: '2', name: 'طب الأسنان', icon: '🦷' },
        { id: '3', name: 'أجهزة طبية', icon: '️' },
        { id: '4', name: 'مختبرات', icon: '' },
        { id: '5', name: 'تعقيم', icon: '🧼' },
        { id: '6', name: 'كراسي ومتحركة', icon: '' },
      ];
      setCategories(defaultCats);
      localStorage.setItem('thanaya-categories', JSON.stringify(defaultCats));
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: newCategory.name,
      icon: newCategory.icon || '📦',
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('thanaya-categories', JSON.stringify(updated));
    setNewCategory({ name: '', icon: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('thanaya-categories', JSON.stringify(updated));
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-3xl font-black mb-8 text-ink">إدارة التصنيفات</h2>

      <form onSubmit={handleAdd} className="bg-white border-2 border-brand/20 rounded-2xl p-6 mb-6 flex gap-4">
        <input
          type="text"
          placeholder="اسم التصنيف"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="flex-1 border-2 border-brand/30 rounded-xl px-4 py-2"
          required
        />
        <input
          type="text"
          placeholder="أيقونة (Emoji)"
          value={newCategory.icon}
          onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
          className="w-32 border-2 border-brand/30 rounded-xl px-4 py-2"
        />
        <button type="submit" className="bg-brand text-white rounded-full px-6 py-2 font-bold">
          إضافة
        </button>
      </form>

      <div className="bg-white border-2 border-brand/20 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-paper2">
            <tr>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">الأيقونة</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">الاسم</th>
              <th className="px-4 py-3 text-right font-black text-sm text-ink">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-brand/10">
                <td className="px-4 py-3 text-2xl">{cat.icon}</td>
                <td className="px-4 py-3 font-bold text-ink">{cat.name}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(cat.id)}
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
`);

// 4) إنشاء صفحة إدارة الكوبونات
fs.mkdirSync('src/app/admin/coupons', { recursive: true });
fs.writeFileSync('src/app/admin/coupons/page.tsx', `"use client";
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
                    className={\`text-xs px-3 py-1 rounded-full font-bold \${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}\`}
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
`);

// 5) إنشاء صفحة الإعدادات
fs.mkdirSync('src/app/admin/settings', { recursive: true });
fs.writeFileSync('src/app/admin/settings/page.tsx', `"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

type Settings = {
  siteName: string;
  siteDescription: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'الثنايا',
    siteDescription: 'متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة',
    phone: '07822088894',
    email: 'info@thanaya.iq',
    address: 'البصرة - حي الخضراء - شارع مستشفى النفط',
    workingHours: 'السبت - الخميس: 12 ظهراً - 9 مساءً',
  });

  useEffect(() => {
    const saved = localStorage.getItem('thanaya-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('thanaya-settings', JSON.stringify(settings));
    alert('تم حفظ الإعدادات بنجاح');
  };

  return (
    <AdminLayout>
      <h2 className="text-3xl font-black mb-8 text-ink">إعدادات الموقع</h2>

      <form onSubmit={handleSave} className="bg-white border-2 border-brand/20 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block font-bold mb-2 text-sm text-ink">اسم الموقع</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full border-2 border-brand/30 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-sm text-ink">وصف الموقع</label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            className="w-full border-2 border-brand/30 rounded-xl px-4 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-sm text-ink">رقم الهاتف</label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            className="w-full border-2 border-brand/30 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-sm text-ink">البريد الإلكتروني</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            className="w-full border-2 border-brand/30 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-sm text-ink">العنوان</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full border-2 border-brand/30 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-sm text-ink">ساعات العمل</label>
          <input
            type="text"
            value={settings.workingHours}
            onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
            className="w-full border-2 border-brand/30 rounded-xl px-4 py-2"
          />
        </div>

        <button type="submit" className="bg-brand text-white rounded-full px-6 py-3 font-bold">
          حفظ الإعدادات
        </button>
      </form>
    </AdminLayout>
  );
}
`);

console.log('تم انشاء ميزات لوحة الادارة الكاملة');
console.log('- Sidebar للتنقل');
console.log('- Breadcrumb لمسار التنقل');
console.log('- تفعيل ازرار التعديل والحذف والاضافة');
console.log('- صفحة التصنيفات');
console.log('- صفحة الكوبونات');
console.log('- صفحة الاعدادات');