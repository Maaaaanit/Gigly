import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { proposalAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { formatCurrency, timeAgo } from '../../utils/helpers';
import { FileText, ExternalLink } from 'lucide-react';

const FreelancerProposals = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    proposalAPI.getMyProposals()
      .then(({ data }) => setProposals(data.data.proposals || []))
      .catch(() => toast({ title: 'Failed to load proposals', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async (id) => {
    try {
      await proposalAPI.withdraw(id);
      toast({ title: 'Proposal withdrawn', type: 'success' });
      load();
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">My Proposals</h1><p className="text-sm text-gray-500">{proposals.length} proposals submitted</p></div>

      {loading ? <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div> :
        proposals.length === 0 ? (
          <EmptyState icon={FileText} title="No proposals yet" description="Browse jobs and submit proposals to start getting clients"
            action={<Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>} />
        ) : (
          <div className="space-y-4">
            {proposals.map(p => (
              <div key={p._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-gray-900">{p.jobId?.title || 'Job Title'}</h3>
                      <Badge status={p.status} />
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{p.coverLetter}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="font-medium text-primary-600">{formatCurrency(p.bidAmount)} {p.bidType === 'hourly' ? '/hr' : 'fixed'}</span>
                      {p.estimatedDuration && <span>Est: {p.estimatedDuration}</span>}
                      <span>Submitted {timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/jobs/${p.jobId?._id}`)}><ExternalLink size={14} /> View Job</Button>
                    {p.status === 'pending' && <Button size="sm" variant="secondary" onClick={() => handleWithdraw(p._id)}>Withdraw</Button>}
                    {p.status === 'accepted' && <span className="text-xs text-green-600 font-semibold px-3 py-1.5 bg-green-50 rounded-lg">✓ Contract Created</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default FreelancerProposals;
