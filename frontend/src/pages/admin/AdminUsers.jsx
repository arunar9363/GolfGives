import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  active: 'badge-green', inactive: 'badge-gray', cancelled: 'badge-red', past_due: 'badge-yellow',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data || []); setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name, email: user.email, isActive: user.isActive, charityPercentage: user.charityPercentage });
  };

  const saveEdit = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, editForm);
      toast.success('User updated'); setEditingUser(null); fetchUsers();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Users</h1>
          <p className="text-muted mt-1">{total} total users</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input className="input pl-10 text-sm" placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input text-sm max-w-[180px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="past_due">Past Due</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme">
                <th className="text-left text-muted font-medium px-5 py-3">User</th>
                <th className="text-left text-muted font-medium px-4 py-3 hidden md:table-cell">Subscription</th>
                <th className="text-left text-muted font-medium px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-muted font-medium px-4 py-3 hidden lg:table-cell">Charity %</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-theme">
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-4 bg-black/5 dark:bg-dark-700 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : users.map(user => (
                <React.Fragment key={user._id}>
                  <tr className={`border-b border-theme transition-colors cursor-pointer ${expandedUser === user._id ? 'bg-black/2 dark:bg-white/2' : 'hover:bg-black/2 dark:hover:bg-white/2'}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-500/10 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-primary font-medium">{user.name}</p>
                          <p className="text-muted text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={STATUS_COLORS[user.subscription?.status] || 'badge-gray'}>
                        {user.subscription?.status || 'none'}
                      </span>
                      {user.subscription?.plan && (
                        <span className="text-faint text-xs ml-2 capitalize">{user.subscription.plan}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-muted text-xs">
                      {format(new Date(user.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-muted text-xs">{user.charityPercentage}%</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => startEdit(user)}
                          className="w-8 h-8 rounded-lg text-faint hover:text-primary hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                          className="w-8 h-8 rounded-lg text-faint hover:text-primary hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center transition-all">
                          {expandedUser === user._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Edit row */}
                  {editingUser === user._id && (
                    <tr className="border-b border-theme bg-black/2 dark:bg-dark-700/40">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="grid sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="label text-xs">Name</label>
                            <input className="input text-sm py-2" value={editForm.name}
                              onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                          </div>
                          <div>
                            <label className="label text-xs">Charity %</label>
                            <input type="number" min={10} max={100} className="input text-sm py-2"
                              value={editForm.charityPercentage}
                              onChange={e => setEditForm(p => ({ ...p, charityPercentage: Number(e.target.value) }))} />
                          </div>
                          <div>
                            <label className="label text-xs">Status</label>
                            <select className="input text-sm py-2" value={editForm.isActive}
                              onChange={e => setEditForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                              <option value="true">Active</option>
                              <option value="false">Deactivated</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(user._id)} className="btn-primary py-2 px-3 text-sm flex-1 justify-center">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingUser(null)} className="btn-secondary py-2 px-3 text-sm">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Expanded detail */}
                  {expandedUser === user._id && editingUser !== user._id && (
                    <tr className="border-b border-theme bg-black/2 dark:bg-dark-700/20">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-faint text-xs mb-1">Stripe Customer ID</p>
                            <p className="text-muted font-mono text-xs">{user.subscription?.stripeCustomerId || '—'}</p>
                          </div>
                          <div>
                            <p className="text-faint text-xs mb-1">Renewal Date</p>
                            <p className="text-secondary text-xs">
                              {user.subscription?.currentPeriodEnd ? format(new Date(user.subscription.currentPeriodEnd), 'dd MMM yyyy') : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-faint text-xs mb-1">Selected Charity</p>
                            <p className="text-secondary text-xs">{user.selectedCharity?.name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-faint text-xs mb-1">Last Login</p>
                            <p className="text-secondary text-xs">
                              {user.lastLogin ? format(new Date(user.lastLogin), 'dd MMM yyyy HH:mm') : 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-faint text-xs mb-1">Account</p>
                            <p className={`text-xs font-medium ${user.isActive ? 'text-brand-500' : 'text-red-500'}`}>
                              {user.isActive ? 'Active' : 'Deactivated'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-theme">
            <p className="text-faint text-xs">Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT,total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                className="px-3 py-1.5 rounded-lg text-sm bg-black/5 dark:bg-white/5 text-muted hover:bg-black/8 dark:hover:bg-white/10 disabled:opacity-30 transition-all">Prev</button>
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                className="px-3 py-1.5 rounded-lg text-sm bg-black/5 dark:bg-white/5 text-muted hover:bg-black/8 dark:hover:bg-white/10 disabled:opacity-30 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
