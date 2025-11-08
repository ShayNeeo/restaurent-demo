'use client';

import { getBackendApiUrl } from '@/lib/api';

import { useState, useEffect } from 'react';

interface GiftCoupon {
  id: number;
  code: string;
  value_cents: number;
  created_at: string;
}

export default function AdminGiftCoupons() {
  const [coupons, setCoupons] = useState<GiftCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiftCoupons = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/gift-coupons`, {
          headers: { Authorization: `Bearer ${token}') },
        });

        if (response.ok) {
          const data = await response.json();
          setCoupons(data.gift_coupons || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGiftCoupons();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading gift coupons...</div>;

  if (coupons.length === 0) return <div className="py-12 text-center text-gray-400">No gift coupons</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Value</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm font-mono text-white">{coupon.code}</td>
              <td className="px-6 py-3 text-sm text-gray-300">€{(coupon.value_cents / 100).toFixed(2)}</td>
              <td className="px-6 py-3 text-sm text-gray-400">{new Date(coupon.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

