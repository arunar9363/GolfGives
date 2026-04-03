import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Trophy, Target, Users, ArrowRight, Star, Sparkles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }),
};

const HomePage = () => {
  const [charities, setCharities] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    api.get('/charities?featured=true').then(r => setCharities(r.data.data?.slice(0, 3) || [])).catch(() => {});
    api.get('/draws/latest').then(r => setLatestDraw(r.data.data)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Active Members', value: '2,400+', icon: Users },
    { label: 'Charities Supported', value: '12', icon: Heart },
    { label: 'Prize Pool This Month', value: '₹6,20,000', icon: Trophy },
    { label: 'Total Donated', value: '£48,000', icon: Star },
  ];

  const steps = [
    { step: '01', title: 'Subscribe', desc: 'Choose monthly or yearly. Cancel anytime. Your subscription fuels the prize pool and charitable giving.' },
    { step: '02', title: 'Enter Your Scores', desc: 'Log your last 5 Stableford scores after each round. The system always keeps your latest 5.' },
    { step: '03', title: 'Monthly Draw', desc: 'Every month, 5 numbers are drawn. Match 3, 4, or all 5 of your scores to win prizes.' },
    { step: '04', title: 'Give & Win', desc: 'Part of every subscription goes to your chosen charity. Win prizes while changing lives.' },
  ];

  const fallbackCharities = [
    { _id: '1', name: 'Clean Water Foundation', shortDescription: 'Providing clean water to 2M+ people across Africa and Asia.', category: 'health', totalSubscribers: 320, image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop', slug: 'clean-water-foundation' },
    { _id: '2', name: "Children's Education Alliance", shortDescription: 'Building schools and funding scholarships for 50,000+ children.', category: 'children', totalSubscribers: 280, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop', slug: 'childrens-education-alliance' },
    { _id: '3', name: 'Mental Health Matters', shortDescription: 'Free counselling and crisis support for those who need it most.', category: 'health', totalSubscribers: 210, image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600&auto=format&fit=crop', slug: 'mental-health-matters' },
  ];

  const displayCharities = charities.length > 0 ? charities : fallbackCharities;

  return (
    <div className="page-bg">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Bg blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-500/8 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-60 h-60 bg-amber-500/8 dark:bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-brand-600 dark:text-brand-400 text-sm font-medium mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                Monthly draw now open — join thousands of players
              </div>

              <h1 className="section-title mb-6">
                <span className="text-primary">Play Golf.</span><br />
                <span className="text-gradient">Win Prizes.</span><br />
                <span className="text-primary">Change Lives.</span>
              </h1>

              <p className="text-muted text-lg leading-relaxed mb-10 max-w-lg">
                Subscribe, enter your Stableford scores, and participate in monthly prize draws while supporting a charity that matters to you with every subscription.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-4">
                  Start Playing <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/how-it-works" className="btn-secondary text-base px-8 py-4">
                  How It Works
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-faint text-sm flex-wrap">
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-400 fill-red-400/60" /> 10% min to charity</span>
                <span className="text-faint">•</span>
                <span>Cancel anytime</span>
                <span className="text-faint">•</span>
                <span>Monthly jackpots</span>
              </div>
            </motion.div>

            {/* Hero prize card */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="relative">
              <div className="card p-6 glow-green">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-muted text-xs uppercase tracking-wider mb-1">This Month's Prize Pool</p>
                    <p className="text-gradient text-4xl font-bold font-display">₹6,20,000</p>
                  </div>
                  <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-brand-500" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { label: '5-Match Jackpot', amount: '₹2,48,000', pct: '40%', color: 'text-amber-600 dark:text-gold-400' },
                    { label: '4-Match Prize',   amount: '₹2,17,000', pct: '35%', color: 'text-brand-600 dark:text-brand-400' },
                    { label: '3-Match Prize',   amount: '₹1,55,000', pct: '25%', color: 'text-blue-600 dark:text-blue-400' },
                  ].map(({ label, amount, pct, color }) => (
                    <div key={label} className="flex items-center justify-between bg-black/3 dark:bg-white/5 rounded-xl px-4 py-3">
                      <span className="text-muted text-sm">{label}</span>
                      <div className="text-right">
                        <span className={`font-bold text-sm ${color}`}>{amount}</span>
                        <span className="text-faint text-xs ml-2">{pct}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm">Draw in</p>
                    <p className="text-muted text-xs">End of month</p>
                  </div>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                    Join Draw <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 border-y border-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <motion.div key={label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{value}</p>
                <p className="text-muted text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="section-title text-primary mb-4">How GolfGives Works</h2>
            <p className="text-muted max-w-xl mx-auto">Four simple steps from subscription to making a difference — and potentially winning big.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(({ step, title, desc }, i) => (
              <motion.div key={step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="card-hover p-6">
                <div className="text-4xl font-display font-bold text-brand-500/20 dark:text-brand-500/15 mb-4">{step}</div>
                <h3 className="text-primary font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARITIES ── */}
      <section className="py-24 section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-3">Real Impact</p>
              <h2 className="section-title text-primary">Charities You Support</h2>
            </div>
            <Link to="/charities" className="btn-ghost hidden md:flex">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {displayCharities.map((charity, i) => (
              <motion.div key={charity._id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/charities/${charity.slug}`} className="card-hover overflow-hidden group block">
                  <div className="h-48 bg-black/5 dark:bg-dark-700 overflow-hidden">
                    {charity.image && (
                      <img src={charity.image} alt={charity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 dark:opacity-75" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-green capitalize">{charity.category}</span>
                      <span className="text-faint text-xs">{charity.totalSubscribers} supporters</span>
                    </div>
                    <h3 className="text-primary font-semibold mb-2">{charity.name}</h3>
                    <p className="text-muted text-sm leading-relaxed">{charity.shortDescription}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link to="/charities" className="btn-ghost">View all charities <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="section-title mb-6">
              <span className="text-primary">Ready to play with</span><br />
              <span className="text-gradient">purpose?</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
              Join thousands of golfers who are turning their passion into positive change.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base px-8 py-4">
                Join GolfGives <ChevronRight className="w-5 h-5" />
              </Link>
              <Link to="/pricing" className="btn-secondary text-base px-8 py-4">View Plans</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
