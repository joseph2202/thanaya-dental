"use client";
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
