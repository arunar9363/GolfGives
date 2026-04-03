import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Target, Trophy, Heart, Settings,
  LogOut, Menu, X, ChevronRight, Zap, Heart as HeartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/scores', label: 'My Scores', icon: Target },
  { to: '/dashboard/draw', label: 'Monthly Draw', icon: Zap },
  { to: '/dashboard/winnings', label: 'Winnings', icon: Trophy },
  { to: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { to: '/dashboard/settings', label: 'Profile', icon: Settings },
];

const DashboardLayout = () => {
  const { user, logout, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-theme">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <HeartIcon className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-lg text-primary">GolfGives</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-muted hover:text-primary w-8 h-8 flex items-center justify-center rounded-lg">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subscription badge */}
      <div className="px-4 pt-4 pb-2">
        <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          isSubscribed
            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isSubscribed ? 'bg-brand-500 animate-pulse' : 'bg-red-500'}`} />
          {isSubscribed
            ? `${user?.subscription?.plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan — Active`
            : 'No Active Subscription'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/15'
                  : 'text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-faint'}`} />
                {label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-theme">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-brand-500/15 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-primary text-sm font-medium truncate">{user?.name}</p>
            <p className="text-faint text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/8 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-surface border-r border-theme flex-col fixed top-0 bottom-0 left-0 shadow-sm">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface border-r border-theme z-50 lg:hidden flex flex-col shadow-xl"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-4 bg-surface border-b border-theme sticky top-0 z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-muted hover:text-primary w-8 h-8 flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-primary flex-1">GolfGives</span>
          <ThemeToggle />
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
