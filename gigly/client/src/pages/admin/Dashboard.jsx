import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api';
import { SkeletonCard } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Users, Briefcase, DollarSign, FileText } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}><Icon size={22} className={iconColor} /></div>
    <div><p className="text-2xl font-bold text-gray-900">{value}</p><p className="text-sm text-gray-500">{title}</p></div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { analyticsAPI.getAdminStats().then(({ data }) => setStats(data.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-sm text-gray-500">Platform overview</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} iconBg="bg-primary-50" iconColor="text-primary-600" />
        <StatCard title="Freelancers" value={stats?.totalFreelancers || 0} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Contracts" value={stats?.totalContracts || 0} icon={Briefcase} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue)} icon={DollarSign} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Top Freelancers</h2></div>
          <div className="divide-y divide-gray-50">
            {stats?.topFreelancers?.map((f, i) => (
              <div key={f._id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                <Avatar src={f.userId?.avatar} name={f.userId?.name} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{f.userId?.name}</p>
                  <StarRating rating={f.rating} size={12} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary-600">{f.rating.toFixed(1)} ★</p>
                  <p className="text-xs text-gray-400">{f.totalContractsCompleted} projects</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Recent Users</h2></div>
          <div className="divide-y divide-gray-50">
            {stats?.recentUsers?.map(u => (
              <div key={u._id} className="px-5 py-3 flex items-center gap-3">
                <Avatar src={u.avatar} name={u.name} size="sm" />
                <div className="flex-1"><p className="text-sm font-semibold text-gray-900">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                <span className="badge badge-gray capitalize">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
