'use client';

import { getBackendApiUrl } from '@/lib/api';

import { useState, useEffect } from 'react';

interface PendingOrder {
  id: string;
  email?: string | null;
  total_cents: number;
  created_at: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value / 100);
}

export default function AdminPendingOrders() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/pending-orders'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const message = await response.text();
          setError(message || 'Failed to load pending orders');
          return;
        }

        const data = await response.json();
        setOrders(Array.isArray(data.pending_orders) ? data.pending_orders : []);
      } catch (err) {
        console.error(err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading pending orders...</div>;

  if (error) return <div className="py-12 text-center text-red-400">{error}</div>;

  if (orders.length === 0) return <div className="py-12 text-center text-gray-400">No pending orders</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Order ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Total</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm text-white">
                <span className="font-mono text-xs uppercase tracking-widest text-gray-300">#{order.id}</span>
              </td>
              <td className="px-6 py-3 text-sm text-gray-300">{order.email || '—'}</td>
              <td className="px-6 py-3 text-sm font-semibold text-white">{formatCurrency(order.total_cents)}</td>
              <td className="px-6 py-3 text-sm text-gray-400">
                {new Date(order.created_at).toLocaleString('de-DE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

