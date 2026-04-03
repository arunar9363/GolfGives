import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CreditCard, Trophy, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  const tooltipStyle = isDark
    ? { background: '#1a241a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }
    : { background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, color: '#0f1f0f', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' };

  const axisColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
    </div>
  );

  const chartData = stats?.newUsersMonthly?.map(item => ({
    name: `${MONTHS[item._id.month - 1]} ${String(item._id.year).slice(2)}`,
    users: item.count,
  })) || [];

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { label: 'Active Subscribers', value: stats?.activeSubscribers || 0, icon: CreditCard, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-500' },
    { label: 'Pending Verifications', value: stats?.pendingWinners || 0, icon: AlertCircle, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    { label: 'Total Donated', value: `₹${stats?.totalDonations || '0.00'}`, icon: Heart, iconBg: 'bg-red-500/10', iconColor: 'text-red-500' },
    { label: 'Monthly Revenue Est.', value: `₹${stats?.estimatedMonthlyRevenue || '0.00'}`, icon: TrendingUp, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    { label: 'Total Draws', value: stats?.totalDraws || 0, icon: Trophy, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500' },
    { label: 'Monthly Plan', value: stats?.monthlySubscribers || 0, icon: CreditCard, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-500' },
    { label: 'Yearly Plan', value: stats?.yearlySubscribers || 0, icon: CreditCard, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted mt-1">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card p-5">
            <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="text-xl font-bold text-primary">{value}</p>
            <p className="text-muted text-sm">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-primary font-semibold mb-6">New Users (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="users" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Latest draw */}
      {stats?.latestDraw && (
        <div className="card p-6">
          <h3 className="text-primary font-semibold mb-4">Latest Draw Summary</h3>
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex-1">
              <p className="text-muted text-xs mb-3">
                {MONTHS[stats.latestDraw.month - 1]} {stats.latestDraw.year} — {stats.latestDraw.drawType}
              </p>
              <div className="flex gap-2 flex-wrap">
                {stats.latestDraw.winningNumbers?.map(n => (
                  <div key={n} className="w-10 h-10 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-600 dark:text-gold-400 font-bold text-sm">
                    {n}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: '5-Match', key: 'fiveMatch' },
                { label: '4-Match', key: 'fourMatch' },
                { label: '3-Match', key: 'threeMatch' },
              ].map(({ label, key }) => (
                <div key={key} className="bg-black/3 dark:bg-white/5 rounded-xl p-3 min-w-[70px]">
                  <p className="text-primary font-bold">{stats.latestDraw.winners?.[key]?.length || 0}</p>
                  <p className="text-faint text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
