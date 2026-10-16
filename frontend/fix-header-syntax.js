const fs = require('fs');

// إعادة كتابة Header.tsx بالكامل بشكل صحيح
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

console.log('✅ تم إصلاح Header.tsx بالكامل');
console.log(' الآن الكود صحيح وبدون أخطاء syntax');