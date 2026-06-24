import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contractAPI, milestoneAPI, timesheetAPI, disputeAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Briefcase, MessageSquare, Check, X, Upload, Plus, Trash2, Flag } from 'lucide-react';

const FreelancerContracts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [status, setStatus] = useState('');
  const [submitModal, setSubmitModal] = useState(null);
  const [submitNote, setSubmitNote] = useState('');
  const [submitFiles, setSubmitFiles] = useState([]);
  const [timesheetModal, setTimesheetModal] = useState(false);
  const [tsForm, setTsForm] = useState({ weekStartDate: '', entries: [{ date: '', hoursWorked: '', taskDescription: '' }] });
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

  const handleAccept = async (id) => {
    try { await contractAPI.accept(id); toast({ title: 'Contract accepted!', type: 'success' }); load(); setSelected(null); }
    catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  const handleSubmitMilestone = async () => {
    const fd = new FormData();
    fd.append('submissionNote', submitNote);
    submitFiles.forEach(f => fd.append('files', f));
    try {
      await milestoneAPI.submit(submitModal._id, fd);
      toast({ title: 'Milestone submitted for review!', type: 'success' });
      setSubmitModal(null); setSubmitNote(''); setSubmitFiles([]);
      const { data } = await milestoneAPI.getByContract(selected._id);
      setMilestones(data.data.milestones || []);
    } catch (err) { toast({ title: err.response?.data?.message || 'Failed', type: 'error' }); }
  };

  const handleSubmitTimesheet = async () => {
    try {
      await timesheetAPI.submit({ contractId: selected._id, ...tsForm, entries: tsForm.entries.map(e => ({ ...e, hoursWorked: Number(e.hoursWorked) })) });
      toast({ title: 'Timesheet submitted!', type: 'success' });
      setTimesheetModal(false); setTsForm({ weekStartDate: '', entries: [{ date: '', hoursWorked: '', taskDescription: '' }] });
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
        <div><h1 className="text-xl font-bold text-gray-900">My Contracts</h1><p className="text-sm text-gray-500">{contracts.length} contracts</p></div>
        <div className="flex gap-2">
          {['', 'pending', 'active', 'under_review', 'completed'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s ? s.replace('_', ' ') : 'All'}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div> :
        contracts.length === 0 ? <EmptyState icon={Briefcase} title="No contracts yet" description="Contracts will appear here once clients hire you" /> :
        <div className="grid md:grid-cols-2 gap-4">
          {contracts.map(c => (
            <div key={c._id} className="card p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => selectContract(c)}>
              <div className="flex items-start gap-3 mb-3">
                <Avatar src={c.clientId?.avatar} name={c.clientId?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                  <p className="text-sm text-gray-500">{c.clientId?.name}</p>
                </div>
                <Badge status={c.status} />
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Budget</span><span className="font-semibold">{formatCurrency(c.totalBudget)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(c.spendPercentage || 0, 100)}%` }} /></div>
              <p className="text-xs text-gray-400">{formatCurrency(c.amountPaid)} earned · {formatDate(c.endDate)} deadline</p>
              {c.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={e => { e.stopPropagation(); handleAccept(c._id); }}><Check size={14} /> Accept</Button>
                </div>
              )}
            </div>
          ))}
        </div>}

      {/* Contract Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="xl">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar src={selected.clientId?.avatar} name={selected.clientId?.name} size="md" />
              <div><p className="font-semibold">{selected.clientId?.name}</p><p className="text-sm text-gray-500">{formatDate(selected.startDate)} → {formatDate(selected.endDate)}</p></div>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setSelected(null); navigate('/messages'); }}><MessageSquare size={14} /> Chat</Button>
                {selected.type === 'hourly' && selected.status === 'active' && (
                  <Button size="sm" variant="secondary" onClick={() => setTimesheetModal(true)}><Plus size={14} /> Timesheet</Button>
                )}
                {['active', 'under_review'].includes(selected.status) && <Button size="sm" variant="danger" onClick={() => setDisputeModal(true)}><Flag size={14} /> Raise Dispute</Button>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Milestones</h3>
              {milestones.length === 0 ? <p className="text-sm text-gray-400">No milestones yet</p> : (
                <div className="space-y-3">
                  {milestones.map(m => (
                    <div key={m._id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2"><p className="font-medium text-gray-900">{m.title}</p><Badge status={m.status} /></div>
                          <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>
                          <p className="text-sm font-semibold text-primary-600 mt-1">{formatCurrency(m.amount)} · Due {formatDate(m.dueDate)}</p>
                          {m.rejectionRemark && <div className="mt-2 bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg"><strong>Rejected:</strong> {m.rejectionRemark}</div>}
                        </div>
                        {['pending', 'rejected'].includes(m.status) && selected.status === 'active' && (
                          <Button size="sm" onClick={() => setSubmitModal(m)}><Upload size={13} /> Submit</Button>
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

      {/* Submit Milestone Modal */}
      <Modal isOpen={!!submitModal} onClose={() => { setSubmitModal(null); setSubmitNote(''); setSubmitFiles([]); }} title={`Submit: ${submitModal?.title}`}
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setSubmitModal(null)}>Cancel</Button><Button onClick={handleSubmitMilestone}>Submit for Review</Button></div>}>
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-xl p-3 text-sm"><p className="font-medium text-primary-800">{submitModal?.title}</p><p className="text-primary-600">{formatCurrency(submitModal?.amount)}</p></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Work Notes</label><textarea value={submitNote} onChange={e => setSubmitNote(e.target.value)} rows={4} placeholder="Describe what you completed..." className="input" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Attachments</label><input type="file" multiple onChange={e => setSubmitFiles(Array.from(e.target.files))} className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 w-full" /></div>
        </div>
      </Modal>

      {/* Timesheet Modal */}
      <Modal isOpen={timesheetModal} onClose={() => setTimesheetModal(false)} title="Submit Timesheet" size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setTimesheetModal(false)}>Cancel</Button><Button onClick={handleSubmitTimesheet}>Submit Timesheet</Button></div>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Week Start Date</label><input type="date" value={tsForm.weekStartDate} onChange={e => setTsForm({ ...tsForm, weekStartDate: e.target.value })} className="input" /></div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-gray-700">Daily Entries</label><button onClick={() => setTsForm({ ...tsForm, entries: [...tsForm.entries, { date: '', hoursWorked: '', taskDescription: '' }] })} className="text-xs text-primary-600 font-medium flex items-center gap-1"><Plus size={12} /> Add Day</button></div>
            <div className="space-y-2">
              {tsForm.entries.map((e, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <input type="date" value={e.date} onChange={ev => { const a = [...tsForm.entries]; a[i].date = ev.target.value; setTsForm({ ...tsForm, entries: a }); }} className="input col-span-3 text-xs py-2" />
                  <input type="number" min="0" max="24" placeholder="Hrs" value={e.hoursWorked} onChange={ev => { const a = [...tsForm.entries]; a[i].hoursWorked = ev.target.value; setTsForm({ ...tsForm, entries: a }); }} className="input col-span-2 text-xs py-2" />
                  <input placeholder="Task description" value={e.taskDescription} onChange={ev => { const a = [...tsForm.entries]; a[i].taskDescription = ev.target.value; setTsForm({ ...tsForm, entries: a }); }} className="input col-span-6 text-xs py-2" />
                  {tsForm.entries.length > 1 && <button onClick={() => setTsForm({ ...tsForm, entries: tsForm.entries.filter((_, j) => j !== i) })} className="col-span-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Total: <strong>{tsForm.entries.reduce((s, e) => s + (Number(e.hoursWorked) || 0), 0)} hours</strong></p>
          </div>
        </div>
      </Modal>

      {/* Raise Dispute Modal */}
      <Modal isOpen={disputeModal} onClose={() => { setDisputeModal(false); setDisputeReason(''); }} title="Raise a Dispute"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setDisputeModal(false)}>Cancel</Button><Button variant="danger" onClick={handleRaiseDispute} loading={submittingDispute}>Submit Dispute</Button></div>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Raising a dispute notifies the client and our admin team. The contract will be marked as disputed until resolved.</p>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">What's the issue? *</label><textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4} placeholder="Describe the issue in detail..." className="input" /></div>
        </div>
      </Modal>
    </div>
  );
};

export default FreelancerContracts;
