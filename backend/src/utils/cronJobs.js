const cron = require('node-cron');
const { executeDraw } = require('../services/drawEngine');

const initCronJobs = () => {
  // Run draw on the 1st of every month at 00:00
  cron.schedule('0 0 1 * *', async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    console.log(`🎯 Auto-executing monthly draw for ${month}/${year}`);
    try {
      await executeDraw(month, year, 'random');
      console.log(`✅ Monthly draw for ${month}/${year} completed`);
    } catch (err) {
      console.error(`❌ Monthly draw failed:`, err.message);
    }
  });

  console.log('⏰ Cron jobs initialized');
};

module.exports = { initCronJobs };
