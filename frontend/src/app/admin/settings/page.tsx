"use client";
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
