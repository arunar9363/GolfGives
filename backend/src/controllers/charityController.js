const Charity = require('../models/Charity');
const User = require('../models/User');

// @GET /api/charities — public list
const getCharities = async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];

    const charities = await Charity.find(query).sort({ isFeatured: -1, totalSubscribers: -1 });
    res.json({ success: true, data: charities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/charities/:slug
const getCharityBySlug = async (req, res) => {
  try {
    const charity = await Charity.findOne({ slug: req.params.slug, isActive: true });
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, data: charity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/charities/select — user selects a charity
const selectCharity = async (req, res) => {
  try {
    const { charityId, percentage } = req.body;

    const charity = await Charity.findById(charityId);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });

    const charityPct = percentage ? Math.min(100, Math.max(10, Number(percentage))) : 10;

    // Decrement old charity subscriber count
    if (req.user.selectedCharity) {
      await Charity.findByIdAndUpdate(req.user.selectedCharity, { $inc: { totalSubscribers: -1 } });
    }

    await User.findByIdAndUpdate(req.user._id, {
      selectedCharity: charityId,
      charityPercentage: charityPct,
    });

    // Increment new charity subscriber count
    await Charity.findByIdAndUpdate(charityId, { $inc: { totalSubscribers: 1 } });

    res.json({ success: true, message: 'Charity selection updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADMIN ──

// @POST /api/charities — admin creates charity
const createCharity = async (req, res) => {
  try {
    const { name, description, shortDescription, category, country, website, isFeatured, registrationNumber, contactEmail } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Charity.findOne({ slug });
    if (existing) return res.status(409).json({ success: false, message: 'Charity with this name already exists' });

    const charity = await Charity.create({
      name, slug, description, shortDescription, category, country, website,
      isFeatured: isFeatured || false,
      registrationNumber, contactEmail,
      image: req.body.image || '',
      coverImage: req.body.coverImage || '',
    });

    res.status(201).json({ success: true, data: charity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/charities/:id — admin updates
const updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, data: charity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/charities/:id — soft delete
const deleteCharity = async (req, res) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Charity deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCharities, getCharityBySlug, selectCharity, createCharity, updateCharity, deleteCharity };
