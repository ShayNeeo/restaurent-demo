'use client';

import { getBackendApiUrl } from '@/lib/api';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price_cents: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/products'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading products...</div>;

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
              <td className="px-6 py-3 text-sm text-white">#{product.id}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{product.name}</td>
              <td className="px-6 py-3 text-sm text-gray-300">€{(product.price_cents / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

