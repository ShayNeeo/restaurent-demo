'use client';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, onSignOut }: AdminSidebarProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'coupons', label: 'Coupons', icon: '🎟️' },
    { id: 'products', label: 'Products', icon: '🍽️' },
    { id: 'pending', label: 'Pending Orders', icon: '⏳' },
    { id: 'giftcodes', label: 'Gift Coupons', icon: '🎁' },
  ];

  const systemTabs = [
    { id: 'health', label: 'Health Check', icon: '🏥' },
  ];

  return (
    <aside className="w-64 border-r border-gray-700 bg-gray-900 p-6">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-block text-3xl">🍜</div>
        <div className="font-bold text-yellow-500">Admin Panel</div>
        <div className="mt-1 text-xs text-gray-500">Restaurant Management</div>
      </div>

      {/* Dashboard Section */}
      <div className="mb-8">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-500">Dashboard</h3>
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-gray-950 font-semibold'
                  : 'border border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* System Section */}
      <div className="mb-8 border-t border-gray-700 pt-8">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-500">System</h3>
        <div className="space-y-2">
          {systemTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-gray-950 font-semibold'
                  : 'border border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <a
            href="/test-email"
            className="block w-full rounded-lg border border-gray-700 px-3 py-2 text-left text-sm text-gray-300 transition hover:border-yellow-500 hover:text-white"
          >
            <span className="mr-2">✉️</span>
            Test Email
          </a>
          <a
            href="/test-paypal"
            className="block w-full rounded-lg border border-gray-700 px-3 py-2 text-left text-sm text-gray-300 transition hover:border-yellow-500 hover:text-white"
          >
            <span className="mr-2">💳</span>
            Test PayPal
          </a>
        </div>
      </div>

      {/* Account Section */}
      <div className="border-t border-gray-700 pt-8">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-500">Account</h3>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              activeTab === 'settings'
                ? 'bg-yellow-500 text-gray-950 font-semibold'
                : 'border border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-white'
            }`}
          >
            <span className="mr-2">⚙️</span>
            Settings
          </button>
          <button
            onClick={onSignOut}
            className="w-full rounded-lg border border-gray-700 px-3 py-2 text-left text-sm text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

