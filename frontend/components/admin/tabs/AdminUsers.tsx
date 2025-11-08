'use client';

import { useEffect, useState } from 'react';

import { getBackendApiUrl } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/users'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const message = await response.text();
          setError(message || 'Failed to load users');
          return;
        }

        const data = await response.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        console.error(err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading users...</div>;

  if (error) return <div className="py-12 text-center text-red-400">{error}</div>;

  if (users.length === 0) {
    return <div className="py-12 text-center text-gray-400">No users found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">User ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Role</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm text-white">
                <span className="font-mono text-xs uppercase tracking-widest text-gray-300">#{user.id}</span>
              </td>
              <td className="px-6 py-3 text-sm text-gray-300">{user.email}</td>
              <td className="px-6 py-3 text-sm text-gray-300 capitalize">{user.role || 'customer'}</td>
              <td className="px-6 py-3 text-sm text-gray-400">
                {new Date(user.created_at).toLocaleString('de-DE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
