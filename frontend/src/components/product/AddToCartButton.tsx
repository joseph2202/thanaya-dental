"use client";
import { useCart } from '@/context/CartContext';
import { Product } from '@/data/products';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      className={`bg-ink text-paper rounded-full px-8 py-3 font-bold transition ${
        added ? 'bg-green-600 shadow-[4px_4px_0_#16a34a]' : 'shadow-[4px_4px_0_#FDE047] hover:shadow-[6px_6px_0_#FDE047]'
      }`}
    >
      {added ? '✓ تمت الإضافة' : 'أضف للسلة'}
    </button>
  );
}
