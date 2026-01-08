import React, { useState } from 'react';

// --- Types & Interfaces ---

interface Child {
  id: string;
  name: string;
  level: string;
  age: number;
  progress: number;
  nextGoal: string;
  avatarUrl?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

interface Booking {
  id: string;
  classDate: string;
  time: string;
  className: string;
  instructor: string;
  location: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

// --- Mock Data ---

const MOCK_CHILDREN: Child[] = [
  {
    id: 'c1',
    name: 'Leo Johnson',
    level: 'Level 4 - Advanced Stroke',
    age: 9,
    progress: 75,
    nextGoal: 'Mastering Butterfly Turn',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  },
  {
    id: 'c2',
    name: 'Mia Johnson',
    level: 'Level 2 - Beginner',
    age: 5,
    progress: 40,
    nextGoal: 'Floating on back unassisted',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2023-001', date: '2023-10-01', amount: 120.00, status: 'paid', description: 'Monthly Tuition - Leo' },
  { id: 'INV-2023-002', date: '2023-10-01', amount: 115.00, status: 'pending', description: 'Monthly Tuition - Mia' },
  { id: 'INV-2023-003', date: '2023-09-01', amount: 50.00, status: 'paid', description: 'Annual Pool Fee' },
];

// --- Components ---

const StatusBadge: React.FC<{ status: Invoice['status'] | Booking['status'] }> = ({ status }) => {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const labels: Record<string, string> = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

const ChildOverview: React.FC<{ children: Child[] }> = ({ children }) => {
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const activeChild = children[activeChildIndex];

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {children.map((child, index) => (
              <button
                key={child.id}
                onClick={() => setActiveChildIndex(index)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                  index === activeChildIndex
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <img src={child.avatarUrl} alt={child.name} className="w-12 h-12 rounded-full bg-white shadow-sm" />
                <div>
                  <p className="font-bold text-gray-800">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.level}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Child Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activeChild.name}&apos;s Progress</h2>
              <p className="text-gray-500 mt-1">Current Level: <span className="font-medium text-blue-600">{activeChild.level}</span></p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Level Completion</span>
              <span className="text-sm font-bold text-blue-600">{activeChild.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${activeChild.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Next Goal Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
            <div className="mt-1">
              <div className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-100"></div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Current Focus</h4>
              <p className="text-sm text-gray-600">{activeChild.nextGoal}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-t border-gray-100">
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Classes</p>
            <p className="text-xl font-bold text-gray-900 mt-1">12/12</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Attendance</p>
            <p className="text-xl font-bold text-gray-900 mt-1">92%</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Next Assessment</p>
            <p className="text-sm font-bold text-gray-900 mt-1">Nov 14</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Badges</p>
            <p className="text-xl font-bold text-gray-900 mt-1">4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Financials: React.FC = () => {
  const totalDue = MOCK_INVOICES
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Outstanding</p>
            <h2 className="text-3xl font-bold mt-1">${totalDue.toFixed(2)}</h2>
          </div>
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition shadow-sm">
            Pay Now
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-gray-300">Autopay is scheduled for Oct 15</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-blue-600 text-sm hover:underline">Download All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_INVOICES.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{invoice.description}</td>
                  <td className="px-6 py-4 text-gray-800">${invoice.amount.toFixed(2)}</td>
                  <td className="px-6 py-4"><StatusBadge status={invoice.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 'b1', classDate: '2023-10-25', time: '16:00', className: 'Level 4 Squad', instructor: 'Coach Sarah', location: 'Main Pool - Lane 3', status: 'confirmed' },
    { id: 'b2', classDate: '2023-10-28', time: '10:00', className: 'Private Lesson', instructor: 'Coach Mike', location: 'Training Pool', status: 'confirmed' },
    { id: 'b3', classDate: '2023-11-01', time: '16:00', className: 'Level 4 Squad', instructor: 'Coach Sarah', location: 'Main Pool - Lane 3', status: 'confirmed' },
  ]);

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this class? Our cancellation policy requires 24hrs notice.')) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => new Date(a.classDate).getTime() - new Date(b.classDate).getTime());

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <svg className="text-blue-500 w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div>
          <h4 className="text-blue-900 font-semibold text-sm">Cancellation Policy</h4>
          <p className="text-blue-700 text-sm mt-1">Classes can be cancelled up to 24 hours in advance for a full credit to your account.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedBookings.map((booking) => (
          <div key={booking.id} className={`relative bg-white rounded-xl shadow-sm border p-5 transition-all ${booking.status === 'cancelled' ? 'opacity-60 grayscale' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg w-16 h-16 border border-gray-200 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    {new Date(booking.classDate).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {new Date(booking.classDate).getDate()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{booking.className}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">👤 {booking.instructor}</span>
                    <span className="flex items-center gap-1">🕐 {booking.time}</span>
                    <span className="flex items-center gap-1">📍 {booking.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center md:items-end">
                {booking.status === 'confirmed' ? (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium border border-transparent hover:border-red-100 transition-all w-full md:w-auto"
                  >
                    Cancel Class
                  </button>
                ) : (
                  <button className="text-gray-400 hover:text-gray-600 px-4 py-2 text-sm font-medium">
                    Book Make-up
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Portal Component ---

const ParentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'bookings'>('overview');

  const tabs = [
    { id: 'overview', label: 'My Children', icon: '👨‍👩‍👧‍👦' },
    { id: 'bookings', label: 'Schedule', icon: '📅' },
    { id: 'financials', label: 'Billing', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white text-xl">👨‍👩‍👧</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Parent Portal</h1>
                <p className="text-xs text-gray-500">Johnson Family Account</p>
              </div>
            </div>
            <div className="flex items-center">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Parent"
                alt="Parent"
                className="w-9 h-9 rounded-full border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 -mb-px">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'financials' | 'bookings')}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <ChildOverview children={MOCK_CHILDREN} />}
        {activeTab === 'financials' && <Financials />}
        {activeTab === 'bookings' && <BookingManagement />}
      </main>
    </div>
  );
};

export default ParentPortal;
