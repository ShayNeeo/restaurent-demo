'use client';

import { useEffect, useState } from 'react';

import { getBackendApiUrl } from '@/lib/api';

interface GiftCoupon {
  code: string;
  value_cents: number;
  remaining_cents: number;
  purchaser_email?: string | null;
  created_at: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value / 100);
}

export default function AdminGiftCoupons() {
  const [coupons, setCoupons] = useState<GiftCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGiftCoupons = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/gift-coupons'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const message = await response.text();
          setError(message || 'Failed to load gift coupons');
          return;
        }

        const data = await response.json();
        setCoupons(Array.isArray(data.gift_coupons) ? data.gift_coupons : []);
      } catch (err) {
        console.error(err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchGiftCoupons();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading gift coupons...</div>;

  if (error) return <div className="py-12 text-center text-red-400">{error}</div>;

  if (coupons.length === 0) return <div className="py-12 text-center text-gray-400">No gift coupons</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Initial Value</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Remaining</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Purchaser</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {coupons.map((coupon) => (
            <tr key={coupon.code} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm font-mono text-white">{coupon.code}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{formatCurrency(coupon.value_cents)}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{formatCurrency(coupon.remaining_cents)}</td>
              <td className="px-6 py-3 text-sm text-gray-400">{coupon.purchaser_email || '—'}</td>
              <td className="px-6 py-3 text-sm text-gray-400">
                {new Date(coupon.created_at).toLocaleString('de-DE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

