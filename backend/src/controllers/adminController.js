const User = require('../models/User');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const Charity = require('../models/Charity');
const Donation = require('../models/Donation');
const Score = require('../models/Score');

// @GET /api/admin/stats — dashboard overview
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      monthlySubscribers,
      yearlySubscribers,
      totalCharities,
      pendingWinners,
      totalDraws,
      latestDraw,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'monthly' }),
      User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'yearly' }),
      Charity.countDocuments({ isActive: true }),
      Winner.countDocuments({ verificationStatus: 'proof_submitted' }),
      Draw.countDocuments({ status: 'published' }),
      Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 }),
    ]);

    // Total charity donations
    const donationAgg = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDonations = donationAgg[0]?.total || 0;

    // Monthly new users (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newUsersMonthly = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscribers,
        monthlySubscribers,
        yearlySubscribers,
        totalCharities,
        pendingWinners,
        totalDraws,
        totalDonations: (totalDonations / 100).toFixed(2),
        latestDraw,
        newUsersMonthly,
        estimatedMonthlyRevenue: ((monthlySubscribers * 999 + yearlySubscribers * 833) / 100).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { role: 'user' };

    if (status) query['subscription.status'] = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-password');

    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('selectedCharity', 'name category');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const scores = await Score.findOne({ user: user._id });
    const wins = await Winner.find({ user: user._id }).populate('draw', 'month year');

    res.json({ success: true, data: { user, scores, wins } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, isActive, role, charityPercentage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, isActive, role, charityPercentage },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/admin/users/:id/scores — admin can edit user scores
const updateUserScores = async (req, res) => {
  try {
    const { scores } = req.body; // array of { value, datePlayed }
    const scoreDoc = await Score.findOne({ user: req.params.id });
    if (!scoreDoc) return res.status(404).json({ success: false, message: 'Score record not found' });

    scoreDoc.scores = scores.slice(0, 5); // cap at 5
    scoreDoc.lastUpdated = new Date();
    await scoreDoc.save();

    res.json({ success: true, data: scoreDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/reports/charity
const getCharityReport = async (req, res) => {
  try {
    const report = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$charity', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'charities', localField: '_id', foreignField: '_id', as: 'charity' } },
      { $unwind: '$charity' },
      { $project: { charityName: '$charity.name', totalAmount: 1, count: 1 } },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getUsers, getUserById, updateUser, updateUserScores, getCharityReport };
