'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('restaurant_jwt_v1', data.token);
      localStorage.setItem('restaurant_email_v1', email);
      router.push('/admin');
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block h-12 w-12 rounded-lg bg-yellow-500 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-950">🍜</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Login</h1>
          <p className="mt-2 text-gray-400">NGUYEN Restaurant Management</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-700 bg-gray-900 p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-semibold text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-950 transition hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-400">
            Unauthorized access prohibited. All actions are logged.
          </p>
        </form>
      </div>
    </div>
  );
}

