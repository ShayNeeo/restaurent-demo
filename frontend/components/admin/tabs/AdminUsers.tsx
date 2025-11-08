'use client';

import { getBackendApiUrl } from '@/lib/api';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('restaurant_jwt_v1');
        const response = await fetch(getBackendApiUrl('/admin/users'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading users...</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
      <table className="w-full">
        <thead className="border-b border-gray-700 bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">User ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-800">
              <td className="px-6 py-3 text-sm text-white">#{user.id}</td>
              <td className="px-6 py-3 text-sm text-gray-300">{user.email}</td>
              <td className="px-6 py-3 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

