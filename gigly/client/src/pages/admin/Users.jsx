import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/helpers';
import { Users as UsersIcon, Search, Ban, CheckCircle2 } from 'lucide-react';

const ROLES = ['', 'client', 'freelancer', 'admin'];

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ role: role || undefined, status: status || undefined, search: search || undefined, page });
      setUsers(data.data.users || []);
      setPages(data.data.pages || 1);
    } catch { toast({ title: 'Failed to load users', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [role, status, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const toggleStatus = async (user) => {
    const verb = user.isActive ? 'suspend' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${verb} ${user.name}?`)) return;
    try {
      await adminAPI.toggleUserStatus(user._id);
      toast({ title: `User ${verb}d`, type: 'success' });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Users</h1><p className="text-sm text-gray-500 mt-0.5">Manage clients, freelancers, and admins</p></div>

      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email" className="input pl-9 py-2 text-sm" />
        </form>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
          {ROLES.map(r => <option key={r} value={r}>{r ? r[0].toUpperCase() + r.slice(1) : 'All roles'}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <SkeletonTable /> : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your filters" />
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map(u => (
              <div key={u._id} className="p-4 flex items-center gap-3">
                <Avatar src={u.avatar} name={u.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className="badge badge-gray capitalize flex-shrink-0">{u.role}</span>
                <span className={`badge flex-shrink-0 ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Suspended'}</span>
                <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">Joined {formatDate(u.createdAt)}</span>
                {u.role !== 'admin' && (
                  <Button size="sm" variant={u.isActive ? 'danger' : 'success'} onClick={() => toggleStatus(u)} className="flex-shrink-0">
                    {u.isActive ? <><Ban size={13} /> Suspend</> : <><CheckCircle2 size={13} /> Reactivate</>}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page} of {pages}</span>
          <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
