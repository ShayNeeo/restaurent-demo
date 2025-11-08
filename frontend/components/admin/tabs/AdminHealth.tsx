'use client';

import { useEffect, useMemo, useState } from 'react';

import { getBackendApiUrl } from '@/lib/api';

interface HealthResponse {
  ok: boolean;
  database: {
    connected: boolean;
    users_table_exists: boolean;
    admin_user_exists: boolean;
    error?: string | null;
  };
  config: {
    smtp_configured: boolean;
    paypal_configured: boolean;
    admin_email_set: boolean;
  };
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

const STATUS_COLORS: Record<HealthStatus, string> = {
  healthy: 'bg-green-500/20 border-green-500 text-green-400',
  degraded: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  unhealthy: 'bg-red-500/20 border-red-500 text-red-400',
};

export default function AdminHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchHealth = async () => {
      try {
        const response = await fetch(getBackendApiUrl('/health/detailed'), {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const message = await response.text();
          if (!cancelled) {
            setError(message || 'Failed to load health status');
          }
          return;
        }

        const data: HealthResponse = await response.json();
        if (!cancelled) {
          setHealth(data);
          setLastChecked(new Date().toISOString());
          setError('');
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Connection error');
        }
      } finally {
        if (!cancelled) {
        setLoading(false);
        }
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const status: HealthStatus = useMemo(() => {
    if (!health) {
      return 'unhealthy';
    }

    if (!health.ok || !health.database.connected) {
      return 'unhealthy';
    }

    const missingConfig =
      !health.config.smtp_configured ||
      !health.config.paypal_configured ||
      !health.config.admin_email_set ||
      !health.database.admin_user_exists;

    return missingConfig ? 'degraded' : 'healthy';
  }, [health]);

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading health status...</div>;
  }

  if (error && !health) {
    return <div className="py-12 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border p-6 ${STATUS_COLORS[status]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">System Status</p>
            <p className="mt-2 text-2xl font-bold capitalize">{status}</p>
          </div>
          <div className="text-4xl">🏥</div>
        </div>
        <p className="mt-4 text-xs opacity-75">
          Last checked:{' '}
          {lastChecked ? new Date(lastChecked).toLocaleString('de-DE') : '—'}
        </p>
        {error && (
          <p className="mt-3 text-xs text-yellow-200">
            Notice: {error}
          </p>
        )}
      </div>

      {health && (
        <div className="grid gap-6 md:grid-cols-2">
          <DetailCard
            title="Database"
            rows={[
              { label: 'Connected', value: health.database.connected ? 'Yes' : 'No' },
              { label: 'Users table', value: health.database.users_table_exists ? 'Present' : 'Missing' },
              { label: 'Admin user', value: health.database.admin_user_exists ? 'Found' : 'Missing' },
              ...(health.database.error ? [{ label: 'Last error', value: health.database.error }] : []),
            ]}
          />
          <DetailCard
            title="Configuration"
            rows={[
              { label: 'SMTP', value: health.config.smtp_configured ? 'Configured' : 'Missing' },
              { label: 'PayPal', value: health.config.paypal_configured ? 'Configured' : 'Missing' },
              { label: 'Admin email', value: health.config.admin_email_set ? 'Set' : 'Missing' },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function DetailCard({ title, rows }: { title: string; rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
      <h3 className="mb-4 font-semibold text-yellow-500">{title}</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-gray-400">{row.label}</span>
            <span className="font-mono text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

