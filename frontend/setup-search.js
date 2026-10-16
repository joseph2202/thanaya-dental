const fs = require('fs');

// 1) إنشاء مكتبة البحث
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/search.ts', `import { products, Product } from '@/data/products';

export type SearchFilters = {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
};

export function searchProducts(filters: SearchFilters): Product[] {
  let results = [...products];

  // البحث بالنص
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // فلتر التصنيف
  if (filters.category) {
    results = results.filter((p) => p.category === filters.category);
  }

  // فلتر الماركة
  if (filters.brand) {
    results = results.filter((p) => p.brand === filters.brand);
  }

  // فلتر السعر
  if (filters.minPrice !== undefined) {
    results = results.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= filters.maxPrice!);
  }

  // الترتيب
  if (filters.sortBy === 'price-asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }

  return results;
}

export function getAllBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))];
}

export function getAllCategories(): string[] {
  return [...new Set(products.map((p) => p.category))];
}

export function getPriceRange(): { min: number; max: number } {
  const prices = products.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
`);

// 2) تحديث Header.tsx - إضافة شريط البحث
fs.writeFileSync('src/components/layout/Header.tsx', `"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { totalItems } = useCart();
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

        <Link href="/cart" className="bg-brand text-white rounded-full px-5 py-2 font-bold relative hover:bg-brand-dark transition">
          السلة
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-ink text-white rounded-full w-6 h-6 grid place-items-center text-xs font-black border-2 border-paper">
              {totalItems}
            </span>
          )}
        </Link>
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

// 3) إنشاء صفحة البحث
fs.mkdirSync('src/app/search', { recursive: true });
fs.writeFileSync('src/app/search/page.tsx', `import { Suspense } from 'react';
import { searchProducts } from '@/lib/search';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

function SearchResults({ query }: { query: string }) {
  const results = searchProducts({ query });

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-4 text-ink">نتائج البحث</h1>
        <p className="text-neutral-600 mb-8">
          {results.length > 0
            ? \`عُثر على \${results.length} نتيجة لـ "\${query}"\`
            : \`لم يُعثر على نتائج لـ "\${query}"\`}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-2xl font-black mb-4 text-ink">لا توجد نتائج</h2>
            <p className="text-neutral-600 mb-8">جرب كلمات بحث مختلفة أو تصفح المنتجات</p>
            <Link href="/products" className="bg-brand text-white rounded-full px-8 py-3 font-bold inline-block shadow-[4px_4px_0_#047ba8]">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((p) => (
              <Link
                key={p.id}
                href={\`/product/\${p.id}\`}
                className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:-translate-y-1 transition shadow-[4px_4px_0_#047ba8]"
              >
                <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-4xl">{p.emoji}</div>
                {p.badge && (
                  <span className="inline-block bg-brand/10 text-brand border border-brand/30 rounded-full px-2 py-0.5 text-xs mb-2">
                    {p.badge === 'new' ? 'جديد' : p.badge === 'sale' ? 'خصم' : 'مطلوب'}
                  </span>
                )}
                <h3 className="mb-1 text-sm text-ink">{p.name}</h3>
                <p className="text-xs text-neutral-500 mb-2">{p.brand}</p>
                <p className="text-ink font-black text-lg">{p.price.toLocaleString()} د.ع</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';

  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p>جاري البحث...</p>
        </main>
        <Footer />
      </>
    }>
      <SearchResults query={query} />
    </Suspense>
  );
}
`);

