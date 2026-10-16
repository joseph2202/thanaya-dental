const fs = require('fs');

// 1) إنشاء ملف Pattern SVG
fs.mkdirSync('public/patterns', { recursive: true });
fs.writeFileSync('public/patterns/medical-plus.svg', `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 10v10M10 15h10" stroke="#5dbee0" stroke-width="1.5" stroke-linecap="round" opacity="0.15"/>
</svg>`);

// 2) تحديث globals.css - إزالة الخلفية القديمة
fs.writeFileSync('src/app/globals.css', `@import "tailwindcss";

@theme {
  --color-ink: #2e2e2d;
  --color-paper: #f1f5f6;
  --color-paper2: #e8eef1;
  --color-brand: #059bd0;
  --color-brand-dark: #047ba8;
  --color-brand-light: #5dbee0;
  --color-brand-lighter: #b2dff0;
  --color-accent: #059bd0;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --font-sans: "Thmanyah Sans", "IBM Plex Sans Arabic", "Cairo", sans-serif;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
}

@keyframes marquee {
  from { transform: translateX(50%); }
  to { transform: translateX(0); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
  display: flex;
  gap: 2rem;
}
`);

// 3) إنشاء مكون BackgroundPattern
fs.mkdirSync('src/components/layout', { recursive: true });
fs.writeFileSync('src/components/layout/BackgroundPattern.tsx', `export default function BackgroundPattern() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{
        backgroundImage: 'url(/patterns/medical-plus.svg)',
        backgroundSize: '30px 30px',
      }}
    />
  );
}
`);

// 4) تحديث layout.tsx - إضافة BackgroundPattern
fs.writeFileSync('src/app/layout.tsx', `import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
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
          <CartProvider>{children}</CartProvider>
        </div>
      </body>
    </html>
  );
}
`);

console.log('✅ تم إصلاح الخلفية الطبية');
console.log(' الطريقة: div ثابت مع SVG file');
console.log(' الشفافية: 40% (أوضح شوي)');