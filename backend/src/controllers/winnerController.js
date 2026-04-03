const multer = require('multer');
const path = require('path');
const Winner = require('../models/Winner');

// Multer config for proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/proofs/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof_${req.user._id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, PDF files allowed'));
    }
  },
});

// @GET /api/winners/my — get logged-in user's wins
const getMyWinnings = async (req, res) => {
  try {
    const wins = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year winningNumbers publishedAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: wins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/winners/:winnerId/upload-proof
const uploadProof = async (req, res) => {
  try {
    const winner = await Winner.findOne({ _id: req.params.winnerId, user: req.user._id });
    if (!winner) return res.status(404).json({ success: false, message: 'Winner record not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    winner.proofFile = req.file.path;
    winner.proofSubmittedAt = new Date();
    winner.verificationStatus = 'proof_submitted';
    await winner.save();

    res.json({ success: true, message: 'Proof uploaded successfully', data: winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/winners/:winnerId/submit-bank
const submitBankDetails = async (req, res) => {
  try {
    const winner = await Winner.findOne({ _id: req.params.winnerId, user: req.user._id });
    if (!winner) return res.status(404).json({ success: false, message: 'Winner record not found' });

    const { accountName, accountNumber, sortCode, paypalEmail } = req.body;
    winner.bankDetails = { accountName, accountNumber, sortCode, paypalEmail };
    await winner.save();

    res.json({ success: true, message: 'Bank details saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADMIN ──

// @GET /api/winners — admin: all winners
const getAllWinners = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { verificationStatus: status } : {};

    const winners = await Winner.find(query)
      .populate('user', 'name email')
      .populate('draw', 'month year')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Winner.countDocuments(query);
    res.json({ success: true, data: winners, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/winners/:id/review — admin approve/reject
const reviewWinner = async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'approve' | 'reject'
    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    winner.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
    winner.adminNote = note || '';
    winner.reviewedBy = req.user._id;
    winner.reviewedAt = new Date();
    await winner.save();

    res.json({ success: true, message: `Winner ${action}d`, data: winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/winners/:id/mark-paid — admin marks payment done
const markPaid = async (req, res) => {
  try {
    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'paid', paidAt: new Date() },
      { new: true }
    );
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });
    res.json({ success: true, message: 'Marked as paid', data: winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { upload, getMyWinnings, uploadProof, submitBankDetails, getAllWinners, reviewWinner, markPaid };
