import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, Trophy, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const AdminDraws = () => {
  const [draws, setDraws] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const [drawType, setDrawType] = useState('random');
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [confirmExec, setConfirmExec] = useState(false);

  const fetchDraws = () => { api.get('/draws').then(r => setDraws(r.data.data || [])).catch(() => {}); };
  useEffect(() => { fetchDraws(); }, []);

  const runSimulation = async () => {
    setSimLoading(true); setSimulation(null);
    try {
      const res = await api.post('/draws/simulate', { drawType, jackpotRollover: 0 });
      setSimulation(res.data.data); toast.success('Simulation complete');
    } catch (e) { toast.error(e.response?.data?.message || 'Simulation failed'); }
    finally { setSimLoading(false); }
  };

  const executeDraw = async () => {
    setExecLoading(true);
    try {
      await api.post('/draws/execute', { month: targetMonth, year: targetYear, drawType });
      toast.success(`Draw for ${MONTHS[targetMonth-1]} ${targetYear} published!`);
      setConfirmExec(false); setSimulation(null); fetchDraws();
    } catch (e) { toast.error(e.response?.data?.message || 'Execution failed'); }
    finally { setExecLoading(false); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Draw Engine</h1>
        <p className="text-muted mt-1">Configure, simulate, and publish monthly draws.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Config */}
        <div className="card p-6">
          <h2 className="text-primary font-semibold mb-5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Draw Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Draw Algorithm</label>
              <div className="grid grid-cols-2 gap-3">
                {['random', 'algorithmic'].map(type => (
                  <button key={type} onClick={() => setDrawType(type)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all capitalize ${
                      drawType === type
                        ? 'border-amber-500/40 bg-amber-500/8 text-amber-700 dark:text-gold-400'
                        : 'border-theme text-muted hover:text-primary hover:border-theme/60'
                    }`}>
                    {type}
                    <p className="text-xs font-normal mt-0.5 opacity-70">
                      {type === 'random' ? 'Standard lottery style' : 'Weighted by rarity'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Month</label>
                <select className="input text-sm" value={targetMonth} onChange={e => setTargetMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <input type="number" className="input text-sm" value={targetYear}
                  onChange={e => setTargetYear(Number(e.target.value))} min={2024} max={2030} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={runSimulation} disabled={simLoading} className="btn-secondary flex-1 justify-center">
                {simLoading ? <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Simulating…</> : <><RefreshCw className="w-4 h-4" /> Simulate</>}
              </button>
              <button onClick={() => setConfirmExec(true)} className="btn-primary flex-1 justify-center">
                <Play className="w-4 h-4" /> Execute
              </button>
            </div>
          </div>
        </div>

        {/* Simulation result */}
        <div className="card p-6">
          <h2 className="text-primary font-semibold mb-5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-500" /> Simulation Result
          </h2>
          {simulation ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-faint text-xs mb-3">Winning numbers (simulation only):</p>
              <div className="flex gap-2 mb-5">
                {simulation.winningNumbers.map(n => (
                  <div key={n} className="w-11 h-11 bg-amber-500/10 border-2 border-amber-500/25 rounded-xl flex items-center justify-center text-amber-600 dark:text-gold-400 font-bold">
                    {n}
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-5">
                {[
                  { label: '5-Match Winners', key: 'fiveMatch', prize: simulation.perPersonPrize?.fiveMatch, pool: simulation.prizePool?.fiveMatch },
                  { label: '4-Match Winners', key: 'fourMatch', prize: simulation.perPersonPrize?.fourMatch, pool: simulation.prizePool?.fourMatch },
                  { label: '3-Match Winners', key: 'threeMatch', prize: simulation.perPersonPrize?.threeMatch, pool: simulation.prizePool?.threeMatch },
                ].map(({ label, key, prize, pool }) => (
                  <div key={key} className="flex items-center justify-between bg-black/3 dark:bg-white/4 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-secondary text-sm">{label}</p>
                      <p className="text-faint text-xs">Pool: £{pool?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">{simulation.winners?.[key]?.length || 0}</p>
                      <p className="text-brand-500 text-xs">£{prize?.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-black/3 dark:bg-white/4 rounded-xl px-4 py-3">
                <p className="text-muted text-sm">Total Prize Pool</p>
                <p className="text-amber-600 dark:text-gold-400 font-bold">£{simulation.prizePool?.total?.toFixed(2)}</p>
              </div>
              {simulation.jackpotCarried && (
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> No 5-match winner — jackpot would roll over
                </p>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <Zap className="w-10 h-10 text-faint mx-auto mb-3" />
              <p className="text-muted text-sm">Run a simulation to preview results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmExec && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card p-8 max-w-sm w-full">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-primary font-bold text-lg text-center mb-2">Confirm Draw Execution</h3>
              <p className="text-muted text-sm text-center mb-6">
                You're about to publish the <strong className="text-primary">{MONTHS[targetMonth-1]} {targetYear}</strong> draw using the <strong className="text-primary">{drawType}</strong> algorithm. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmExec(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={executeDraw} disabled={execLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-all">
                  {execLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm & Publish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past draws table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-theme">
          <h3 className="text-primary font-semibold">Published Draws</h3>
        </div>
        {draws.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">No draws published yet.</div>
        ) : (
          <div className="divide-y divide-theme">
            {draws.map(draw => (
              <div key={draw._id} className="flex items-center gap-4 px-6 py-4 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                <div className="min-w-[90px]">
                  <p className="text-primary font-medium text-sm">{MONTHS[draw.month-1].slice(0,3)} {draw.year}</p>
                  <p className="text-faint text-xs capitalize">{draw.drawType}</p>
                </div>
                <div className="flex gap-1.5 flex-1 flex-wrap">
                  {draw.winningNumbers?.map(n => (
                    <div key={n} className="w-8 h-8 bg-amber-500/8 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-600 dark:text-gold-400 text-xs font-bold">{n}</div>
                  ))}
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-muted text-xs">{(draw.winners?.fiveMatch?.length||0)+(draw.winners?.fourMatch?.length||0)+(draw.winners?.threeMatch?.length||0)} winners</p>
                  <p className="text-brand-500 text-xs">£{draw.prizePool?.total?.toFixed(2)}</p>
                </div>
                {draw.jackpotCarriedForward && <span className="badge-yellow hidden sm:flex">Rolled over</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDraws;
