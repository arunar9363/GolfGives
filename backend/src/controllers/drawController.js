const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const { simulateDraw, executeDraw } = require('../services/drawEngine');

// @GET /api/draws — public: get published draws (paginated)
const getDraws = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('winners.fiveMatch winners.fourMatch winners.threeMatch', 'name avatar');

    const total = await Draw.countDocuments({ status: 'published' });

    res.json({ success: true, data: draws, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/draws/latest — most recent published draw
const getLatestDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .populate('winners.fiveMatch winners.fourMatch winners.threeMatch', 'name avatar');
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/draws/:id — single draw
const getDrawById = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id)
      .populate('winners.fiveMatch winners.fourMatch winners.threeMatch', 'name avatar');
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/draws/my-participation — check user's draw history
const getMyParticipation = async (req, res) => {
  try {
    const myWins = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year winningNumbers status publishedAt')
      .sort({ createdAt: -1 });

    const publishedDraws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(12)
      .select('month year winningNumbers prizePool publishedAt');

    res.json({ success: true, wins: myWins, draws: publishedDraws });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/draws/simulate — ADMIN: run simulation without saving
const simulateDrawAdmin = async (req, res) => {
  try {
    const { drawType = 'random', jackpotRollover = 0 } = req.body;
    const simulation = await simulateDraw(drawType, Number(jackpotRollover));
    res.json({ success: true, data: simulation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/draws/execute — ADMIN: run and publish draw
const executeDrawAdmin = async (req, res) => {
  try {
    const { month, year, drawType = 'random' } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year required' });
    }

    const result = await executeDraw(Number(month), Number(year), drawType);
    res.json({ success: true, message: 'Draw executed and published', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDraws, getLatestDraw, getDrawById, getMyParticipation, simulateDrawAdmin, executeDrawAdmin };
