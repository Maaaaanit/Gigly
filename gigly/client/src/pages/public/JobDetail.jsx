import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate, timeAgo } from '../../utils/helpers';
import { Briefcase, Clock, Users, MapPin, Calendar, ArrowLeft } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [myProposal, setMyProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ coverLetter: '', bidAmount: '', bidType: 'fixed', estimatedDuration: '' });

  useEffect(() => {
    jobAPI.getById(id).then(({ data }) => {
      setJob(data.data.job);
      setMyProposal(data.data.myProposal);
      setForm(f => ({ ...f, bidType: data.data.job?.type || 'fixed' }));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!form.coverLetter || !form.bidAmount) { toast({ title: 'Fill all required fields', type: 'error' }); return; }
    setSubmitting(true);
    try {
      await jobAPI.submitProposal(id, { ...form, bidAmount: Number(form.bidAmount) });
      toast({ title: 'Proposal submitted!', description: 'The client will review your proposal', type: 'success' });
      setApplyModal(false);
      const { data } = await jobAPI.getById(id);
      setMyProposal(data.data.myProposal);
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed to submit', type: 'error' }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-25"><PublicNavbar /><div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4"><div className="h-48 bg-gray-200 rounded-2xl" /><div className="h-96 bg-gray-200 rounded-2xl" /></div></div>;
  if (!job) return <div className="min-h-screen bg-gray-25"><PublicNavbar /><div className="max-w-5xl mx-auto px-4 py-8 text-center"><p className="text-gray-500">Job not found</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-25">
      <PublicNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Back to Jobs</button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge status="active">{job.type === 'fixed' ? 'Fixed Price' : 'Hourly'}</Badge>
                    <Badge status={job.experienceLevel} />
                    <Badge status={job.status} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(job.budget?.min)} – {formatCurrency(job.budget?.max)}</p>
                  <p className="text-xs text-gray-400">{job.type === 'fixed' ? 'Fixed' : '/hr'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 flex-wrap">
                <span className="flex items-center gap-1"><Briefcase size={12} />{job.category}</span>
                <span className="flex items-center gap-1"><Users size={12} />{job.proposalCount} proposals</span>
                <span className="flex items-center gap-1"><Clock size={12} />Posted {timeAgo(job.createdAt)}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{job.duration?.replace(/_/g, ' ')}</span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.skills?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => <span key={s} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              {user?.role === 'freelancer' ? (
                myProposal ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Proposal Submitted</p>
                    <Badge status={myProposal.status} className="mx-auto" />
                    <p className="text-xs text-gray-400 mt-2">Bid: {formatCurrency(myProposal.bidAmount)}</p>
                  </div>
                ) : (
                  <>
                    <Button className="w-full mb-3" onClick={() => setApplyModal(true)}>Apply Now</Button>
                    <p className="text-xs text-gray-400 text-center">{job.proposalCount} freelancers have applied</p>
                  </>
                )
              ) : !user ? (
                <><Button className="w-full mb-3" onClick={() => navigate('/register?role=freelancer')}>Apply as Freelancer</Button><p className="text-xs text-gray-400 text-center">Create a free account to apply</p></>
              ) : null}
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">About the Client</h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={job.clientId?.avatar} name={job.clientId?.name} size="md" />
                <div><p className="font-medium text-sm text-gray-900">{job.clientId?.name}</p><p className="text-xs text-gray-400">Member since {formatDate(job.clientId?.createdAt)}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title={`Apply to "${job.title}"`} size="md"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setApplyModal(false)}>Cancel</Button><Button onClick={handleApply} loading={submitting}>Submit Proposal</Button></div>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Bid (₹) *</label>
            <input type="number" value={form.bidAmount} onChange={e => setForm({ ...form, bidAmount: e.target.value })} placeholder={job.type === 'fixed' ? 'Total fixed price' : 'Hourly rate'} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Duration</label>
            <input value={form.estimatedDuration} onChange={e => setForm({ ...form, estimatedDuration: e.target.value })} placeholder="e.g. 2 weeks, 1 month" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Letter *</label>
            <textarea value={form.coverLetter} onChange={e => setForm({ ...form, coverLetter: e.target.value })} rows={6} placeholder="Introduce yourself and explain why you're the best fit for this project..." className="input" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;
