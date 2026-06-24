import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jobAPI, proposalAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Plus, Briefcase, Users, Eye, Trash2 } from 'lucide-react';

const ClientJobs = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposalsModal, setProposalsModal] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [acceptModal, setAcceptModal] = useState(null);
  const [acceptForm, setAcceptForm] = useState({ startDate: '', endDate: '' });

  const viewProposals = async (job) => {
    setProposalsModal(job);
    setProposalsLoading(true);
    try { const { data } = await jobAPI.getProposals(job._id); setProposals(data.data.proposals || []); }
    catch {} finally { setProposalsLoading(false); }
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await jobAPI.getMyJobs();
      const list = data.data.jobs || [];
      setJobs(list);
      const openId = searchParams.get('open');
      if (openId) {
        const match = list.find(j => j._id === openId);
        if (match) viewProposals(match);
      }
    }
    catch { toast({ title: 'Failed to load jobs', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete the job "${job.title}"? This cannot be undone.`)) return;
    try {
      await jobAPI.delete(job._id);
      toast({ title: 'Job deleted', type: 'success' });
      setJobs(prev => prev.filter(j => j._id !== job._id));
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to delete job', type: 'error' });
    }
  };

  const handleAccept = async () => {
    try {
      await proposalAPI.accept(acceptModal._id, acceptForm);
      toast({ title: 'Proposal accepted! Contract created.', type: 'success' });
      setAcceptModal(null); setProposalsModal(null);
      navigate('/client/contracts');
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">My Job Postings</h1><p className="text-sm text-gray-500 mt-0.5">{jobs.length} jobs posted</p></div>
        <Button onClick={() => navigate('/client/jobs/new')}><Plus size={16} /> Post a Job</Button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <SkeletonTable /> : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs posted yet" description="Post your first job to start receiving proposals from talented freelancers"
            action={<Button onClick={() => navigate('/client/jobs/new')}><Plus size={16} /> Post Your First Job</Button>} />
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map(job => (
              <div key={job._id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <Badge status={job.status} />
                      <span className="badge badge-gray capitalize">{job.type}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Budget: {formatCurrency(job.budget?.min)} – {formatCurrency(job.budget?.max)}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{job.proposalCount} proposals</span>
                      <span>Posted: {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => viewProposals(job)}>
                      <Users size={14} /> Proposals ({job.proposalCount})
                    </Button>
                    {job.status === 'open' && job.proposalCount === 0 && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(job)}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proposals Modal */}
      <Modal isOpen={!!proposalsModal} onClose={() => setProposalsModal(null)} title={`Proposals for "${proposalsModal?.title}"`} size="lg">
        {proposalsLoading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          : proposals.length === 0 ? <EmptyState title="No proposals yet" description="Share your job posting to attract freelancers" />
          : (
            <div className="space-y-4">
              {proposals.map(p => (
                <div key={p._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Avatar src={p.freelancerId?.avatar} name={p.freelancerId?.name} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{p.freelancerId?.name}</p>
                        <Badge status={p.status} />
                      </div>
                      <p className="text-sm font-medium text-primary-600 mt-0.5">Bid: {formatCurrency(p.bidAmount)} {p.bidType === 'hourly' ? '/hr' : 'fixed'}</p>
                      {p.estimatedDuration && <p className="text-xs text-gray-400">Duration: {p.estimatedDuration}</p>}
                      <p className="text-sm text-gray-600 mt-2">{p.coverLetter}</p>
                    </div>
                  </div>
                  {p.status === 'pending' && (
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button size="sm" variant="secondary" onClick={() => proposalAPI.reject(p._id).then(() => { toast({ title: 'Proposal rejected', type: 'success' }); viewProposals(proposalsModal); })}>Decline</Button>
                      <Button size="sm" onClick={() => { setAcceptModal(p); }}>Accept & Create Contract</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </Modal>

      {/* Accept Proposal Modal */}
      <Modal isOpen={!!acceptModal} onClose={() => setAcceptModal(null)} title="Create Contract"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setAcceptModal(null)}>Cancel</Button><Button onClick={handleAccept}>Create Contract</Button></div>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Set the contract dates for <strong>{acceptModal?.freelancerId?.name}</strong></p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={acceptForm.startDate} onChange={e => setAcceptForm({ ...acceptForm, startDate: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={acceptForm.endDate} onChange={e => setAcceptForm({ ...acceptForm, endDate: e.target.value })} className="input" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientJobs;
