const fs = require('fs');

// 1) إصلاح صفحة البحث - إضافة instant = false
let searchContent = fs.readFileSync('src/app/search/page.tsx', 'utf8');
if (!searchContent.includes('export const instant')) {
  searchContent = searchContent.replace(
    "import { searchProducts } from '@/lib/search';",
    "import { searchProducts } from '@/lib/search';\n\nexport const instant = false;"
  );
  fs.writeFileSync('src/app/search/page.tsx', searchContent);
}

// 2) إصلاح صفحة المنتجات - إضافة instant = false
let productsContent = fs.readFileSync('src/app/products/page.tsx', 'utf8');
if (!productsContent.includes('export const instant')) {
  productsContent = productsContent.replace(
    "import { searchProducts, getAllBrands, getAllCategories, getPriceRange } from '@/lib/search';",
    "import { searchProducts, getAllBrands, getAllCategories, getPriceRange } from '@/lib/search';\n\nexport const instant = false;"
  );
  fs.writeFileSync('src/app/products/page.tsx', productsContent);
}

console.log('✅ تم إصلاح مشكلة Blocking Route');
console.log(' تمت إضافة export const instant = false');
console.log(' - src/app/search/page.tsx');
console.log(' - src/app/products/page.tsx');