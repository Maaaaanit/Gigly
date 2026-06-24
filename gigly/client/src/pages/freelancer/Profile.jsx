import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { freelancerAPI } from '../../api';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import { CATEGORIES, formatCurrency } from '../../utils/helpers';
import { Plus, X, Upload } from 'lucide-react';

const FreelancerProfile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skill, setSkill] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState({ title: '', bio: '', category: '', hourlyRate: '', experience: 'entry', availability: 'available', location: '', portfolioLinks: [''], bankDetails: { accountNo: '', ifsc: '', bankName: '', accountHolderName: '' } });

  useEffect(() => {
    freelancerAPI.getMyProfile().then(({ data }) => {
      const p = data.data.profile;
      setProfile(p);
      setForm({
        title: p.title || '', bio: p.bio || '', category: p.category || '', hourlyRate: p.hourlyRate || '',
        experience: p.experience || 'entry', availability: p.availability || 'available', location: p.location || '',
        portfolioLinks: p.portfolioLinks?.length ? p.portfolioLinks : [''],
        bankDetails: { accountNo: p.documents?.bankDetails?.accountNo || '', ifsc: p.documents?.bankDetails?.ifsc || '', bankName: p.documents?.bankDetails?.bankName || '', accountHolderName: p.documents?.bankDetails?.accountHolderName || '' },
      });
    }).catch(() => toast({ title: 'Failed to load profile', type: 'error' }))
    .finally(() => setLoading(false));
  }, [user._id]);

  const addSkill = () => {
    if (skill.trim() && !profile?.skills?.includes(skill.trim())) {
      const skills = [...(profile?.skills || []), skill.trim()];
      freelancerAPI.updateProfile(user._id, { skills }).then(({ data }) => { setProfile(data.data.profile); setSkill(''); }).catch(() => {});
    }
  };

  const removeSkill = (s) => {
    const skills = profile.skills.filter(x => x !== s);
    freelancerAPI.updateProfile(user._id, { skills }).then(({ data }) => setProfile(data.data.profile)).catch(() => {});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'bankDetails') { Object.entries(v).forEach(([bk, bv]) => fd.append(`documents[bankDetails][${bk}]`, bv)); }
        else if (k === 'portfolioLinks') { v.filter(Boolean).forEach(l => fd.append('portfolioLinks', l)); }
        else fd.append(k, v);
      });
      if (avatarFile) {
        const afd = new FormData(); afd.append('avatar', avatarFile);
        await freelancerAPI.updateAvatar(afd);
        await refreshUser();
      }
      const { data } = await freelancerAPI.updateProfile(user._id, fd);
      setProfile(data.data.profile);
      toast({ title: 'Profile updated!', type: 'success' });
    } catch (err) { toast({ title: 'Failed to save', description: err.response?.data?.message, type: 'error' }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-48 bg-gray-200 rounded-2xl" /><div className="h-64 bg-gray-200 rounded-2xl" /></div>;

  const f = (field, val) => setForm({ ...form, [field]: val });

  return (
    <div className="max-w-3xl space-y-5">
      <div><h1 className="text-xl font-bold text-gray-900">Edit Profile</h1><p className="text-sm text-gray-500 mt-0.5">Keep your profile updated to attract more clients</p></div>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar} name={user?.name} size="2xl" />
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700">
              <Upload size={13} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={e => setAvatarFile(e.target.files[0])} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={profile?.rating || 0} size={13} />
              <span className="text-xs text-gray-500">{profile?.rating?.toFixed(1)} · {profile?.totalRatings} reviews · {profile?.totalContractsCompleted} projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Title</label><input value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Full Stack React Developer" className="input" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label><textarea value={form.bio} onChange={e => f('bio', e.target.value)} rows={4} placeholder="Describe your expertise..." className="input" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label><select value={form.category} onChange={e => f('category', e.target.value)} className="input"><option value="">Select...</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Hourly Rate (₹)</label><input type="number" value={form.hourlyRate} onChange={e => f('hourlyRate', e.target.value)} placeholder="500" className="input" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label><select value={form.experience} onChange={e => f('experience', e.target.value)} className="input"><option value="entry">Entry Level</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label><select value={form.availability} onChange={e => f('availability', e.target.value)} className="input"><option value="available">Available</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label><input value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Mumbai, India" className="input" /></div>
      </div>

      {/* Skills */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Skills</h2>
        <div className="flex flex-wrap gap-2 min-h-8">
          {profile?.skills?.map(s => <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{s}<button onClick={() => removeSkill(s)}><X size={12} /></button></span>)}
          {(!profile?.skills || profile.skills.length === 0) && <p className="text-sm text-gray-400">No skills added yet</p>}
        </div>
        <div className="flex gap-2">
          <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="Add a skill..." className="input flex-1" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
          <Button size="sm" variant="secondary" onClick={addSkill}><Plus size={14} /> Add</Button>
        </div>
      </div>

      {/* Portfolio */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Portfolio Links</h2>
        {form.portfolioLinks.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input value={link} onChange={e => { const a = [...form.portfolioLinks]; a[i] = e.target.value; f('portfolioLinks', a); }} placeholder="https://github.com/..." className="input flex-1" />
            {form.portfolioLinks.length > 1 && <button onClick={() => f('portfolioLinks', form.portfolioLinks.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={16} /></button>}
          </div>
        ))}
        <button onClick={() => f('portfolioLinks', [...form.portfolioLinks, ''])} className="text-sm text-primary-600 font-medium flex items-center gap-1"><Plus size={14} /> Add link</button>
      </div>

      {/* Bank Details */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Bank Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {[['bankName', 'Bank Name', 'HDFC Bank'], ['accountHolderName', 'Account Holder', 'Full name as on bank'], ['accountNo', 'Account Number', '1234567890'], ['ifsc', 'IFSC Code', 'HDFC0001234']].map(([field, label, placeholder]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input value={form.bankDetails[field]} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, [field]: e.target.value } })} placeholder={placeholder} className="input" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="md">Save All Changes</Button>
      </div>
    </div>
  );
};

export default FreelancerProfile;
