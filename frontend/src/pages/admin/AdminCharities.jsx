import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Star } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['health','education','environment','poverty','children','animals','disaster','other'];
const emptyForm = { name:'',shortDescription:'',description:'',category:'health',country:'',website:'',image:'',coverImage:'',isFeatured:false,registrationNumber:'',contactEmail:'' };

const AdminCharities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCharities = () => { api.get('/charities').then(r => setCharities(r.data.data||[])).finally(()=>setLoading(false)); };
  useEffect(()=>{ fetchCharities(); },[]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({...c}); setEditingId(c._id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleSave = async () => {
    if(!form.name||!form.description) return toast.error('Name and description required');
    setSaving(true);
    try {
      if(editingId) { await api.put(`/charities/${editingId}`,form); toast.success('Updated'); }
      else { await api.post('/charities',form); toast.success('Created'); }
      closeForm(); fetchCharities();
    } catch(e){ toast.error(e.response?.data?.message||'Save failed'); }
    finally{ setSaving(false); }
  };

  const handleDelete = async (id,name) => {
    if(!confirm(`Deactivate "${name}"?`)) return;
    try{ await api.delete(`/charities/${id}`); toast.success('Deactivated'); fetchCharities(); }
    catch{ toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Charities</h1>
          <p className="text-muted mt-1">{charities.length} active charities.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Charity</button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              className="card p-8 w-full max-w-2xl my-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-primary font-bold text-xl">{editingId ? 'Edit Charity' : 'Add Charity'}</h2>
                <button onClick={closeForm} className="text-faint hover:text-primary transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Charity Name *</label>
                  <input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Short Description</label>
                  <input className="input" placeholder="1 line summary" value={form.shortDescription} onChange={e=>setForm(p=>({...p,shortDescription:e.target.value}))} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Full Description *</label>
                  <textarea className="input min-h-[100px] resize-none" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" placeholder="Global" value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Image URL</label>
                  <input className="input" placeholder="https://…" value={form.image} onChange={e=>setForm(p=>({...p,image:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Cover Image URL</label>
                  <input className="input" placeholder="https://…" value={form.coverImage} onChange={e=>setForm(p=>({...p,coverImage:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input className="input" placeholder="https://…" value={form.website} onChange={e=>setForm(p=>({...p,website:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Contact Email</label>
                  <input className="input" placeholder="info@charity.org" value={form.contactEmail} onChange={e=>setForm(p=>({...p,contactEmail:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Registration Number</label>
                  <input className="input" placeholder="Optional" value={form.registrationNumber} onChange={e=>setForm(p=>({...p,registrationNumber:e.target.value}))} />
                </div>
                <div className="flex items-center pt-6">
                  <button onClick={()=>setForm(p=>({...p,isFeatured:!p.isFeatured}))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                      form.isFeatured
                        ? 'border-amber-500/40 bg-amber-500/8 text-amber-700 dark:text-gold-400'
                        : 'border-theme text-muted hover:text-primary'
                    }`}>
                    <Star className="w-4 h-4" /> {form.isFeatured ? 'Featured' : 'Set as Featured'}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t border-theme">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> {editingId?'Save Changes':'Create Charity'}</>}
                </button>
                <button onClick={closeForm} className="btn-secondary"><X className="w-4 h-4" /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=><div key={i} className="card h-32 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((charity,i)=>(
            <motion.div key={charity._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/5 dark:bg-dark-700 flex-shrink-0">
                  {charity.image
                    ? <img src={charity.image} alt={charity.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-faint font-bold">{charity.name[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-primary font-medium text-sm truncate">{charity.name}</p>
                    {charity.isFeatured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                  </div>
                  <p className="text-faint text-xs capitalize">{charity.category} • {charity.totalSubscribers} supporters</p>
                </div>
              </div>
              <p className="text-muted text-xs mb-4 line-clamp-2 leading-relaxed">{charity.shortDescription}</p>
              <div className="flex gap-2">
                <button onClick={()=>openEdit(charity)} className="btn-secondary py-1.5 px-3 text-xs flex-1 justify-center">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={()=>handleDelete(charity._id,charity.name)}
                  className="w-8 h-8 rounded-xl text-faint hover:text-red-500 hover:bg-red-500/8 flex items-center justify-center transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCharities;
