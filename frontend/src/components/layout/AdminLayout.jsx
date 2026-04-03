import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Zap, Heart, Trophy, LogOut, Menu, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/draws', label: 'Draw Engine', icon: Zap },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: Trophy },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 flex items-center justify-between border-b border-theme">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-600 dark:text-gold-400" />
          </div>
          <span className="font-display font-bold text-primary">Admin Panel</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {mobile && (
            <button onClick={() => setOpen(false)} className="text-muted hover:text-primary w-8 h-8 flex items-center justify-center rounded-lg">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {adminNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-700 dark:text-gold-400 border border-amber-500/20'
                  : 'text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <><Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-gold-400' : 'text-faint'}`} />{label}</>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-theme">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-700 dark:text-gold-400 text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-primary text-sm font-medium">{user?.name}</p>
            <p className="text-faint text-xs">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/8 transition-all text-sm">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base flex">
      <aside className="hidden lg:flex w-60 bg-surface border-r border-theme fixed top-0 bottom-0 left-0 flex-col shadow-sm">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-surface border-r border-theme z-50 lg:hidden flex flex-col shadow-xl">
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 lg:ml-60">
        <div className="lg:hidden flex items-center gap-3 px-4 py-4 bg-surface border-b border-theme sticky top-0 z-30 shadow-sm">
          <button onClick={() => setOpen(true)} className="text-muted hover:text-primary"><Menu className="w-5 h-5" /></button>
          <Shield className="w-4 h-4 text-amber-600 dark:text-gold-400" />
          <span className="font-semibold text-primary text-sm flex-1">Admin Panel</span>
          <ThemeToggle />
        </div>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
