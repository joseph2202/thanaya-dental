"use client";
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/data/products';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BuyNowButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleBuyNow = () => {
    // التحقق من المخزون
    const result = addToCart(product);
    
    if (!result.success) {
      setMessage(result.message);
      setIsError(true);
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    // إذا ما كان مسجل، يروح للـ login أولاً
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // يروح مباشرة للـ checkout
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleBuyNow}
        disabled={product.stock <= 0}
        className="bg-ink text-paper rounded-full px-8 py-3 font-bold hover:bg-ink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {product.stock <= 0 ? 'نفد المخزون' : 'اشتري الآن'}
      </button>
      {message && isError && (
        <p className="text-red-600 text-sm font-bold">{message}</p>
      )}
    </div>
  );
}
