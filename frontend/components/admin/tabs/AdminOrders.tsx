'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: number;
  email: string;
  total_cents: number;
  created_at: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
          setError('Failed to load orders');
        }
      } catch (err) {
        setError('Connection error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading orders...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-red-400">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="py-12 text-center text-gray-400">No orders yet</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Order ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Total</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm text-white">#{order.id}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{order.email}</td>
              <td className="px-6 py-3 text-sm font-semibold text-white">€{(order.total_cents / 100).toFixed(2)}</td>
              <td className="px-6 py-3 text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

