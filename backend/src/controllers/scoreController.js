const Score = require('../models/Score');

// @GET /api/scores/my
const getMyScores = async (req, res) => {
  try {
    let scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) {
      scoreDoc = await Score.create({ user: req.user._id, scores: [] });
    }
    res.json({ success: true, data: scoreDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/scores/add
// Adds a new score — rolling: pushes to front, drops 6th entry
const addScore = async (req, res) => {
  try {
    const { value, datePlayed, course, notes } = req.body;

    if (!value || value < 1 || value > 45) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
    }
    if (!datePlayed) {
      return res.status(400).json({ success: false, message: 'Date played is required' });
    }

    let scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) {
      scoreDoc = new Score({ user: req.user._id, scores: [] });
    }

    scoreDoc.addScore(Number(value), new Date(datePlayed), course || '', notes || '');
    await scoreDoc.save();

    res.status(201).json({ success: true, message: 'Score added successfully', data: scoreDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/scores/:scoreId
// Edit a specific score entry
const editScore = async (req, res) => {
  try {
    const { value, datePlayed, course, notes } = req.body;
    const scoreDoc = await Score.findOne({ user: req.user._id });

    if (!scoreDoc) {
      return res.status(404).json({ success: false, message: 'Score record not found' });
    }

    const entry = scoreDoc.scores.id(req.params.scoreId);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Score entry not found' });
    }

    if (value !== undefined) {
      if (value < 1 || value > 45) {
        return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
      }
      entry.value = Number(value);
    }
    if (datePlayed) entry.datePlayed = new Date(datePlayed);
    if (course !== undefined) entry.course = course;
    if (notes !== undefined) entry.notes = notes;

    scoreDoc.lastUpdated = new Date();
    await scoreDoc.save();

    res.json({ success: true, message: 'Score updated', data: scoreDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/scores/:scoreId
const deleteScore = async (req, res) => {
  try {
    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) return res.status(404).json({ success: false, message: 'Score record not found' });

    const entry = scoreDoc.scores.id(req.params.scoreId);
    if (!entry) return res.status(404).json({ success: false, message: 'Score entry not found' });

    entry.deleteOne();
    scoreDoc.lastUpdated = new Date();
    await scoreDoc.save();

    res.json({ success: true, message: 'Score deleted', data: scoreDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyScores, addScore, editScore, deleteScore };
