import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Check, Search, Sliders } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CharitySelectionPage = () => {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [pct, setPct] = useState(user?.charityPercentage || 10);
  const [selecting, setSelecting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/charities').then(r => setCharities(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.shortDescription?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (charityId) => {
    setSelecting(charityId);
    try {
      await api.put('/charities/select', { charityId, percentage: pct });
      toast.success('Charity updated!');
      refreshUser();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSelecting(null); }
  };

  const currentId = typeof user?.selectedCharity === 'object' ? user?.selectedCharity?._id : user?.selectedCharity;
  const monthlyContribution = ((999 * pct) / 100).toFixed(0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">My Charity</h1>
        <p className="text-muted mt-1">Choose which charity receives a portion of your subscription each month.</p>
      </div>

      {/* Percentage slider */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Sliders className="w-4 h-4 text-brand-500" />
          <h3 className="text-primary font-semibold">Charity Contribution</h3>
        </div>
        <p className="text-muted text-sm mb-5">Set what percentage of your monthly subscription goes to charity. Minimum 10%.</p>
        <div className="flex items-center gap-4 mb-3">
          <input type="range" min={10} max={100} step={5} value={pct}
            onChange={e => setPct(Number(e.target.value))}
            className="flex-1 accent-brand-500 h-2 rounded-full cursor-pointer" />
          <span className="text-brand-600 dark:text-brand-400 font-bold text-xl w-12 text-right">{pct}%</span>
        </div>
        <div className="flex items-center gap-2 bg-brand-500/8 border border-brand-500/15 rounded-xl px-4 py-3">
          <Heart className="w-4 h-4 text-brand-500" />
          <p className="text-secondary text-sm">
            At {pct}%, you contribute <strong className="text-primary">₹{monthlyContribution}/month</strong> on the monthly plan
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
        <input className="input pl-10" placeholder="Search charities…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Current selection */}
      {currentId && (
        <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-4 flex items-center gap-3 mb-6">
          <Heart className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <div>
            <p className="text-brand-600 dark:text-brand-400 text-sm font-medium">
              Currently supporting: {charities.find(c => c._id === currentId)?.name || user?.selectedCharity?.name || '…'}
            </p>
            <p className="text-faint text-xs">{pct}% of your subscription • click below to change</p>
          </div>
        </div>
      )}

      {/* Charities grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((charity, i) => {
            const isCurrent = charity._id === currentId;
            return (
              <motion.div key={charity._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`card-hover p-5 cursor-pointer transition-all ${isCurrent ? 'border-brand-500/35 bg-brand-500/3' : ''}`}
                onClick={() => handleSelect(charity._id)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/5 dark:bg-dark-700 flex-shrink-0">
                    {charity.image
                      ? <img src={charity.image} alt={charity.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-faint font-bold text-lg">{charity.name[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary font-medium text-sm truncate">{charity.name}</p>
                    <p className="text-muted text-xs mt-0.5 truncate">{charity.shortDescription}</p>
                    <span className="badge-gray capitalize text-xs mt-1 inline-block">{charity.category}</span>
                  </div>
                  <div className="flex-shrink-0">
                    {selecting === charity._id ? (
                      <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin block" />
                    ) : isCurrent ? (
                      <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 border-2 border-theme rounded-full" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CharitySelectionPage;
