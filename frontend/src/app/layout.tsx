import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "ثنايا | مستلزمات وأجهزة طبية",
  description:
    "متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة: منتجات موثقة وأسعار بالدينار والدولار.",
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
      <body className="font-sans antialiased bg-paper text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
