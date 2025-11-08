'use client';

import { getBackendApiUrl } from '@/lib/api';

import { useState, useEffect } from 'react';

interface Coupon {
  id: number;
  code: string;
  discount_cents: number;
  remaining_uses: number;
  max_uses: number;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/coupons`, {
          headers: { Authorization: `Bearer ${token}') },
        });

        if (response.ok) {
          const data = await response.json();
          setCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading coupons...</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Discount</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Remaining Uses</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Max Uses</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm font-mono text-white">{coupon.code}</td>
              <td className="px-6 py-3 text-sm text-gray-300">€{(coupon.discount_cents / 100).toFixed(2)}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{coupon.remaining_uses}</td>
              <td className="px-6 py-3 text-sm text-gray-400">{coupon.max_uses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

