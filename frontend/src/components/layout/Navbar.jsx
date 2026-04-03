import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/charities', label: 'Charities' },
    { to: '/pricing', label: 'Pricing' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-b border-black/5 dark:border-white/5 shadow-sm dark:shadow-xl'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center group-hover:bg-brand-400 transition-colors">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-xl text-primary">GolfGives</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? '!text-brand-500 font-semibold' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn-secondary py-2 px-4 text-sm">
                  {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button onClick={logout} className="text-muted hover:text-primary text-sm transition-colors px-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link px-2">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                  Get Started <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-muted hover:text-primary w-9 h-9 flex items-center justify-center rounded-lg"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/98 dark:bg-dark-800/98 backdrop-blur-xl border-b border-black/5 dark:border-white/5"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-secondary hover:text-primary font-medium py-1 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-theme pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn-primary justify-center">
                      {isAdmin ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <button onClick={logout} className="text-muted hover:text-primary text-sm text-center">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary justify-center">Get Started</Link>
                    <Link to="/login" className="btn-secondary justify-center">Sign In</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
