import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Target, Info, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ScoresPage = () => {
  const { isSubscribed } = useAuth();
  const [scoreDoc, setScoreDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ value: '', datePlayed: '', course: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchScores = async () => {
    try { const res = await api.get('/scores/my'); setScoreDoc(res.data.data); }
    catch { setScoreDoc({ scores: [] }); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isSubscribed) fetchScores(); else setLoading(false); }, [isSubscribed]);

  const resetForm = () => { setForm({ value: '', datePlayed: '', course: '', notes: '' }); setShowAddForm(false); setEditingId(null); };

  const handleAdd = async () => {
    if (!form.value || !form.datePlayed) return toast.error('Score and date are required');
    if (Number(form.value) < 1 || Number(form.value) > 45) return toast.error('Score must be 1–45');
    setSubmitting(true);
    try { await api.post('/scores/add', { ...form, value: Number(form.value) }); toast.success('Score added!'); fetchScores(); resetForm(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (scoreId) => {
    if (!form.value || !form.datePlayed) return toast.error('Score and date required');
    setSubmitting(true);
    try { await api.put(`/scores/${scoreId}`, { ...form, value: Number(form.value) }); toast.success('Score updated'); fetchScores(); resetForm(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (scoreId) => {
    if (!confirm('Delete this score?')) return;
    try { await api.delete(`/scores/${scoreId}`); toast.success('Score deleted'); fetchScores(); }
    catch { toast.error('Delete failed'); }
  };

  const startEdit = (score) => {
    setEditingId(score._id);
    setForm({ value: score.value, datePlayed: format(new Date(score.datePlayed), 'yyyy-MM-dd'), course: score.course || '', notes: score.notes || '' });
    setShowAddForm(false);
  };

  if (!isSubscribed) return (
    <div className="card p-10 text-center">
      <Target className="w-12 h-12 text-faint mx-auto mb-4" />
      <h2 className="text-primary font-bold text-xl mb-2">Subscription Required</h2>
      <p className="text-muted mb-6">Subscribe to start logging your golf scores.</p>
      <Link to="/pricing" className="btn-primary">View Plans</Link>
    </div>
  );

  const scores = scoreDoc?.scores || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Scores</h1>
          <p className="text-muted mt-1">Your last 5 Stableford scores. New scores replace the oldest.</p>
        </div>
        <button onClick={() => { setShowAddForm(v => !v); setEditingId(null); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Score
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-brand-500/8 border border-brand-500/15 rounded-xl p-4 flex items-start gap-3 mb-6">
        <Info className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
        <p className="text-secondary text-sm leading-relaxed">
          You can store up to 5 scores. When you add a 6th, your oldest score is automatically removed. These scores are used in the monthly draw — any score matching drawn numbers wins!
        </p>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="card p-6">
              <h3 className="text-primary font-semibold mb-5">Add New Score</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Stableford Score *</label>
                  <input type="number" className="input" placeholder="1 – 45" min={1} max={45}
                    value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Date Played *</label>
                  <input type="date" className="input" value={form.datePlayed}
                    onChange={e => setForm(p => ({ ...p, datePlayed: e.target.value }))}
                    max={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <div>
                  <label className="label">Course Name</label>
                  <input type="text" className="input" placeholder="e.g. Royal Liverpool"
                    value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <input type="text" className="input" placeholder="Optional notes"
                    value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAdd} disabled={submitting} className="btn-primary">
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Save Score</>}
                </button>
                <button onClick={resetForm} className="btn-secondary"><X className="w-4 h-4" /> Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scores list */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : scores.length === 0 ? (
        <div className="card p-12 text-center">
          <Target className="w-12 h-12 text-faint mx-auto mb-4" />
          <p className="text-muted font-medium mb-2">No scores yet</p>
          <p className="text-faint text-sm">Add your first Stableford score to enter the monthly draw.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((score, i) => (
            <motion.div key={score._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5">
              {editingId === score._id ? (
                <div className="grid md:grid-cols-2 gap-3">
                  <input type="number" className="input text-sm" min={1} max={45} placeholder="Score"
                    value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                  <input type="date" className="input text-sm" value={form.datePlayed}
                    onChange={e => setForm(p => ({ ...p, datePlayed: e.target.value }))} />
                  <input type="text" className="input text-sm" placeholder="Course"
                    value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(score._id)} disabled={submitting} className="btn-primary py-2 px-3 text-sm flex-1 justify-center">
                      {submitting ? '...' : 'Save'}
                    </button>
                    <button onClick={resetForm} className="btn-secondary py-2 px-3 text-sm"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    i === 0
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-2 border-brand-500/25'
                      : 'bg-black/4 dark:bg-white/5 text-muted border border-theme'
                  }`}>
                    {score.value}
                  </div>
                  <div className="flex-1">
                    <p className="text-primary font-medium text-sm">{score.course || 'Golf Round'}</p>
                    <p className="text-muted text-xs">{format(new Date(score.datePlayed), 'dd MMMM yyyy')}</p>
                    {score.notes && <p className="text-faint text-xs mt-0.5 italic">"{score.notes}"</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {i === 0 && <span className="badge-green text-xs mr-2">Latest</span>}
                    <button onClick={() => startEdit(score)}
                      className="w-8 h-8 rounded-lg text-faint hover:text-primary hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(score._id)}
                      className="w-8 h-8 rounded-lg text-faint hover:text-red-500 hover:bg-red-500/8 flex items-center justify-center transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Slot dots */}
      <div className="mt-6 flex items-center gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < scores.length ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10'}`} />
        ))}
        <span className="text-faint text-xs">{scores.length}/5 slots used</span>
      </div>
    </div>
  );
};

export default ScoresPage;
