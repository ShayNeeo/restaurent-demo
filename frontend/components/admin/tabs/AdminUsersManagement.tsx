'use client';

import { useEffect, useState } from 'react';
import { getBackendApiUrl } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl('/admin/users'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl('/admin/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      setFormData({ email: '', password: '', role: 'customer' });
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;

    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl(`/admin/users/${encodeURIComponent(email)}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user');
    }
  };

  const handleUpdateRole = async (email: string, newRole: string) => {
    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl(`/admin/users/${encodeURIComponent(email)}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating role');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">User Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 text-gray-950 px-4 py-2 rounded font-semibold hover:bg-yellow-400"
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddUser} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-500 text-gray-950 py-2 rounded font-semibold hover:bg-yellow-400 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add User'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
        <table className="w-full">
          <thead className="border-b border-gray-700 bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Joined</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800">
                <td className="px-6 py-3 text-sm text-white">{user.email}</td>
                <td className="px-6 py-3 text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.email, e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-sm text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 text-sm">
                  <button
                    onClick={() => handleDeleteUser(user.email)}
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

