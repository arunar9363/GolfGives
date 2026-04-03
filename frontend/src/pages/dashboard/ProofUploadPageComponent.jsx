import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileCheck, ArrowLeft, Info } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProofUploadPageComponent = () => {
  const { winnerId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', ifscCode: '', upiId: '' });
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('proof', file);
      await api.post(`/winners/${winnerId}/upload-proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Proof uploaded!');
      setStep(2);
    } catch (e) { toast.error(e.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleBankSubmit = async () => {
    setUploading(true);
    try {
      await api.put(`/winners/${winnerId}/bank-details`, bankDetails);
      toast.success('Details saved. We\'ll review and process your payment soon!');
      navigate('/dashboard/winnings');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate('/dashboard/winnings')}
        className="flex items-center gap-2 text-muted hover:text-primary text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Winnings
      </button>

      <h1 className="text-2xl font-bold text-primary mb-2">Claim Your Prize</h1>
      <p className="text-muted mb-8">Complete both steps to receive your payout.</p>

      {/* Progress steps */}
      <div className="flex items-center gap-3 mb-10">
        {[{ n: 1, label: 'Upload Proof' }, { n: 2, label: 'Payment Details' }].map(({ n, label }) => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-2 ${step >= n ? 'text-brand-500' : 'text-faint'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step > n ? 'bg-brand-500 border-brand-500 text-white' :
                step === n ? 'border-brand-500 text-brand-500' : 'border-theme text-faint'
              }`}>
                {step > n ? '✓' : n}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{label}</span>
            </div>
            {n < 2 && <div className={`flex-1 h-0.5 transition-all ${step > n ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card p-6 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <Info className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
              <p className="text-muted text-sm leading-relaxed">
                Upload a screenshot from your golf club's app showing your scores for the winning draw period. Accepted: JPEG, PNG, PDF (max 5MB).
              </p>
            </div>
            <label
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
              className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-all ${
                dragOver ? 'border-brand-500 bg-brand-500/5' : 'border-theme hover:border-brand-500/40'
              }`}>
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
              <Upload className="w-8 h-8 text-faint" />
              <p className="text-muted text-sm text-center">
                {file ? <span className="text-brand-500 font-medium">{file.name}</span> : 'Drag & drop or click to upload'}
              </p>
              <p className="text-faint text-xs">JPEG, PNG or PDF — max 5MB</p>
            </label>
          </div>
          <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary w-full justify-center py-3">
            {uploading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><FileCheck className="w-4 h-4" /> Upload & Continue</>}
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card p-6 mb-6">
            <h3 className="text-primary font-semibold mb-5">Payment Details</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Account Holder Name</label>
                <input type="text" className="input" placeholder="Full name on account"
                  value={bankDetails.accountName} onChange={e => setBankDetails(p => ({ ...p, accountName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Account Number</label>
                  <input type="text" className="input" placeholder="1234567890"
                    value={bankDetails.accountNumber} onChange={e => setBankDetails(p => ({ ...p, accountNumber: e.target.value }))} />
                </div>
                <div>
                  <label className="label">IFSC Code</label>
                  <input type="text" className="input" placeholder="SBIN0001234"
                    value={bankDetails.ifscCode} onChange={e => setBankDetails(p => ({ ...p, ifscCode: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                <span className="text-faint text-xs">or pay via UPI</span>
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
              </div>
              <div>
                <label className="label">UPI ID (alternative)</label>
                <input type="text" className="input" placeholder="yourname@upi"
                  value={bankDetails.upiId} onChange={e => setBankDetails(p => ({ ...p, upiId: e.target.value }))} />
              </div>
            </div>
          </div>
          <button onClick={handleBankSubmit} disabled={uploading} className="btn-primary w-full justify-center py-3">
            {uploading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Submit Claim'}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProofUploadPageComponent;
