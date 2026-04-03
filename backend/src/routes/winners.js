const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { upload, getMyWinnings, uploadProof, submitBankDetails, getAllWinners, reviewWinner, markPaid } = require('../controllers/winnerController');

// User
router.get('/my', protect, getMyWinnings);
router.post('/:winnerId/upload-proof', protect, upload.single('proof'), uploadProof);
router.put('/:winnerId/bank-details', protect, submitBankDetails);

// Admin
router.get('/', protect, adminOnly, getAllWinners);
router.put('/:id/review', protect, adminOnly, reviewWinner);
router.put('/:id/mark-paid', protect, adminOnly, markPaid);

module.exports = router;