// 4) تحديث صفحة المنتجات - إضافة الفلاتر
fs.writeFileSync('src/app/products/page.tsx', `import { searchProducts, getAllBrands, getAllCategories, getPriceRange } from '@/lib/search';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function ProductsPage({ searchParams }: { searchParams: { category?: string; brand?: string; sort?: string; minPrice?: string; maxPrice?: string } }) {
  const filters = {
    category: searchParams.category,
    brand: searchParams.brand,
    sortBy: searchParams.sort as any,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
  };

  const products = searchProducts(filters);
  const brands = getAllBrands();
  const categories = getAllCategories();
  const priceRange = getPriceRange();

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-4 text-ink">المنتجات</h1>
        <p className="text-center text-neutral-600 mb-8">{products.length} منتج وجهاز متاح للتسوق</p>

        <div className="grid md:grid-cols-4 gap-6">
          {/* الفلاتر الجانبية */}
          <aside className="md:col-span-1">
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-5 sticky top-24 space-y-6">
              {/* التصنيف */}
              <div>
                <h3 className="font-black mb-3 text-ink">التصنيف</h3>
                <div className="space-y-2">
                  <Link href="/products" className="block text-sm hover:text-brand transition">الكل</Link>
                  {categories.map((c) => (
                    <Link
                      key={c}
                      href={\`/products?category=\${encodeURIComponent(c)}\`}
                      className={\`block text-sm transition \${searchParams.category === c ? 'text-brand font-bold' : 'hover:text-brand'}\`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>

              {/* الماركة */}
              <div>
                <h3 className="font-black mb-3 text-ink">الماركة</h3>
                <div className="space-y-2">
                  <Link href="/products" className="block text-sm hover:text-brand transition">الكل</Link>
                  {brands.map((b) => (
                    <Link
                      key={b}
                      href={\`/products?brand=\${encodeURIComponent(b)}\`}
                      className={\`block text-sm transition \${searchParams.brand === b ? 'text-brand font-bold' : 'hover:text-brand'}\`}
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              </div>

              {/* السعر */}
              <div>
                <h3 className="font-black mb-3 text-ink">السعر</h3>
                <form className="space-y-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="من"
                    defaultValue={searchParams.minPrice}
                    className="w-full border-2 border-brand/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="إلى"
                    defaultValue={searchParams.maxPrice}
                    className="w-full border-2 border-brand/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                  />
                  <button type="submit" className="w-full bg-brand text-white rounded-lg py-2 text-sm font-bold hover:bg-brand-dark transition">
                    تطبيق
                  </button>
                </form>
              </div>

              {/* إعادة تعيين */}
              <Link href="/products" className="block text-center bg-paper2 border-2 border-brand/30 rounded-lg py-2 text-sm font-bold hover:bg-brand/10 transition">
                إعادة تعيين الفلاتر
              </Link>
            </div>
          </aside>

          {/* المنتجات */}
          <div className="md:col-span-3">
            {/* شريط الترتيب */}
            <div className="bg-white border-2 border-brand/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <span className="font-bold text-sm text-ink">ترتيب حسب:</span>
              <div className="flex gap-2 flex-wrap">
                <Link href={\`/products?\${new URLSearchParams({ ...searchParams, sort: 'price-asc' }).toString()}\`} className={\`text-sm px-3 py-1 rounded-full transition \${searchParams.sort === 'price-asc' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}\`}>
                  السعر: الأقل
                </Link>
                <Link href={\`/products?\${new URLSearchParams({ ...searchParams, sort: 'price-desc' }).toString()}\`} className={\`text-sm px-3 py-1 rounded-full transition \${searchParams.sort === 'price-desc' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}\`}>
                  السعر: الأعلى
                </Link>
                <Link href={\`/products?\${new URLSearchParams({ ...searchParams, sort: 'name' }).toString()}\`} className={\`text-sm px-3 py-1 rounded-full transition \${searchParams.sort === 'name' ? 'bg-brand text-white' : 'bg-paper2 hover:bg-brand/10'}\`}>
                  الاسم
                </Link>
              </div>
            </div>

            {/* شبكة المنتجات */}
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">📦</div>
                <h2 className="text-2xl font-black mb-4 text-ink">لا توجد منتجات</h2>
                <p className="text-neutral-600 mb-8">جرب تغيير الفلاتر</p>
                <Link href="/products" className="bg-brand text-white rounded-full px-8 py-3 font-bold inline-block">
                  عرض كل المنتجات
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={\`/product/\${p.id}\`}
                    className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:-translate-y-1 transition shadow-[4px_4px_0_#047ba8]"
                  >
                    <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-4xl">{p.emoji}</div>
                    {p.badge && (
                      <span className="inline-block bg-brand/10 text-brand border border-brand/30 rounded-full px-2 py-0.5 text-xs mb-2">
                        {p.badge === 'new' ? 'جديد' : p.badge === 'sale' ? 'خصم' : 'مطلوب'}
                      </span>
                    )}
                    <h3 className="mb-1 text-sm text-ink">{p.name}</h3>
                    <p className="text-xs text-neutral-500 mb-2">{p.brand}</p>
                    <p className="text-ink font-black text-lg">{p.price.toLocaleString()} د.ع</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`);

