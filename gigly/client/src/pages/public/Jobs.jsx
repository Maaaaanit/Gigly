import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { formatCurrency, formatDate, CATEGORIES, timeAgo } from '../../utils/helpers';
import { Search, Briefcase, Users, Clock, SlidersHorizontal } from 'lucide-react';

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', type: '', experience: '', sort: 'newest' });

  const fetchJobs = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await jobAPI.getAll(params);
      setJobs(data.data.jobs || []);
      setTotal(data.data.total || 0);
      setPages(data.data.pages || 1);
      setPage(p);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(1); }, []);

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-gray-25">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
            <p className="text-gray-500 text-sm mt-1">{total} jobs available</p>
          </div>
          {user?.role === 'freelancer' && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/freelancer/proposals')}>My Proposals</Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <form onSubmit={e => { e.preventDefault(); fetchJobs(1); }} className="card p-5 space-y-4 sticky top-24">
              <div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-gray-500" /><span className="text-sm font-semibold text-gray-900">Filters</span></div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                <div className="relative mt-1.5"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Keywords..." className="input pl-8 text-sm py-2" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="input mt-1.5 text-sm py-2">
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="input mt-1.5 text-sm py-2">
                  <option value="">All Types</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</label>
                <select value={filters.experience} onChange={e => setFilters({ ...filters, experience: e.target.value })} className="input mt-1.5 text-sm py-2">
                  <option value="">Any Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <Button type="submit" className="w-full" size="sm">Apply Filters</Button>
            </form>
          </aside>

          {/* Jobs list */}
          <div className="flex-1 space-y-4">
            {loading ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />) : jobs.length === 0 ? (
              <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your filters" />
            ) : (
              <>
                {jobs.map(job => (
                  <div key={job._id} className="card p-6 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/jobs/${job._id}`)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{job.title}</h3>
                          <Badge status={job.type === 'fixed' ? 'active' : 'pending'}>{job.type === 'fixed' ? 'Fixed Price' : 'Hourly'}</Badge>
                          <Badge status={job.experienceLevel} />
                        </div>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.skills?.slice(0, 5).map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{s}</span>)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Briefcase size={11} />{job.category}</span>
                          <span className="flex items-center gap-1"><Users size={11} />{job.proposalCount} proposals</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(job.budget?.min)} – {formatCurrency(job.budget?.max)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{job.type === 'fixed' ? 'Fixed' : 'per hour'}</p>
                        <div className="mt-3">
                          {user?.role === 'freelancer' ? (
                            <Button size="sm" onClick={e => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}>Apply Now</Button>
                          ) : !user ? (
                            <Button size="sm" onClick={e => { e.stopPropagation(); navigate('/register?role=freelancer'); }}>Apply Now</Button>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}>View Details</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => fetchJobs(page - 1)}>Previous</Button>
                    <span className="px-4 py-2 text-sm text-gray-600">{page} / {pages}</span>
                    <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => fetchJobs(page + 1)}>Next</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
