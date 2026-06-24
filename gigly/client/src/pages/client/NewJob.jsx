import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { CATEGORIES } from '../../utils/helpers';
import { ArrowLeft, Plus, X } from 'lucide-react';

const NewJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skill, setSkill] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: '', skills: [], type: 'fixed',
    budget: { min: '', max: '' }, duration: '1_to_3_months', experienceLevel: 'intermediate',
  });

  const addSkill = () => {
    if (skill.trim() && !form.skills.includes(skill.trim())) {
      setForm({ ...form, skills: [...form.skills, skill.trim()] });
      setSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) { toast({ title: 'Fill all required fields', type: 'error' }); return; }
    setLoading(true);
    try {
      await jobAPI.create({ ...form, budget: { min: Number(form.budget.min), max: Number(form.budget.max) } });
      toast({ title: 'Job posted!', description: 'Freelancers can now apply to your job', type: 'success' });
      navigate('/client/jobs');
    } catch (err) { toast({ title: 'Failed to post job', description: err.response?.data?.message, type: 'error' }); }
    finally { setLoading(false); }
  };

  const f = (field, val) => setForm({ ...form, [field]: val });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-sm text-gray-500 mt-0.5">Describe what you need and attract the best freelancers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Job Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
            <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Build a React Dashboard for our SaaS product" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)} placeholder="Describe the project, deliverables, requirements..." rows={6} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => f('category', e.target.value)} className="input" required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contract Type *</label>
              <select value={form.type} onChange={e => f('type', e.target.value)} className="input">
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Budget & Scope</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Budget (₹)</label>
              <input type="number" value={form.budget.min} onChange={e => setForm({ ...form, budget: { ...form.budget, min: e.target.value } })} placeholder="10000" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Budget (₹)</label>
              <input type="number" value={form.budget.max} onChange={e => setForm({ ...form, budget: { ...form.budget, max: e.target.value } })} placeholder="50000" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <select value={form.duration} onChange={e => f('duration', e.target.value)} className="input">
                <option value="less_than_1_month">Less than 1 month</option>
                <option value="1_to_3_months">1–3 months</option>
                <option value="3_to_6_months">3–6 months</option>
                <option value="more_than_6_months">6+ months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Level</label>
              <select value={form.experienceLevel} onChange={e => f('experienceLevel', e.target.value)} className="input">
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Required Skills</h2>
          <div className="flex gap-2">
            <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="Add a skill..." className="input flex-1"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
            <Button type="button" variant="secondary" size="sm" onClick={addSkill}><Plus size={14} /> Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map(s => (
              <span key={s} className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                {s}<button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter(x => x !== s) })}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>Post Job</Button>
        </div>
      </form>
    </div>
  );
};

export default NewJob;
