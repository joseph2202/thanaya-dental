import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4 py-10">
        <div>
          <h3 className="font-black text-xl mb-3">ثنايا</h3>
          <p className="text-paper/80 leading-8">متجر عراقي للمستلزمات الطبية وطب الأسنان والأجهزة.</p>
        </div>
        <div>
          <h3 className="font-black text-xl mb-3">روابط</h3>
          <ul className="space-y-2 font-bold">
            <li><Link href="/products" className="hover:text-mark">المنتجات</Link></li>
            <li><Link href="/categories" className="hover:text-mark">التصنيفات</Link></li>
            <li><Link href="/offers" className="hover:text-mark">العروض</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-black text-xl mb-3">تواصل</h3>
          <p className="text-paper/80 leading-8">بغداد — الكرادة<br />info@thanaya.iq</p>
        </div>
      </div>
      <div className="border-t border-paper/20 py-4 text-center text-paper/60 text-sm">© 2025 ثنايا — كل الحقوق محفوظة</div>
    </footer>
  );
}
