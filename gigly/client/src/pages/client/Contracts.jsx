import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contractAPI, milestoneAPI, disputeAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Briefcase, Plus, Check, X, MessageSquare, Flag } from 'lucide-react';

const ClientContracts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [msModal, setMsModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [msForm, setMsForm] = useState({ title: '', description: '', amount: '', dueDate: '' });
  const [status, setStatus] = useState('');
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const selectContract = async (c) => {
    setSelected(c);
    const { data } = await milestoneAPI.getByContract(c._id);
    setMilestones(data.data.milestones || []);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await contractAPI.getAll({ status: status || undefined });
      const list = data.data.contracts || [];
      setContracts(list);
      const openId = searchParams.get('open');
      if (openId) {
        const match = list.find(c => c._id === openId);
        if (match) selectContract(match);
      }
    }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);

  const handleAddMilestone = async () => {
    if (!msForm.title || !msForm.amount || !msForm.dueDate) { toast({ title: 'Fill all fields', type: 'error' }); return; }
    try {
      await milestoneAPI.create({ contractId: selected._id, ...msForm, amount: Number(msForm.amount) });
      toast({ title: 'Milestone added!', type: 'success' });
      setMsModal(false); setMsForm({ title: '', description: '', amount: '', dueDate: '' });
      const { data } = await milestoneAPI.getByContract(selected._id);
      setMilestones(data.data.milestones || []);
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  const handleApprove = async (mId) => {
    try {
      await milestoneAPI.approve(mId);
      toast({ title: 'Milestone approved! Invoice generated.', type: 'success' });
      const { data } = await milestoneAPI.getByContract(selected._id);
      setMilestones(data.data.milestones || []);
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  const handleReject = async () => {
    if (!rejectRemark) { toast({ title: 'Remark required', type: 'error' }); return; }
    try {
      await milestoneAPI.reject(rejectModal, rejectRemark);
      toast({ title: 'Milestone rejected', type: 'success' });
      setRejectModal(null); setRejectRemark('');
      const { data } = await milestoneAPI.getByContract(selected._id);
      setMilestones(data.data.milestones || []);
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  const handleRaiseDispute = async () => {
    if (disputeReason.trim().length < 10) { toast({ title: 'Please describe the issue in more detail', type: 'error' }); return; }
    setSubmittingDispute(true);
    try {
      await disputeAPI.create({ contractId: selected._id, reason: disputeReason });
      toast({ title: 'Dispute raised. Our team will review it.', type: 'success' });
      setDisputeModal(false); setDisputeReason('');
      load();
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
    finally { setSubmittingDispute(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">Contracts</h1><p className="text-sm text-gray-500">{contracts.length} contracts</p></div>
        <div className="flex gap-2">
          {['', 'active', 'pending', 'completed'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s ? s.replace('_', ' ') : 'All'}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div> :
        contracts.length === 0 ? (
          <EmptyState icon={Briefcase} title="No contracts yet" description="Hire freelancers to create contracts"
            action={<Button onClick={() => navigate('/browse')}>Find Talent</Button>} />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {contracts.map(c => (
              <div key={c._id} className="card p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => selectContract(c)}>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar src={c.freelancerId?.avatar} name={c.freelancerId?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                    <p className="text-sm text-gray-500">{c.freelancerId?.name}</p>
                  </div>
                  <Badge status={c.status} />
                </div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Budget</span><span className="font-semibold">{formatCurrency(c.totalBudget)}</span></div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(c.spendPercentage || 0, 100)}%` }} /></div>
                <p className="text-xs text-gray-400">{formatCurrency(c.amountPaid)} paid · {formatDate(c.endDate)} deadline</p>
              </div>
            ))}
          </div>
        )}

      {/* Contract Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="xl">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar src={selected.freelancerId?.avatar} name={selected.freelancerId?.name} size="md" />
              <div className="flex-1"><p className="font-semibold">{selected.freelancerId?.name}</p><p className="text-sm text-gray-500">{formatDate(selected.startDate)} → {formatDate(selected.endDate)}</p></div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setSelected(null); navigate('/messages'); }}><MessageSquare size={14} /> Chat</Button>
                {['active', 'under_review'].includes(selected.status) && <Button size="sm" onClick={() => setMsModal(true)}><Plus size={14} /> Milestone</Button>}
                {['active', 'under_review'].includes(selected.status) && <Button size="sm" variant="danger" onClick={() => setDisputeModal(true)}><Flag size={14} /> Raise Dispute</Button>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-500">Budget</span><span className="font-semibold">{formatCurrency(selected.totalBudget)}</span></div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(selected.spendPercentage || 0) >= 80 ? 'bg-red-500' : 'bg-primary-500'}`} style={{ width: `${Math.min(selected.spendPercentage || 0, 100)}%` }} /></div>
              <p className="text-xs text-gray-400 mt-1">{selected.spendPercentage || 0}% spent · {formatCurrency(selected.totalBudget - selected.amountPaid)} remaining</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Milestones</h3>
              {milestones.length === 0 ? <p className="text-sm text-gray-400">No milestones yet. Add one to get started.</p> : (
                <div className="space-y-3">
                  {milestones.map(m => (
                    <div key={m._id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2"><p className="font-medium">{m.title}</p><Badge status={m.status} /></div>
                          <p className="text-sm text-gray-500">{m.description}</p>
                          <p className="text-sm font-semibold text-primary-600 mt-1">{formatCurrency(m.amount)} · Due {formatDate(m.dueDate)}</p>
                          {m.submissionNote && <div className="mt-2 bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg"><strong>Note:</strong> {m.submissionNote}</div>}
                        </div>
                        {m.status === 'submitted' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="xs" variant="success" onClick={() => handleApprove(m._id)}><Check size={12} /> Approve</Button>
                            <Button size="xs" variant="danger" onClick={() => setRejectModal(m._id)}><X size={12} /> Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Milestone Modal */}
      <Modal isOpen={msModal} onClose={() => setMsModal(false)} title="Add Milestone"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setMsModal(false)}>Cancel</Button><Button onClick={handleAddMilestone}>Add Milestone</Button></div>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label><input value={msForm.title} onChange={e => setMsForm({ ...msForm, title: e.target.value })} placeholder="e.g. Phase 1 — UI Design" className="input" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label><textarea value={msForm.description} onChange={e => setMsForm({ ...msForm, description: e.target.value })} rows={3} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹) *</label><input type="number" value={msForm.amount} onChange={e => setMsForm({ ...msForm, amount: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date *</label><input type="date" value={msForm.dueDate} onChange={e => setMsForm({ ...msForm, dueDate: e.target.value })} className="input" /></div>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectRemark(''); }} title="Reject Milestone"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button><Button variant="danger" onClick={handleReject}>Reject</Button></div>}>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label><textarea value={rejectRemark} onChange={e => setRejectRemark(e.target.value)} rows={4} placeholder="Explain why this is being rejected..." className="input" /></div>
      </Modal>

      {/* Raise Dispute Modal */}
      <Modal isOpen={disputeModal} onClose={() => { setDisputeModal(false); setDisputeReason(''); }} title="Raise a Dispute"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setDisputeModal(false)}>Cancel</Button><Button variant="danger" onClick={handleRaiseDispute} loading={submittingDispute}>Submit Dispute</Button></div>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Raising a dispute notifies the freelancer and our admin team. The contract will be marked as disputed until resolved.</p>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">What's the issue? *</label><textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4} placeholder="Describe the issue in detail..." className="input" /></div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientContracts;
