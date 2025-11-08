'use client';

import { useState, useEffect } from 'react';
import { getBackendApiUrl } from '@/lib/api';


interface Stats {
  total_orders: number;
  total_revenue: number;
  total_users: number;
  pending_orders: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/stats'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-400">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Orders" value={stats?.total_orders || 0} icon="📦" />
        <StatCard title="Total Revenue" value={`€${(stats?.total_revenue || 0) / 100}`} icon="💰" />
        <StatCard title="Total Users" value={stats?.total_users || 0} icon="👥" />
        <StatCard title="Pending Orders" value={stats?.pending_orders || 0} icon="⏳" color="yellow" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'blue' }: { title: string; value: string | number; icon: string; color?: string }) {
  const colorClass = color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500' : 'bg-blue-500/20 border-blue-500';

  return (
    <div className={`rounded-lg border ${colorClass} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

