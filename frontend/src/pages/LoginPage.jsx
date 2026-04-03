import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ui/ThemeToggle';

const AuthWrapper = ({ children, title, subtitle }) => (
  <div className="min-h-screen page-bg flex items-center justify-center px-4">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/6 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute top-4 right-4">
      <ThemeToggle />
    </div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center group-hover:bg-brand-400 transition-colors">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-xl text-primary">GolfGives</span>
        </Link>
        <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
        <p className="text-muted text-sm">{subtitle}</p>
      </div>
      <div className="card p-8">{children}</div>
      <Link to="/" className="flex items-center justify-center gap-2 mt-6 text-faint hover:text-muted text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>
    </motion.div>
  </div>
);

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthWrapper title="Welcome back" subtitle="Sign in to your GolfGives account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input type="email" className="input" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className="input pr-12" placeholder="••••••••"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-muted text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-500 hover:text-brand-600 font-medium">Create one free</Link>
      </p>
    </AuthWrapper>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to GolfGives 🎉');
      navigate('/pricing');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthWrapper title="Create your account" subtitle="Start playing and giving today — it takes 2 minutes">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Full name</label>
          <input type="text" className="input" placeholder="John Smith"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Email address</label>
          <input type="email" className="input" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className="input pr-12" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-faint text-xs mt-4 leading-relaxed">
        By signing up you agree to our <a href="#" className="text-muted hover:text-primary underline">Terms</a> and{' '}
        <a href="#" className="text-muted hover:text-primary underline">Privacy Policy</a>.
      </p>
      <p className="text-center text-muted text-sm mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
      </p>
    </AuthWrapper>
  );
};

export default LoginPage;
