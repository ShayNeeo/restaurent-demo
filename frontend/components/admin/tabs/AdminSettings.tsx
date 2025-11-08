'use client';

import { getBackendApiUrl } from '@/lib/api';

interface AdminSettingsProps {
  user: { email: string } | null;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-yellow-500">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400">Email</label>
            <p className="mt-1 text-white">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400">Role</label>
            <p className="mt-1 text-white">Administrator</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-yellow-500">About</h3>
        <div className="space-y-4 text-sm text-gray-400">
          <p>NGUYEN Restaurant Admin Dashboard</p>
          <p>Version 2.0 (Next.js)</p>
          <p className="text-xs text-gray-500">All administrative actions are logged and monitored.</p>
        </div>
      </div>
    </div>
  );
}

