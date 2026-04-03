import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, FileCheck, Clock, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',       color: 'badge-yellow', icon: Clock },
  proof_submitted:  { label: 'Under Review',  color: 'badge-yellow', icon: FileCheck },
  approved:         { label: 'Approved',      color: 'badge-green',  icon: CheckCircle },
  rejected:         { label: 'Rejected',      color: 'badge-red',    icon: XCircle },
  paid:             { label: 'Paid',          color: 'badge-green',  icon: IndianRupee },
};

const WinningsPage = () => {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/winners/my').then(r => setWins(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalPaid    = wins.filter(w => w.verificationStatus === 'paid').reduce((s, w) => s + w.prizeAmount, 0);
  const totalPending = wins.filter(w => ['pending','proof_submitted','approved'].includes(w.verificationStatus)).reduce((s, w) => s + w.prizeAmount, 0);

  if (loading) return (
    <div className="card p-10 flex justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">My Winnings</h1>
        <p className="text-muted mt-1">All your prize wins, verification status, and payouts.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Prizes', value: wins.length, icon: Trophy, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500', valColor: 'text-primary' },
          { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: IndianRupee, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-500', valColor: 'text-brand-600 dark:text-brand-400' },
          { label: 'Pending Payout', value: `₹${totalPending.toLocaleString('en-IN')}`, icon: Clock, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500', valColor: 'text-amber-600 dark:text-amber-400' },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, valColor }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className={`text-xl font-bold ${valColor}`}>{value}</p>
            <p className="text-muted text-sm">{label}</p>
          </div>
        ))}
      </div>

      {wins.length === 0 ? (
        <div className="card p-14 text-center">
          <Trophy className="w-12 h-12 text-faint mx-auto mb-4" />
          <p className="text-muted font-medium mb-1">No wins yet</p>
          <p className="text-faint text-sm">Keep logging your scores — your lucky draw could be this month!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wins.map((win, i) => {
            const cfg = STATUS_CONFIG[win.verificationStatus] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={win._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-primary font-semibold capitalize">{win.matchType}-Match Winner</p>
                        <span className={cfg.color}><StatusIcon className="w-3 h-3 inline mr-0.5" />{cfg.label}</span>
                      </div>
                      <p className="text-muted text-sm">
                        {win.draw ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][win.draw.month-1]} ${win.draw.year} Draw` : 'Monthly Draw'}
                      </p>
                      {win.matchedNumbers?.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {win.matchedNumbers.map(n => (
                            <span key={n} className="w-7 h-7 bg-amber-500/12 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center text-xs font-bold">{n}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-amber-600 dark:text-amber-400 font-bold text-xl">₹{win.prizeAmount?.toLocaleString('en-IN')}</p>
                    {win.paidAt && <p className="text-faint text-xs mt-1">Paid {format(new Date(win.paidAt), 'dd MMM yyyy')}</p>}
                  </div>
                </div>

                {win.verificationStatus === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-theme flex items-center justify-between">
                    <p className="text-muted text-sm">Submit proof to claim your prize.</p>
                    <Link to={`/dashboard/winnings/${win._id}/proof`} className="btn-primary py-2 px-4 text-sm">
                      <FileCheck className="w-4 h-4" /> Submit Proof
                    </Link>
                  </div>
                )}
                {win.adminNote && win.verificationStatus === 'rejected' && (
                  <div className="mt-4 pt-4 border-t border-theme">
                    <p className="text-red-500 text-sm">Admin note: {win.adminNote}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WinningsPage;