// 5) تحديث Hero.tsx - تفعيل الأزرار
fs.writeFileSync('src/components/home/Hero.tsx', `import Link from 'next/link';

export default function Hero() {
  return (
    <section className="py-16 text-center px-4">
      <span className="bg-brand/10 text-brand border border-brand/30 rounded-full px-4 py-2 text-sm font-bold inline-block">◆ متجر طبي عراقي — مستلزمات وأجهزة</span>
      <h1 className="text-5xl md:text-7xl font-black leading-tight mt-6 text-ink">
        كل ما تحتاجه عيادتك،
        <br />
        <span className="text-brand">من أصغر أداة إلى أكبر جهاز.</span>
      </h1>
      <p className="max-w-xl mx-auto text-neutral-600 leading-9 mt-6">
        الثنايا متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة: منتجات موثقة، أسعار بالدينار والدولار، وتوصيل لكل المحافظات.
      </p>
      <div className="flex gap-4 justify-center mt-8 flex-wrap">
        <Link href="/products" className="bg-brand text-white rounded-full px-7 py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition">
          تسوق الآن
        </Link>
        <Link href="/products?category=أجهزة طبية" className="border-2 border-ink rounded-full px-7 py-3 font-bold bg-white hover:bg-paper2 transition">
          تصفح الأجهزة
        </Link>
      </div>
    </section>
  );
}
`);

// 6) تحديث Categories.tsx - تفعيل أزرار التصنيفات
fs.writeFileSync('src/components/home/Categories.tsx', `import Link from 'next/link';

const cats = [
  { name: "مستلزمات طبية", icon: "" },
  { name: "طب الأسنان", icon: "🦷" },
  { name: "أجهزة طبية", icon: "🖥️" },
  { name: "مختبرات", icon: "" },
  { name: "تعقيم", icon: "🧼" },
  { name: "كراسي ومتحركة", icon: "🪑" },
];

export default function Categories() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-ink">تصفح التصنيفات</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cats.map((c) => (
          <Link
            key={c.name}
            href={\`/products?category=\${encodeURIComponent(c.name)}\`}
            className="bg-white border-2 border-brand/20 rounded-2xl p-6 text-center font-bold hover:bg-brand hover:text-white hover:border-brand hover:-translate-y-1 transition"
          >
            <span className="text-3xl block mb-2">{c.icon}</span>
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
`);

// 7) تحديث OfferBanner.tsx - تفعيل الزر
fs.writeFileSync('src/components/home/OfferBanner.tsx', `import Link from 'next/link';

export default function OfferBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-brand to-brand-dark border-2 border-brand rounded-3xl p-10 text-center text-white">
        <h2 className="text-3xl md:text-5xl font-black mb-4">عرض الأسبوع: خصم 20% على الأجهزة</h2>
        <p className="text-white/90 leading-8 mb-6">لفترة محدودة — استخدم الكود THANAYA20 عند الدفع.</p>
        <Link href="/offers" className="inline-block bg-white text-brand rounded-full px-8 py-3 font-bold shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8] transition">
          اطلب الآن
        </Link>
      </div>
    </section>
  );
}
`);

// 8) تحديث Products.tsx (الصفحة الرئيسية) - تفعيل زر أضف للسلة
fs.writeFileSync('src/components/home/Products.tsx', `"use client";
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import Link from 'next/link';

export default function Products() {
  const { addToCart } = useCart();

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-ink">منتجات مختارة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p) => (
          <div key={p.id} className="bg-white border-2 border-brand/20 rounded-2xl p-6 font-bold hover:border-brand transition">
            <Link href={\`/product/\${p.id}\`}>
              <div className="bg-paper2 rounded-xl h-32 mb-4 grid place-items-center text-4xl">{p.emoji}</div>
              <h3 className="mb-2 text-ink">{p.name}</h3>
              <p className="text-ink font-black text-lg">{p.price.toLocaleString()} د.ع</p>
            </Link>
            <button
              onClick={() => addToCart(p)}
              className="mt-4 w-full bg-brand text-white rounded-full py-2 font-bold hover:bg-brand-dark transition"
            >
              أضف للسلة
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
`);

console.log('✅ تم إنشاء نظام البحث والفلترة الكامل');
console.log('🔍 شريط بحث بالهيدر');
console.log('📄 صفحة /search?q=...');
console.log('🎛️ فلاتر صفحة المنتجات (تصنيف، ماركة، سعر، ترتيب)');
console.log(' تفعيل أزرار Hero و Categories و OfferBanner');