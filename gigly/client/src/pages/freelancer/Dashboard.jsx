import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { SkeletonCard } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { formatCurrency, formatDate, MONTHS } from '../../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, DollarSign, Clock, TrendingUp, ArrowRight, Search } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, sub }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div><p className="text-sm text-gray-500 font-medium">{title}</p><p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>{sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}</div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}><Icon size={20} className={iconColor} /></div>
    </div>
  </div>
);

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getFreelancerStats()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div></div>;

  const chartData = (stats?.monthlyEarnings || []).map(m => ({ month: MONTHS[m._id.m - 1], earnings: m.total }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good day, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your work</p>
        </div>
        <Button onClick={() => navigate('/jobs')} size="sm"><Search size={15} /> Browse Jobs</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Contracts" value={stats?.activeCount || 0} icon={Briefcase} iconBg="bg-primary-50" iconColor="text-primary-600" />
        <StatCard title="Total Earnings" value={formatCurrency(stats?.totalEarnings)} icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard title="Pending Invoices" value={formatCurrency(stats?.pendingAmount)} icon={Clock} iconBg="bg-yellow-50" iconColor="text-yellow-600" sub={`${stats?.pendingInvoices?.length || 0} invoices`} />
        <StatCard title="Completed" value={stats?.completedContracts || 0} icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" sub="Projects" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Monthly Earnings</h2></div>
          <div className="p-5">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [formatCurrency(v), 'Earnings']} />
                  <Area type="monotone" dataKey="earnings" stroke="#7C3AED" fill="url(#eg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No earnings data yet</div>}
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Active Contracts</h2>
            <button onClick={() => navigate('/freelancer/contracts')} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">All <ArrowRight size={12} /></button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.activeContracts?.length > 0 ? stats.activeContracts.map(c => (
              <div key={c._id} className="px-5 py-3 cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/freelancer/contracts/${c._id}`)}>
                <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.clientId?.name}</p>
                <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(c.spendPercentage || 0, 100)}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{formatCurrency(c.amountPaid)} / {formatCurrency(c.totalBudget)}</p>
              </div>
            )) : <div className="py-8 text-center text-gray-400 text-sm">No active contracts</div>}
          </div>
        </div>
      </div>

      {stats?.pendingInvoices?.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pending Invoices</h2>
            <button onClick={() => navigate('/freelancer/invoices')} className="text-xs text-primary-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.pendingInvoices.slice(0, 3).map(inv => (
              <div key={inv._id} className="px-5 py-3 flex items-center justify-between">
                <div><p className="text-sm font-mono font-medium text-primary-600">{inv.invoiceNumber}</p><p className="text-xs text-gray-500">{inv.contractId?.title}</p></div>
                <div className="text-right"><p className="font-semibold text-sm">{formatCurrency(inv.totalAmount)}</p><Badge status={inv.status} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;
