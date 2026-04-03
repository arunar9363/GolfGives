import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Heart, Trophy } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const features = [
    'Monthly prize draw entry',
    'Track your last 5 Stableford scores',
    '10% of subscription to chosen charity',
    'View draw results & history',
    'Winner verification portal',
    'Mobile-friendly dashboard',
    'Cancel anytime',
  ];
  const yearlyFeatures = [...features, 'Save 17% vs monthly', 'Priority draw entry'];

  return (
    <div className="page-bg">
      <Navbar />
      <div className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-3">Simple Pricing</p>
            <h1 className="section-title text-primary mb-4">One Platform. Two Plans.</h1>
            <p className="text-muted max-w-xl mx-auto">No hidden fees. No complicated tiers. Pick your billing cycle and start playing.</p>
            <div className="mt-8 inline-flex items-center gap-1 bg-black/5 dark:bg-dark-800 border border-theme rounded-xl p-1">
              {['monthly', 'yearly'].map(cycle => (
                <button key={cycle} onClick={() => setBillingCycle(cycle)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    billingCycle === cycle ? 'bg-brand-500 text-white shadow-sm' : 'text-muted hover:text-primary'
                  }`}>
                  {cycle}
                  {cycle === 'yearly' && <span className="ml-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs px-1.5 py-0.5 rounded-full">-17%</span>}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { plan: 'monthly', title: 'Monthly', price: '₹999', period: '/month', desc: 'Perfect for getting started. Full access, cancel anytime.', highlight: false, featureList: features },
              { plan: 'yearly', title: 'Yearly', price: '₹9,999', period: '/year', sub: '₹833/month billed annually', desc: 'Best value. Save over ₹2,000 a year and get priority draw entry.', highlight: true, featureList: yearlyFeatures },
            ].map(({ plan, title, price, period, sub, desc, highlight, featureList }) => (
              <motion.div key={plan} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: plan === 'yearly' ? 0.1 : 0 }}
                className={`card p-8 relative ${highlight ? 'border-brand-500/30 glow-green' : ''}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow">BEST VALUE</div>
                )}
                <div className="mb-6">
                  <h3 className="text-primary font-bold text-xl mb-1">{title}</h3>
                  <p className="text-muted text-sm mb-4">{desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-primary">{price}</span>
                    <span className="text-muted mb-1">{period}</span>
                  </div>
                  {sub && <p className="text-faint text-xs mt-1">{sub}</p>}
                </div>
                <ul className="space-y-3 mb-8">
                  {featureList.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm text-secondary">
                      <Check className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                  highlight ? 'bg-brand-500 hover:bg-brand-400 text-white' : 'bg-black/5 dark:bg-white/8 hover:bg-black/8 dark:hover:bg-white/12 text-primary border border-theme'
                }`}>Get Started</Link>
              </motion.div>
            ))}
          </div>

          {/* Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16 card p-8">
            <h3 className="text-primary font-bold text-xl mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> How Your Subscription is Distributed
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Trophy, label: 'Prize Pool', pct: '50%', desc: 'Split between 3, 4, and 5-match winners each month', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500', pctColor: 'text-amber-600 dark:text-amber-400' },
                { icon: Heart, label: 'Charity', pct: '10%+', desc: 'Goes directly to your chosen charity every billing cycle', iconBg: 'bg-red-500/10', iconColor: 'text-red-500', pctColor: 'text-red-500' },
                { icon: Zap, label: 'Platform', pct: '40%', desc: 'Keeps the platform running, secure, and growing', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500', pctColor: 'text-blue-600 dark:text-blue-400' },
              ].map(({ icon: Icon, label, pct, desc, iconBg, iconColor, pctColor }) => (
                <div key={label} className="text-center">
                  <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <p className={`text-2xl font-bold ${pctColor} mb-1`}>{pct}</p>
                  <p className="text-primary font-medium mb-1">{label}</p>
                  <p className="text-muted text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly prize pool example */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 card p-6 border-brand-500/20">
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-brand-500" /> Example Prize Pool (500 Active Members)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: '5-Match Jackpot', amount: '₹2,49,750', pct: '40%', color: 'text-amber-600 dark:text-amber-400' },
                { label: '4-Match Prize', amount: '₹2,18,531', pct: '35%', color: 'text-brand-600 dark:text-brand-400' },
                { label: '3-Match Prize', amount: '₹1,56,094', pct: '25%', color: 'text-blue-600 dark:text-blue-400' },
              ].map(({ label, amount, pct, color }) => (
                <div key={label} className="bg-black/3 dark:bg-white/4 rounded-xl p-4">
                  <p className={`text-xl font-bold ${color}`}>{amount}</p>
                  <p className="text-muted text-xs mt-1">{label} ({pct})</p>
                </div>
              ))}
            </div>
            <p className="text-faint text-xs mt-3 text-center">Based on 500 active subscribers at ₹999/month. Actual pool varies with subscriber count.</p>
          </motion.div>

          {/* FAQ */}
          <div className="mt-16">
            <h3 className="text-primary font-bold text-xl mb-8 text-center">Common Questions</h3>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                ['What is Stableford scoring?', 'Stableford is a golf scoring system where points are awarded based on your score relative to par on each hole. A typical full round produces a score between 1–45 points.'],
                ['How does the draw work?', 'Each month, 5 numbers between 1–45 are drawn. If any of your 5 stored scores match 3, 4, or all 5 of the drawn numbers, you win a share of that prize tier.'],
                ['What happens if no one wins the jackpot?', 'If no player matches all 5 numbers, the 5-match prize pool rolls over to the following month, growing the jackpot.'],
                ['Can I change my charity?', 'Yes — change your selected charity anytime from your dashboard. New selection takes effect on your next billing cycle.'],
                ['How are payments processed?', 'We use Stripe for secure card payments. Prizes are paid via UPI or bank transfer within 7 working days of verification.'],
              ].map(([q, a]) => (
                <div key={q} className="card p-5">
                  <p className="text-primary font-medium mb-2">{q}</p>
                  <p className="text-muted text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
