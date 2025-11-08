'use client';

import { useEffect, useState } from 'react';

import { getBackendApiUrl } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price_cents: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value / 100);
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/products'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const message = await response.text();
          setError(message || 'Failed to load products');
          return;
        }

        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error(err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading products...</div>;

  if (error) return <div className="py-12 text-center text-red-400">{error}</div>;

  if (products.length === 0) {
    return <div className="py-12 text-center text-gray-400">No products configured</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Product ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm text-white">
                <span className="font-mono text-xs uppercase tracking-widest text-gray-300">#{product.id}</span>
              </td>
              <td className="px-6 py-3 text-sm text-gray-300">{product.name}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{formatCurrency(product.price_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
