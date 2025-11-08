'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/tabs/AdminOverview';
import AdminOrders from '@/components/admin/tabs/AdminOrders';
import AdminUsers from '@/components/admin/tabs/AdminUsers';
import AdminCoupons from '@/components/admin/tabs/AdminCoupons';
import AdminProducts from '@/components/admin/tabs/AdminProducts';
import AdminPendingOrders from '@/components/admin/tabs/AdminPendingOrders';
import AdminGiftCoupons from '@/components/admin/tabs/AdminGiftCoupons';
import AdminHealth from '@/components/admin/tabs/AdminHealth';
import AdminSettings from '@/components/admin/tabs/AdminSettings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const email = localStorage.getItem('restaurant_email_v1');
    const jwt = localStorage.getItem('restaurant_jwt_v1');

    if (!email || !jwt) {
      router.push('/admin/login');
      return;
    }

    setUser({ email });
    setLoading(false);
  }, [router]);

  const handleSignOut = () => {
    if (confirm('Sign out?')) {
      localStorage.removeItem('restaurant_jwt_v1');
      localStorage.removeItem('restaurant_email_v1');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-gray-700 bg-gray-900 px-6 py-4">
          <h1 className="text-2xl font-bold text-yellow-500">Database Management</h1>
          <p className="mt-1 text-sm text-gray-400">Manage all restaurant data and system settings</p>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'coupons' && <AdminCoupons />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'pending' && <AdminPendingOrders />}
          {activeTab === 'giftcodes' && <AdminGiftCoupons />}
          {activeTab === 'health' && <AdminHealth />}
          {activeTab === 'settings' && <AdminSettings user={user} />}
        </div>
      </main>
    </div>
  );
}

