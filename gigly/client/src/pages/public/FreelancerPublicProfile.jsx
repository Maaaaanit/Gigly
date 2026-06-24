import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { freelancerAPI, reviewAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { MapPin, Clock, Briefcase, ExternalLink, Eye } from 'lucide-react';

const FreelancerPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([freelancerAPI.getProfile(id), reviewAPI.getFreelancerReviews(id)])
      .then(([pRes, rRes]) => { setProfile(pRes.data.data.profile); setReviews(rRes.data.data.reviews || []); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-25"><PublicNavbar /><div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-4"><div className="h-48 bg-gray-200 rounded-2xl" /><div className="h-96 bg-gray-200 rounded-2xl" /></div></div>;
  if (!profile) return <div className="min-h-screen bg-gray-25"><PublicNavbar /><div className="max-w-5xl mx-auto px-4 py-12 text-center"><p className="text-gray-500">Profile not found</p></div></div>;

  const u = profile.userId;

  return (
    <div className="min-h-screen bg-gray-25">
      <PublicNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 text-center">
              <Avatar src={u?.avatar} name={u?.name} size="2xl" className="mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900">{u?.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{profile.title || profile.category}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <StarRating rating={profile.rating} size={14} />
                <span className="text-sm font-medium text-gray-700">{profile.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({profile.totalRatings} reviews)</span>
              </div>
              <Badge status={profile.availability} className="mt-3" />
              {profile.location && <p className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2"><MapPin size={12} />{profile.location}</p>}

              {user?.role === 'client' && (
                <Button className="w-full mt-4" onClick={() => navigate(`/client/contracts/new?freelancerId=${u._id}`)}>
                  Hire Now
                </Button>
              )}
              {!user && (
                <Button className="w-full mt-4" onClick={() => navigate('/register?role=client')}>
                  Hire {u?.name?.split(' ')[0]}
                </Button>
              )}
            </div>

            <div className="card p-5 space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Hourly Rate</span><span className="font-semibold">{profile.hourlyRate > 0 ? `${formatCurrency(profile.hourlyRate)}/hr` : 'Negotiable'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Experience</span><Badge status={profile.experience} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Projects Done</span><span className="font-semibold">{profile.totalContractsCompleted}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Earned</span><span className="font-semibold">{formatCurrency(profile.totalEarnings)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Response Time</span><span className="font-semibold">{profile.responseTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Profile Views</span><span className="font-semibold flex items-center gap-1"><Eye size={12} />{profile.profileViews}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Member Since</span><span className="font-semibold">{formatDate(u?.createdAt)}</span></div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {profile.bio && (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0
                  ? profile.skills.map(s => <span key={s} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{s}</span>)
                  : <p className="text-sm text-gray-400">No skills listed</p>}
              </div>
            </div>

            {profile.portfolioLinks?.filter(Boolean).length > 0 && (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Portfolio</h2>
                <div className="space-y-2">
                  {profile.portfolioLinks.filter(Boolean).map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                      <ExternalLink size={13} />{link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar src={r.reviewerId?.avatar} name={r.reviewerId?.name} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{r.reviewerId?.name}</p>
                            <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                          </div>
                          <StarRating rating={r.rating} size={13} className="mt-1" />
                          {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerPublicProfile;
