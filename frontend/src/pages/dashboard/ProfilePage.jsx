import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Lock, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', country: user?.country || '', handicap: user?.handicap || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.put('/users/profile', profile);
      await refreshUser();
      toast.success('Profile updated');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSavingProfile(false); }
  };

  const savePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Min 6 characters');
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await api.get('/payments/portal');
      window.location.href = res.data.url;
    } catch { toast.error('Could not open billing portal'); }
    finally { setPortalLoading(false); }
  };

  const sub = user?.subscription;
  const isActive = sub?.status === 'active';

  const planPrice = sub?.plan === 'yearly' ? '₹9,999/year' : '₹999/month';

  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Profile & Settings</h1>
        <p className="text-muted mt-1">Manage your account details and subscription.</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h2 className="text-primary font-semibold mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-500" /> Personal Info
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Full Name</label>
            <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="label">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email} readOnly />
            <p className="text-faint text-xs mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+91 98765 43210" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="input" placeholder="India" value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))} />
          </div>
          <div>
            <label className="label">Golf Handicap (optional)</label>
            <input type="number" className="input" placeholder="e.g. 12" value={profile.handicap} onChange={e => setProfile(p => ({ ...p, handicap: e.target.value }))} />
          </div>
        </div>
        <button onClick={saveProfile} disabled={savingProfile} className="btn-primary mt-5">
          {savingProfile ? '…' : <><Check className="w-4 h-4" /> Save Changes</>}
        </button>
      </motion.div>

      {/* Subscription */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h2 className="text-primary font-semibold mb-5 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-500" /> Subscription
        </h2>
        <div className="bg-black/3 dark:bg-white/3 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-primary font-medium capitalize">{sub?.status || 'Inactive'}</span>
          </div>
          {isActive && (
            <>
              <p className="text-muted text-sm capitalize">{sub?.plan} plan — {planPrice}</p>
              {sub?.currentPeriodEnd && (
                <p className="text-faint text-xs mt-1">
                  {sub.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} {format(new Date(sub.currentPeriodEnd), 'dd MMMM yyyy')}
                </p>
              )}
            </>
          )}
          {isActive && sub?.cancelAtPeriodEnd && (
            <span className="badge-yellow mt-2 inline-flex">Cancelling at period end</span>
          )}
        </div>
        {isActive ? (
          <button onClick={openBillingPortal} disabled={portalLoading} className="btn-secondary w-full justify-center">
            {portalLoading ? '…' : 'Manage Billing & Cancel'}
          </button>
        ) : (
          <a href="/pricing" className="btn-primary w-full justify-center block text-center">Subscribe Now</a>
        )}
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <h2 className="text-primary font-semibold mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted" /> Change Password
        </h2>
        <div className="space-y-4">
          {[
            ['currentPassword', 'Current Password', 'Enter current password'],
            ['newPassword', 'New Password', 'Min 6 characters'],
            ['confirm', 'Confirm New Password', 'Re-enter new password'],
          ].map(([field, label, placeholder]) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input type="password" className="input" placeholder={placeholder}
                value={passwords[field]} onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button onClick={savePassword} disabled={savingPw} className="btn-primary mt-5">
          {savingPw ? '…' : 'Update Password'}
        </button>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card p-6 border-red-500/15">
        <h2 className="text-primary font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" /> Danger Zone
        </h2>
        <p className="text-muted text-sm mb-4">To delete your account, please contact support. Account deletion is permanent.</p>
        <a href="mailto:support@golfgives.com" className="text-red-500/70 hover:text-red-500 text-sm transition-colors">
          Contact support to delete account →
        </a>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
