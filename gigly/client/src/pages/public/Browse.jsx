import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { freelancerAPI } from '../../api';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { SkeletonFreelancerCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import { formatCurrency, CATEGORIES, truncate } from '../../utils/helpers';
import { Search, SlidersHorizontal, Users } from 'lucide-react';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    availability: '',
    experience: '',
    minRate: '',
    maxRate: '',
    sort: 'rating',
  });

  const fetchFreelancers = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await freelancerAPI.browse(params);
      setProfiles(data.data.profiles || []);
      setTotal(data.data.total || 0);
      setPages(data.data.pages || 1);
      setPage(p);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchFreelancers(1); }, []);

  const handleFilter = (e) => { e.preventDefault(); fetchFreelancers(1); };

  return (
    <div className="min-h-screen bg-gray-25">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Find Freelance Talent</h1>
          <p className="text-gray-500 text-sm mt-1">{total} freelancers available</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <form onSubmit={handleFilter} className="card p-5 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 mb-1">
                <SlidersHorizontal size={16} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-900">Filters</span>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                <div className="relative mt-1.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Name or skill..." className="input pl-8 text-sm py-2" />
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
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Availability</label>
                <select value={filters.availability} onChange={e => setFilters({ ...filters, availability: e.target.value })} className="input mt-1.5 text-sm py-2">
                  <option value="">Any</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
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
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hourly Rate (₹)</label>
                <div className="flex gap-2 mt-1.5">
                  <input type="number" placeholder="Min" value={filters.minRate} onChange={e => setFilters({ ...filters, minRate: e.target.value })} className="input text-sm py-2 w-1/2" />
                  <input type="number" placeholder="Max" value={filters.maxRate} onChange={e => setFilters({ ...filters, maxRate: e.target.value })} className="input text-sm py-2 w-1/2" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort By</label>
                <select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })} className="input mt-1.5 text-sm py-2">
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="rate_low">Rate: Low to High</option>
                  <option value="rate_high">Rate: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <Button type="submit" className="w-full" size="sm">Apply Filters</Button>
            </form>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => <SkeletonFreelancerCard key={i} />)}
              </div>
            ) : profiles.length === 0 ? (
              <EmptyState icon={Users} title="No freelancers found" description="Try adjusting your filters" />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {profiles.map(p => (
                    <div key={p._id} className="card p-5 hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate(`/freelancer/${p.userId?._id}`)}>
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar src={p.userId?.avatar} name={p.userId?.name} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{p.userId?.name}</p>
                          <p className="text-sm text-gray-500 truncate">{p.title || p.category || 'Freelancer'}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <StarRating rating={p.rating} size={12} />
                            <span className="text-xs text-gray-500">{p.rating.toFixed(1)} ({p.totalRatings})</span>
                          </div>
                        </div>
                        <Badge status={p.availability} />
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.bio || 'No bio available'}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.skills?.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{s}</span>)}
                        {p.skills?.length > 4 && <span className="text-xs text-gray-400">+{p.skills.length - 4}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400">Hourly Rate</p>
                          <p className="text-sm font-bold text-gray-900">{p.hourlyRate > 0 ? `${formatCurrency(p.hourlyRate)}/hr` : 'Negotiable'}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); navigate(`/freelancer/${p.userId?._id}`); }}>View Profile</Button>
                      </div>
                    </div>
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => fetchFreelancers(page - 1)}>Previous</Button>
                    <span className="px-4 py-2 text-sm text-gray-600">{page} / {pages}</span>
                    <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => fetchFreelancers(page + 1)}>Next</Button>
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

export default Browse;
