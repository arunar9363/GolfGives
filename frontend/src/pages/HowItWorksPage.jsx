import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Target, Zap, Trophy, Heart, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const HowItWorksPage = () => {
  const steps = [
    { icon: UserPlus, step: '01', title: 'Subscribe to a Plan', iconBg: 'bg-brand-500/10', iconColor: 'text-brand-500',
      desc: 'Choose between our Monthly (₹999) or Yearly (₹9,999) plan. Both give you full access to all platform features. Your subscription contributes to the monthly prize pool and directly funds your chosen charity.',
      details: ['Stripe-powered secure payments', 'Cancel anytime, no lock-in', 'Instant access after payment'] },
    { icon: Target, step: '02', title: 'Log Your Golf Scores', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500',
      desc: 'After each round, enter your Stableford score (1–45). The platform stores your last 5 scores. When you add a new score, it automatically replaces your oldest one.',
      details: ['Up to 5 scores stored at any time', 'Newest score replaces oldest', 'Score range: 1 to 45 (Stableford)'] },
    { icon: Zap, step: '03', title: 'Monthly Draw', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500',
      desc: 'On the first of every month, 5 numbers are drawn from 1–45. If any of your scores appear in the drawn numbers — you win a share of the prize pool.',
      details: ['5 numbers drawn each month', 'Match 3, 4, or 5 to win', 'Jackpot rolls over if unclaimed'] },
    { icon: Trophy, step: '04', title: 'Claim Your Prize', iconBg: 'bg-green-500/10', iconColor: 'text-green-500',
      desc: 'Winners are notified and asked to submit proof — a screenshot of your scores. Our team verifies and processes payouts via bank transfer or UPI.',
      details: ['Screenshot proof required', 'Admin verification process', 'UPI / Bank transfer payment'] },
    { icon: Heart, step: '05', title: 'Your Charity Receives', iconBg: 'bg-red-500/10', iconColor: 'text-red-500',
      desc: 'Every month, a minimum of 10% of your subscription is sent to your chosen charity. You can increase this percentage anytime or make one-off independent donations.',
      details: ['Min 10% to your chosen charity', 'Increase your % anytime', 'Independent donation option available'] },
  ];

  const prizes = [
    { match: '5 Numbers', pool: '40%', example: '₹2,48,000', color: 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5', label: 'text-amber-600 dark:text-amber-400', rollover: true },
    { match: '4 Numbers', pool: '35%', example: '₹2,17,000', color: 'border-brand-500/30 bg-brand-500/5', label: 'text-brand-600 dark:text-brand-400', rollover: false },
    { match: '3 Numbers', pool: '25%', example: '₹1,55,000', color: 'border-blue-500/30 bg-blue-500/5', label: 'text-blue-600 dark:text-blue-400', rollover: false },
  ];

  return (
    <div className="page-bg">
      <Navbar />
      <div className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-3">Full Breakdown</p>
            <h1 className="section-title text-primary mb-4">How GolfGives Works</h1>
            <p className="text-muted max-w-xl mx-auto leading-relaxed">Everything you need to know about subscriptions, scores, draws, prizes, and charity — explained clearly.</p>
          </motion.div>

          <div className="space-y-6">
            {steps.map(({ icon: Icon, step, title, iconBg, iconColor, desc, details }, i) => (
              <motion.div key={step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card p-8">
                <div className="flex gap-5">
                  <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-faint font-display font-bold text-2xl">{step}</span>
                      <h3 className="text-primary font-bold text-xl">{title}</h3>
                    </div>
                    <p className="text-muted leading-relaxed mb-4">{desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {details.map(d => (
                        <span key={d} className="bg-black/5 dark:bg-white/5 border border-theme text-muted text-xs px-3 py-1 rounded-full">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prize breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
            <h2 className="text-primary font-bold text-2xl mb-8 text-center">Prize Pool Distribution</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {prizes.map(({ match, pool, example, color, label, rollover }) => (
                <div key={match} className={`card p-6 border ${color} text-center`}>
                  <p className={`text-3xl font-bold font-display ${label} mb-1`}>{pool}</p>
                  <p className="text-primary font-semibold mb-1">{match}</p>
                  <p className="text-muted text-sm mb-3">~{example} this month</p>
                  {rollover && <span className="badge-yellow text-xs">Jackpot rolls over</span>}
                </div>
              ))}
            </div>
            <p className="text-center text-faint text-sm mt-4">Prize amounts calculated from monthly pool. Multiple winners in a tier share equally.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              Join GolfGives Now <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
