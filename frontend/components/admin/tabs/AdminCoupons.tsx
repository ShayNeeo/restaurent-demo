'use client';

import { useEffect, useState } from 'react';

import { getBackendApiUrl } from '@/lib/api';

interface Coupon {
  code: string;
  percent_off?: number | null;
  amount_off?: number | null;
  remaining_uses: number;
}

function formatDiscount(coupon: Coupon) {
  if (coupon.amount_off && coupon.amount_off > 0) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(coupon.amount_off / 100);
  }

  if (coupon.percent_off && coupon.percent_off > 0) {
    return `${coupon.percent_off}%`;
  }

  return '—';
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/coupons'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const message = await response.text();
          setError(message || 'Failed to load coupons');
          return;
        }

          const data = await response.json();
        setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      } catch (err) {
        console.error(err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading coupons...</div>;

  if (error) return <div className="py-12 text-center text-red-400">{error}</div>;

  if (coupons.length === 0) {
    return <div className="py-12 text-center text-gray-400">No coupons configured</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Discount</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Remaining Uses</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {coupons.map((coupon) => (
            <tr key={coupon.code} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm font-mono text-white">{coupon.code}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{formatDiscount(coupon)}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{coupon.remaining_uses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

