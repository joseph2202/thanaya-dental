"use client";
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
                  <span className={`text-sm font-bold ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
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
