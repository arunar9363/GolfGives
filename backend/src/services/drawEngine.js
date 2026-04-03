const Score = require('../models/Score');
const User = require('../models/User');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');

// ─── DRAW ENGINE ──────────────────────────────────────────────────────────────

/**
 * Generate 5 winning numbers (1–45) — RANDOM mode
 */
const generateRandomNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Generate 5 winning numbers — ALGORITHMIC mode
 * Picks numbers weighted by LEAST frequently occurring scores
 * (favors rarer scores to lower hit probability, maintaining prize sustainability)
 */
const generateAlgorithmicNumbers = async () => {
  // Get all active subscriber score values
  const activeUsers = await User.find({ 'subscription.status': 'active' }).select('_id');
  const activeIds = activeUsers.map(u => u._id);

  const allScoreDocs = await Score.find({ user: { $in: activeIds } });

  // Count frequency of each score value 1–45
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;

  allScoreDocs.forEach(doc => {
    doc.scores.forEach(s => {
      if (s.value >= 1 && s.value <= 45) freq[s.value]++;
    });
  });

  // Sort by frequency ascending (least used = more likely to be drawn)
  const sorted = Object.entries(freq)
    .sort((a, b) => a[1] - b[1])
    .map(([num]) => parseInt(num));

  // Weighted random from bottom 15
  const pool = sorted.slice(0, 15);
  const selected = new Set();
  while (selected.size < 5) {
    selected.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  return Array.from(selected).sort((a, b) => a - b);
};

/**
 * Calculate prize pool based on active subscribers + plan prices
 * Monthly = ₹999, Yearly = ₹9999/12 = £8.33/month
 * Prize pool = 50% of subscriptions, charity = 10%, platform = 40%
 */
const calculatePrizePool = async (jackpotRollover = 0) => {
  const users = await User.find({ 'subscription.status': 'active' });
  let total = 0;

  users.forEach(u => {
    const monthlyEquiv = u.subscription.plan === 'yearly' ? 833 : 999;
    total += monthlyEquiv * 0.5; // 50% to prize pool
  });

  total += jackpotRollover;

  return {
    total: parseFloat(total.toFixed(2)),
    fiveMatch: parseFloat((total * 0.40).toFixed(2)),
    fourMatch: parseFloat((total * 0.35).toFixed(2)),
    threeMatch: parseFloat((total * 0.25).toFixed(2)),
  };
};

/**
 * Find winners by comparing user scores against winning numbers
 * A user wins if ANY 3, 4, or all 5 of their scores match the winning numbers
 */
const findWinners = async (winningNumbers) => {
  const activeUsers = await User.find({ 'subscription.status': 'active' }).select('_id');
  const activeIds = activeUsers.map(u => u._id);
  const scoreDocs = await Score.find({ user: { $in: activeIds } });

  const winningSet = new Set(winningNumbers);

  const results = { fiveMatch: [], fourMatch: [], threeMatch: [] };

  scoreDocs.forEach(doc => {
    const userScores = doc.scores.map(s => s.value);
    const matches = userScores.filter(v => winningSet.has(v));
    const matchCount = matches.length;

    if (matchCount >= 5) {
      results.fiveMatch.push({ userId: doc.user, matchedNumbers: matches });
    } else if (matchCount === 4) {
      results.fourMatch.push({ userId: doc.user, matchedNumbers: matches });
    } else if (matchCount === 3) {
      results.threeMatch.push({ userId: doc.user, matchedNumbers: matches });
    }
  });

  return results;
};

/**
 * Calculate per-person prize (split equally among tier winners)
 */
const calculatePerPersonPrize = (poolAmount, winnersCount) => {
  if (winnersCount === 0) return 0;
  return parseFloat((poolAmount / winnersCount).toFixed(2));
};

/**
 * Run a full draw simulation (does NOT save to DB)
 */
const simulateDraw = async (drawType = 'random', existingJackpot = 0) => {
  const winningNumbers = drawType === 'algorithmic'
    ? await generateAlgorithmicNumbers()
    : generateRandomNumbers();

  const prizePool = await calculatePrizePool(existingJackpot);
  const winners = await findWinners(winningNumbers);

  const jackpotCarried = winners.fiveMatch.length === 0;

  return {
    winningNumbers,
    prizePool,
    winners,
    jackpotCarried,
    perPersonPrize: {
      fiveMatch: calculatePerPersonPrize(prizePool.fiveMatch, winners.fiveMatch.length),
      fourMatch: calculatePerPersonPrize(prizePool.fourMatch, winners.fourMatch.length),
      threeMatch: calculatePerPersonPrize(prizePool.threeMatch, winners.threeMatch.length),
    },
  };
};

/**
 * Execute and persist a draw to MongoDB
 */
const executeDraw = async (month, year, drawType = 'random') => {
  // Check if draw already exists
  const existing = await Draw.findOne({ month, year });
  if (existing && existing.status === 'published') {
    throw new Error('Draw for this month is already published');
  }

  // Get previous jackpot rollover if any
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDraw = await Draw.findOne({ month: prevMonth, year: prevYear });
  const jackpotRollover = (prevDraw?.jackpotCarriedForward) ? prevDraw.prizePool.fiveMatch : 0;

  const simulation = await simulateDraw(drawType, jackpotRollover);

  // Upsert draw document
  const draw = await Draw.findOneAndUpdate(
    { month, year },
    {
      month, year, drawType,
      status: 'published',
      winningNumbers: simulation.winningNumbers,
      prizePool: { ...simulation.prizePool, jackpotRollover },
      winners: {
        fiveMatch: simulation.winners.fiveMatch.map(w => w.userId),
        fourMatch: simulation.winners.fourMatch.map(w => w.userId),
        threeMatch: simulation.winners.threeMatch.map(w => w.userId),
      },
      jackpotCarriedForward: simulation.jackpotCarried,
      totalParticipants:
        simulation.winners.fiveMatch.length +
        simulation.winners.fourMatch.length +
        simulation.winners.threeMatch.length,
      publishedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Create Winner records
  const createWinnerRecords = async (winnerList, matchType, prizeAmount) => {
    for (const w of winnerList) {
      const alreadyExists = await Winner.findOne({ user: w.userId, draw: draw._id });
      if (!alreadyExists) {
        await Winner.create({
          user: w.userId,
          draw: draw._id,
          matchType,
          matchedNumbers: w.matchedNumbers,
          prizeAmount,
        });
      }
    }
  };

  await createWinnerRecords(simulation.winners.fiveMatch, 'five', simulation.perPersonPrize.fiveMatch);
  await createWinnerRecords(simulation.winners.fourMatch, 'four', simulation.perPersonPrize.fourMatch);
  await createWinnerRecords(simulation.winners.threeMatch, 'three', simulation.perPersonPrize.threeMatch);

  return { draw, simulation };
};

module.exports = {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  calculatePrizePool,
  findWinners,
  simulateDraw,
  executeDraw,
};
