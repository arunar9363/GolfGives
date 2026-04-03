import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, X, DollarSign, Eye, Clock, FileCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  pending: 'badge-gray', proof_submitted: 'badge-yellow',
  approved: 'badge-green', rejected: 'badge-red', paid: 'badge-green',
};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminWinners = () => {
  const [winners, setWinners] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [note, setNote] = useState('');
  const [actioning, setActioning] = useState(null);
  const LIMIT = 15;

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/winners?${params}`);
      setWinners(res.data.data || []); setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load winners'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchWinners(); }, [fetchWinners]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const reviewWinner = async (id, action) => {
    setActioning(id);
    try {
      await api.put(`/winners/${id}/review`, { action, note });
      toast.success(`Winner ${action}d`); setSelectedWinner(null); setNote(''); fetchWinners();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setActioning(null); }
  };

  const markPaid = async (id) => {
    setActioning(id);
    try { await api.put(`/winners/${id}/mark-paid`); toast.success('Marked as paid'); fetchWinners(); }
    catch { toast.error('Failed'); }
    finally { setActioning(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Winners</h1>
          <p className="text-muted mt-1">Verify submissions and track payouts.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {[['','All'],['pending','Pending'],['proof_submitted','Needs Review'],['approved','Approved'],['rejected','Rejected'],['paid','Paid']].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === val
                ? 'bg-brand-500 text-white'
                : 'bg-black/5 dark:bg-white/5 text-muted hover:text-primary hover:bg-black/8 dark:hover:bg-white/10'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
        ) : winners.length === 0 ? (
          <div className="card p-12 text-center">
            <Trophy className="w-10 h-10 text-faint mx-auto mb-3" />
            <p className="text-muted text-sm">No winners match this filter.</p>
          </div>
        ) : winners.map((winner, i) => (
          <motion.div key={winner._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.04 }}
            className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-primary font-medium text-sm">{winner.user?.name || 'Unknown'}</p>
                  <span className={STATUS_COLORS[winner.verificationStatus] || 'badge-gray'}>
                    {winner.verificationStatus?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-muted text-xs">
                  {winner.user?.email} • {winner.draw ? `${MONTHS[winner.draw.month-1]} ${winner.draw.year}` : 'Unknown'} • <span className="capitalize">{winner.matchType}-match</span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-amber-600 dark:text-gold-400 font-bold">£{winner.prizeAmount?.toFixed(2)}</p>
                {winner.createdAt && <p className="text-faint text-xs">{format(new Date(winner.createdAt), 'dd MMM yyyy')}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {winner.proofFile && (
                  <a href={`/${winner.proofFile}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg text-faint hover:text-blue-500 hover:bg-blue-500/8 flex items-center justify-center transition-all">
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                )}
                {winner.verificationStatus === 'proof_submitted' && (
                  <button onClick={() => setSelectedWinner(winner)}
                    className="w-8 h-8 rounded-lg text-faint hover:text-primary hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center transition-all">
                    <FileCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {winner.verificationStatus === 'approved' && (
                  <button onClick={() => markPaid(winner._id)} disabled={actioning === winner._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/15 text-xs font-medium transition-all">
                    {actioning === winner._id ? '...' : <><DollarSign className="w-3.5 h-3.5" /> Mark Paid</>}
                  </button>
                )}
                {winner.verificationStatus === 'pending' && (
                  <button onClick={() => reviewWinner(winner._id, 'approve')} disabled={actioning === winner._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/15 text-xs font-medium transition-all">
                    {actioning === winner._id ? '...' : <><Check className="w-3.5 h-3.5" /> Approve</>}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {Math.ceil(total/LIMIT) > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-faint text-xs">Page {page} of {Math.ceil(total/LIMIT)}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)}
              className="px-3 py-1.5 rounded-lg text-sm bg-black/5 dark:bg-white/5 text-muted hover:bg-black/8 dark:hover:bg-white/10 disabled:opacity-30 transition-all">Prev</button>
            <button disabled={page>=Math.ceil(total/LIMIT)} onClick={() => setPage(p=>p+1)}
              className="px-3 py-1.5 rounded-lg text-sm bg-black/5 dark:bg-white/5 text-muted hover:bg-black/8 dark:hover:bg-white/10 disabled:opacity-30 transition-all">Next</button>
          </div>
        </div>
      )}

      {/* Review modal */}
      {selectedWinner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="card p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-primary font-bold text-lg mb-2">Review Submission</h3>
            <p className="text-muted text-sm mb-5">{selectedWinner.user?.name} — £{selectedWinner.prizeAmount?.toFixed(2)} prize</p>
            {selectedWinner.proofFile && (
              <a href={`/${selectedWinner.proofFile}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-500 text-sm mb-5 hover:underline">
                <Eye className="w-4 h-4" /> View uploaded proof
              </a>
            )}
            <div className="mb-5">
              <label className="label">Admin Note (optional)</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Reason for rejection or notes…"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => reviewWinner(selectedWinner._id, 'approve')} disabled={actioning === selectedWinner._id}
                className="btn-primary flex-1 justify-center">
                <Check className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => reviewWinner(selectedWinner._id, 'reject')} disabled={actioning === selectedWinner._id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-semibold transition-all">
                <X className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => { setSelectedWinner(null); setNote(''); }} className="btn-secondary px-4">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminWinners;
