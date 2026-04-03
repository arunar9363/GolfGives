import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Calendar, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DrawPage = () => {
  const { isSubscribed } = useAuth();
  const [data, setData] = useState({ wins: [], draws: [] });
  const [loading, setLoading] = useState(true);
  const [myScores, setMyScores] = useState([]);

  useEffect(() => {
    if (!isSubscribed) { setLoading(false); return; }
    Promise.all([
      api.get('/draws/user/participation'),
      api.get('/scores/my'),
    ]).then(([drawRes, scoreRes]) => {
      setData(drawRes.data);
      setMyScores(scoreRes.data.data?.scores?.map(s => s.value) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isSubscribed]);

  if (!isSubscribed) return (
    <div className="card p-10 text-center">
      <Zap className="w-12 h-12 text-faint mx-auto mb-4" />
      <h2 className="text-primary font-bold text-xl mb-2">Subscribe to Participate</h2>
      <p className="text-muted mb-6">Active subscribers are automatically entered in the monthly draw.</p>
      <Link to="/pricing" className="btn-primary">View Plans</Link>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Monthly Draw</h1>
        <p className="text-muted mt-1">Check draw results and your participation history.</p>
      </div>

      {/* My active numbers */}
      {myScores.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Your Active Numbers
          </h3>
          <p className="text-muted text-sm mb-4">These are your current stored scores — any match against winning draw numbers wins you a prize.</p>
          <div className="flex gap-3 flex-wrap">
            {myScores.map((n, i) => (
              <motion.div key={`${n}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                className="w-12 h-12 bg-brand-500/10 border border-brand-500/25 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg">
                {n}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Latest draw result */}
      {data.draws?.[0] && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-primary font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Latest Draw — {MONTHS[data.draws[0].month - 1]} {data.draws[0].year}
            </h3>
            <span className="badge-green">Published</span>
          </div>
          <p className="text-muted text-sm mb-4">Winning numbers:</p>
          <div className="flex gap-3 mb-5 flex-wrap">
            {data.draws[0].winningNumbers.map(n => {
              const isMatch = myScores.includes(n);
              return (
                <div key={n} className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 relative ${
                  isMatch
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400'
                    : 'bg-black/5 dark:bg-white/5 border-theme text-muted'
                }`}>
                  {n}
                  {isMatch && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />}
                </div>
              );
            })}
          </div>
          {myScores.length > 0 && (() => {
            const matchCount = data.draws[0].winningNumbers.filter(n => myScores.includes(n)).length;
            if (matchCount >= 3) return (
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <p className="text-amber-700 dark:text-amber-300 font-medium">You matched {matchCount} numbers! Check your winnings.</p>
              </div>
            );
            if (matchCount > 0) return (
              <p className="text-muted text-sm">You matched {matchCount} number{matchCount > 1 ? 's' : ''} — need 3+ to win.</p>
            );
            return <p className="text-muted text-sm">No matches this round. Good luck next month!</p>;
          })()}
        </div>
      )}

      {/* Prize pool info */}
      {data.draws?.[0] && (
        <div className="card p-6 mb-6">
          <h3 className="text-primary font-semibold mb-4">Prize Pool Breakdown</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '5-Match Jackpot', amount: data.draws[0].prizePool?.fiveMatch, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/8' },
              { label: '4-Match Prize', amount: data.draws[0].prizePool?.fourMatch, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-500/8' },
              { label: '3-Match Prize', amount: data.draws[0].prizePool?.threeMatch, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/8' },
            ].map(({ label, amount, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                <p className={`font-bold text-lg ${color}`}>₹{(amount || 0).toLocaleString('en-IN')}</p>
                <p className="text-muted text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draw history */}
      <div className="card p-6">
        <h3 className="text-primary font-semibold mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted" /> Draw History
        </h3>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-black/5 dark:bg-dark-700 rounded-xl animate-pulse" />)}</div>
        ) : data.draws?.length === 0 ? (
          <p className="text-muted text-sm text-center py-6">No draws published yet.</p>
        ) : (
          <div className="space-y-3">
            {data.draws.map(draw => {
              const isWinner = data.wins.some(w => w.draw?._id === draw._id || w.draw === draw._id);
              const matchCount = draw.winningNumbers.filter(n => myScores.includes(n)).length;
              return (
                <div key={draw._id} className="flex items-center gap-4 p-4 bg-black/2 dark:bg-white/2 rounded-xl border border-theme">
                  <div className="text-center min-w-[50px]">
                    <p className="text-primary font-semibold text-sm">{MONTHS[draw.month - 1]}</p>
                    <p className="text-faint text-xs">{draw.year}</p>
                  </div>
                  <div className="flex gap-1.5 flex-1 flex-wrap">
                    {draw.winningNumbers.map(n => (
                      <div key={n} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        myScores.includes(n)
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-black/5 dark:bg-white/5 text-muted'
                      }`}>{n}</div>
                    ))}
                  </div>
                  {isWinner ? (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" /> Winner
                    </span>
                  ) : matchCount > 0 ? (
                    <span className="text-muted text-xs">{matchCount} match</span>
                  ) : (
                    <XCircle className="w-4 h-4 text-faint" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawPage;
