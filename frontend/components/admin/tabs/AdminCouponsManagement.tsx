'use client';

import { useEffect, useState } from 'react';
import { getBackendApiUrl } from '@/lib/api';

interface Coupon {
  code: string;
  percent_off?: number | null;
  amount_off?: number | null;
  remaining_uses: number;
}

export default function AdminCouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    percentOff: '',
    amountOff: '',
    remainingUses: '100',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl('/admin/coupons'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      setError('Code required');
      return;
    }
    if (!formData.percentOff && !formData.amountOff) {
      setError('Must specify either percentage or fixed amount discount');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl('/admin/coupons'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          percent_off: formData.percentOff ? parseInt(formData.percentOff) : null,
          amount_off: formData.amountOff ? parseInt(formData.amountOff) : null,
          remaining_uses: parseInt(formData.remainingUses),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add coupon');
      }

      setFormData({ code: '', percentOff: '', amountOff: '', remainingUses: '100' });
      setShowForm(false);
      await fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;

    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl(`/admin/coupons/${code}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      await fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting coupon');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading coupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Coupon Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 text-gray-950 px-4 py-2 rounded font-semibold hover:bg-yellow-400"
        >
          {showForm ? 'Cancel' : '+ Add Coupon'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddCoupon} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SAVE10"
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded font-mono"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">% Off (optional)</label>
              <input
                type="number"
                value={formData.percentOff}
                onChange={(e) => setFormData({ ...formData, percentOff: e.target.value, amountOff: '' })}
                placeholder="10"
                min="0"
                max="100"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">€ Off (optional)</label>
              <input
                type="number"
                value={formData.amountOff}
                onChange={(e) => setFormData({ ...formData, amountOff: e.target.value, percentOff: '' })}
                placeholder="500"
                min="0"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Remaining Uses</label>
            <input
              type="number"
              value={formData.remainingUses}
              onChange={(e) => setFormData({ ...formData, remainingUses: e.target.value })}
              min="0"
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-500 text-gray-950 py-2 rounded font-semibold hover:bg-yellow-400 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Coupon'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
        <table className="w-full">
          <thead className="border-b border-gray-700 bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Discount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Remaining Uses</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {coupons.map((coupon) => (
              <tr key={coupon.code} className="hover:bg-gray-800">
                <td className="px-6 py-3 text-sm font-mono text-white">{coupon.code}</td>
                <td className="px-6 py-3 text-sm text-gray-300">
                  {coupon.percent_off ? `${coupon.percent_off}%` : `€${(coupon.amount_off || 0) / 100}`}
                </td>
                <td className="px-6 py-3 text-sm text-gray-300">{coupon.remaining_uses}</td>
                <td className="px-6 py-3 text-sm">
                  <button
                    onClick={() => handleDeleteCoupon(coupon.code)}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

