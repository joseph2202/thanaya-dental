const fs = require('fs');

// 1) تحديث globals.css - إضافة pattern علامة +
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
  background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10v10M10 15h10' stroke='%235dbee0' stroke-width='1.5' stroke-linecap='round' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 30px 30px;
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

console.log('✅ تم إضافة خلفية علامة + الطبية');
console.log(' اللون: أزرق فاتح #5DBEE0 بشفافية 8%');
console.log(' الحجم: 30px × 30px (خفيف جداً)');