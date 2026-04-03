import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Heart, Zap, ChevronRight, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor, to }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {to && (
        <Link to={to}>
          <ChevronRight className="w-4 h-4 text-faint hover:text-muted transition-colors" />
        </Link>
      )}
    </div>
    <p className="text-2xl font-bold text-primary mb-1">{value}</p>
    <p className="text-muted text-sm font-medium">{label}</p>
    {sub && <p className="text-faint text-xs mt-1">{sub}</p>}
  </motion.div>
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DashboardOverview = () => {
  const { user, isSubscribed } = useAuth();
  const [scores, setScores] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);
  const [wins, setWins] = useState([]);

  useEffect(() => {
    if (isSubscribed) {
      api.get('/scores/my').then(r => setScores(r.data.data)).catch(() => {});
      api.get('/winners/my').then(r => setWins(r.data.data || [])).catch(() => {});
    }
    api.get('/draws/latest').then(r => setLatestDraw(r.data.data)).catch(() => {});
  }, [isSubscribed]);

  const totalWon = wins.reduce((acc, w) => acc + (w.prizeAmount || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted mt-1">Here's your GolfGives overview.</p>
      </div>

      {/* No subscription banner */}
      {!isSubscribed && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex items-center gap-4 mb-8">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-700 dark:text-amber-300 font-medium text-sm">No active subscription</p>
            <p className="text-amber-600/70 dark:text-amber-400/60 text-xs mt-0.5">Subscribe to enter draws, log scores, and support your charity.</p>
          </div>
          <Link to="/pricing" className="btn-primary py-2 px-4 text-sm flex-shrink-0">
            <CreditCard className="w-4 h-4" /> Subscribe
          </Link>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={CreditCard} label="Subscription"
          iconBg="bg-brand-500/10" iconColor="text-brand-500"
          value={isSubscribed ? 'Active' : 'Inactive'}
          sub={isSubscribed && user?.subscription?.currentPeriodEnd
            ? `Renews ${format(new Date(user.subscription.currentPeriodEnd), 'dd MMM yyyy')}`
            : 'Not subscribed'}
          to="/dashboard/settings" />
        <StatCard icon={Target} label="Scores Logged"
          iconBg="bg-blue-500/10" iconColor="text-blue-500"
          value={scores?.scores?.length || 0}
          sub="of 5 maximum slots"
          to="/dashboard/scores" />
        <StatCard icon={Trophy} label="Total Winnings"
          iconBg="bg-amber-500/10" iconColor="text-amber-500"
          value={`£${totalWon.toFixed(2)}`}
          sub={`${wins.length} prize${wins.length !== 1 ? 's' : ''} won`}
          to="/dashboard/winnings" />
        <StatCard icon={Heart} label="Charity"
          iconBg="bg-red-500/10" iconColor="text-red-500"
          value={user?.selectedCharity?.name || 'Not chosen'}
          sub={user?.selectedCharity ? `${user.charityPercentage}% of subscription` : 'Choose a charity'}
          to="/dashboard/charity" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent scores */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-primary font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-500" /> My Scores
            </h2>
            <Link to="/dashboard/scores" className="btn-ghost text-xs">Manage <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {!isSubscribed ? (
            <p className="text-muted text-sm">Subscribe to log and track your scores.</p>
          ) : scores?.scores?.length > 0 ? (
            <div className="space-y-3">
              {scores.scores.map((s, i) => (
                <div key={s._id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    i === 0
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                      : 'bg-black/5 dark:bg-white/5 text-muted border border-theme'
                  }`}>
                    {s.value}
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary text-sm">{s.course || 'Golf Round'}</p>
                    <p className="text-faint text-xs">{format(new Date(s.datePlayed), 'dd MMM yyyy')}</p>
                  </div>
                  {i === 0 && <span className="badge-green text-xs">Latest</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Target className="w-8 h-8 text-faint mx-auto mb-2" />
              <p className="text-muted text-sm">No scores yet</p>
              <Link to="/dashboard/scores" className="btn-ghost text-sm mt-2">Add your first score</Link>
            </div>
          )}
        </div>

        {/* Latest draw */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-primary font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Latest Draw
            </h2>
            <Link to="/dashboard/draw" className="btn-ghost text-xs">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {latestDraw ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-muted text-sm">
                  {MONTHS[latestDraw.month - 1]} {latestDraw.year}
                </span>
                <span className="badge-green">Published</span>
              </div>
              <div className="flex gap-2 mb-5">
                {latestDraw.winningNumbers.map(n => (
                  <div key={n} className="w-10 h-10 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-600 dark:text-gold-400 font-bold text-sm">
                    {n}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: '5-Match', count: latestDraw.winners?.fiveMatch?.length || 0 },
                  { label: '4-Match', count: latestDraw.winners?.fourMatch?.length || 0 },
                  { label: '3-Match', count: latestDraw.winners?.threeMatch?.length || 0 },
                ].map(({ label, count }) => (
                  <div key={label} className="bg-black/3 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-primary font-bold">{count}</p>
                    <p className="text-faint text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Zap className="w-8 h-8 text-faint mx-auto mb-2" />
              <p className="text-muted text-sm">No draws published yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
