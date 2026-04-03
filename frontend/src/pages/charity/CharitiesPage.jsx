import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, ArrowRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const CATEGORIES = ['all','health','education','environment','poverty','children','animals','disaster'];

const CharitiesPage = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);
      const res = await api.get(`/charities?${params}`);
      setCharities(res.data.data || []);
    } catch { setCharities([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, [search, category]);


  return (
    <div className="page-bg">
      <Navbar />
      <div className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-3">Give with Purpose</p>
            <h1 className="section-title text-primary mb-4">Choose Your Charity</h1>
            <p className="text-muted max-w-xl leading-relaxed">Every subscription on GolfGives supports a real charity. Browse our verified partners and pick the one that resonates with you.</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
              <input type="text" className="input pl-10" placeholder="Search charities…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                    category === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-black/5 dark:bg-white/5 text-muted hover:text-primary hover:bg-black/8 dark:hover:bg-white/10'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...new Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-black/5 dark:bg-dark-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-black/5 dark:bg-dark-700 rounded w-1/3" />
                    <div className="h-4 bg-black/5 dark:bg-dark-700 rounded w-3/4" />
                    <div className="h-3 bg-black/5 dark:bg-dark-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : charities.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <p className="text-lg">No charities found for your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities.map((charity, i) => (
                <motion.div key={charity._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/charities/${charity.slug}`} className="card-hover overflow-hidden group block h-full">
                    <div className="h-52 bg-black/5 dark:bg-dark-700 overflow-hidden relative">
                      {charity.image ? (
                        <img src={charity.image} alt={charity.name}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-faint text-4xl font-display">{charity.name[0]}</div>
                      )}
                      {charity.isFeatured && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md">FEATURED</div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="badge-green capitalize text-xs">{charity.category}</span>
                        <span className="flex items-center gap-1 text-faint text-xs">
                          <Users className="w-3 h-3" /> {charity.totalSubscribers}
                        </span>
                      </div>
                      <h3 className="text-primary font-semibold text-base mb-2">{charity.name}</h3>
                      <p className="text-muted text-sm leading-relaxed flex-1">{charity.shortDescription}</p>
                      <div className="flex items-center gap-1 text-brand-500 text-xs font-medium mt-4">
                        Learn more <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CharitiesPage;
