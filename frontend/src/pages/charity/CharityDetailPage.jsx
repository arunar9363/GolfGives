import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Users, Heart, Calendar, IndianRupee } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CharityDetailPage = () => {
  const { slug } = useParams();
  const { user, isSubscribed, refreshUser } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    api.get(`/charities/${slug}`)
      .then(r => setCharity(r.data.data))
      .catch(() => setCharity(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSelect = async () => {
    if (!isSubscribed) return toast.error('Active subscription required');
    setSelecting(true);
    try {
      await api.put('/charities/select', { charityId: charity._id, percentage: 10 });
      toast.success(`Now supporting ${charity.name}!`);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSelecting(false); }
  };

  const isCurrentCharity = user?.selectedCharity?._id === charity?._id || user?.selectedCharity === charity?._id;

  if (loading) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!charity) return (
    <div className="page-bg min-h-screen flex items-center justify-center text-muted">
      <div className="text-center">
        <p className="text-xl mb-4 text-primary">Charity not found</p>
        <Link to="/charities" className="btn-primary">Back to Charities</Link>
      </div>
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar />
      <div className="pt-20">
        {/* Cover image */}
        <div className="h-80 bg-black/5 dark:bg-dark-800 relative overflow-hidden">
          {charity.coverImage ? (
            <img src={charity.coverImage} alt={charity.name} className="w-full h-full object-cover opacity-60 dark:opacity-40" />
          ) : charity.image ? (
            <img src={charity.image} alt={charity.name} className="w-full h-full object-cover opacity-50 dark:opacity-30" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/30 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative pb-24">
          <Link to="/charities" className="flex items-center gap-2 text-muted hover:text-primary text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Charities
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="badge-green capitalize">{charity.category}</span>
                  {charity.isFeatured && <span className="badge-yellow">Featured</span>}
                  {charity.country && <span className="badge-gray">{charity.country}</span>}
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">{charity.name}</h1>
                <p className="text-muted text-lg leading-relaxed mb-8">{charity.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[
                    { label: 'Supporters', value: charity.totalSubscribers, icon: Users },
                    { label: 'Total Raised', value: `₹${(charity.totalReceived).toLocaleString('en-IN')}`, icon: IndianRupee },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="card p-4 text-center">
                      <Icon className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                      <p className="text-primary font-bold text-xl">{value}</p>
                      <p className="text-muted text-xs">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Upcoming events */}
                {charity.upcomingEvents?.length > 0 && (
                  <div>
                    <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-500" /> Upcoming Events
                    </h3>
                    <div className="space-y-3">
                      {charity.upcomingEvents.map((event, i) => (
                        <div key={i} className="card p-4">
                          <p className="text-primary font-medium">{event.title}</p>
                          {event.date && <p className="text-muted text-sm">{format(new Date(event.date), 'dd MMMM yyyy')}</p>}
                          {event.description && <p className="text-muted text-sm mt-1">{event.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="card p-6">
                <h3 className="text-primary font-semibold mb-4">Support This Charity</h3>
                {isCurrentCharity ? (
                  <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-4 text-center">
                    <Heart className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                    <p className="text-brand-600 dark:text-brand-400 font-medium text-sm">You're supporting this charity</p>
                    <p className="text-faint text-xs mt-1">{user?.charityPercentage}% of your subscription</p>
                  </div>
                ) : (
                  <>
                    <p className="text-muted text-sm mb-4 leading-relaxed">
                      Selecting this charity means {user?.charityPercentage || 10}% of your subscription goes directly to them.
                    </p>
                    {isSubscribed ? (
                      <button onClick={handleSelect} disabled={selecting} className="btn-primary w-full justify-center">
                        {selecting
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><Heart className="w-4 h-4" /> Choose This Charity</>}
                      </button>
                    ) : (
                      <Link to="/pricing" className="btn-primary w-full justify-center block text-center">Subscribe to Give</Link>
                    )}
                  </>
                )}
              </div>

              {charity.website && (
                <a href={charity.website} target="_blank" rel="noopener noreferrer"
                  className="card p-4 flex items-center gap-3 hover:border-brand-500/20 transition-all group">
                  <Globe className="w-4 h-4 text-faint group-hover:text-brand-500 transition-colors" />
                  <span className="text-muted group-hover:text-primary text-sm transition-colors">Visit Website</span>
                </a>
              )}

              {charity.registrationNumber && (
                <div className="card p-4">
                  <p className="text-faint text-xs">Registered Charity</p>
                  <p className="text-muted text-sm font-mono">{charity.registrationNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CharityDetailPage;
