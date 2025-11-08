'use client';

import { useState, useEffect } from 'react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  details?: Record<string, string>;
}

export default function AdminHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/health`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading health status...</div>;
  }

  const statusColors = {
    healthy: 'bg-green-500/20 border-green-500 text-green-400',
    degraded: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    unhealthy: 'bg-red-500/20 border-red-500 text-red-400',
  };

  const color = statusColors[health?.status || 'unhealthy'];

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border p-6 ${color}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">System Status</p>
            <p className="mt-2 text-2xl font-bold capitalize">{health?.status}</p>
          </div>
          <div className="text-4xl">🏥</div>
        </div>
        <p className="mt-4 text-xs opacity-75">Last checked: {new Date(health?.timestamp || '').toLocaleTimeString()}</p>
      </div>

      {health?.details && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
          <h3 className="mb-4 font-semibold text-yellow-500">Details</h3>
          <div className="space-y-2">
            {Object.entries(health.details).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-400">{key}</span>
                <span className="font-mono text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

