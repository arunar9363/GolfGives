const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDashboardStats, getUsers, getUserById, updateUser, updateUserScores, getCharityReport } = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/scores', updateUserScores);
router.get('/reports/charity', getCharityReport);

module.exports = router;
