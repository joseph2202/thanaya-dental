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
      className={`bg-brand text-white rounded-full px-8 py-3 font-bold transition ${
        added ? 'bg-success shadow-[4px_4px_0_#059669]' : 'shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8]'
      }`}
    >
      {added ? '✓ تمت الإضافة' : 'أضف للسلة'}
    </button>
  );
}
