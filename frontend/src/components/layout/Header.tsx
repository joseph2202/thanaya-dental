"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b-2 border-ink">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black text-xl">
          <span className="bg-ink text-paper rounded-full w-9 h-9 grid place-items-center">ث</span>
          ثنايا
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-bold">
          <Link href="/" className="hover:text-brand">الرئيسية</Link>
          <Link href="/products" className="hover:text-brand">المنتجات</Link>
          <Link href="/categories" className="hover:text-brand">التصنيفات</Link>
          <Link href="/offers" className="hover:text-brand">العروض</Link>
        </nav>
        <Link href="/cart" className="bg-ink text-paper rounded-full px-4 py-2 font-bold relative">
          السلة
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-mark text-ink rounded-full w-6 h-6 grid place-items-center text-xs font-black border border-ink">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
