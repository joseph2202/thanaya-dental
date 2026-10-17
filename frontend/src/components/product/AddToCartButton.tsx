"use client";
import { useCart, Product } from '@/context/CartContext';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleAdd = () => {
    const result = addToCart(product);
    setMessage(result.message);
    setIsError(!result.success);
    
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className={`bg-brand text-white rounded-full px-8 py-3 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
          message && !isError ? 'bg-success shadow-[4px_4px_0_#059669]' : 'shadow-[4px_4px_0_#047ba8] hover:shadow-[6px_6px_0_#047ba8]'
        }`}
      >
        {product.stock <= 0 ? 'نفد المخزون' : (message || 'أضف للسلة')}
      </button>
      {message && isError && (
        <p className="text-red-600 text-sm font-bold">{message}</p>
      )}
    </div>
  );
}
