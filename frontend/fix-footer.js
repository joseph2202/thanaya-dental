const fs = require('fs');

// تحديث Footer.tsx - استخدام logo-icon بدلاً من logo.png
fs.writeFileSync('src/components/layout/Footer.tsx', `import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4 py-10">
        <div>
          <Image
            src="/logo-icon.png"
            alt="Al Thanaya - الثنايا"
            width={50}
            height={50}
            className="h-12 w-12 mb-4"
          />
          <p className="text-paper/80 leading-8">متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة.</p>
        </div>
        <div>
          <h3 className="font-black text-xl mb-3 text-brand-light">روابط سريعة</h3>
          <ul className="space-y-2 font-bold">
            <li><Link href="/products" className="hover:text-brand-light transition">المنتجات</Link></li>
            <li><Link href="/categories" className="hover:text-brand-light transition">التصنيفات</Link></li>
            <li><Link href="/offers" className="hover:text-brand-light transition">العروض</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-black text-xl mb-3 text-brand-light">تواصل معنا</h3>
          <p className="text-paper/80 leading-8">بغداد — الكرادة<br />info@thanaya.iq</p>
        </div>
      </div>
      <div className="border-t border-paper/20 py-4 text-center text-paper/60 text-sm">© 2025 Al Thanaya — جميع الحقوق محفوظة</div>
    </footer>
  );
}
`);

console.log('✅ تم إصلاح الفوتر: استخدام logo-icon بدلاً من logo.png');
