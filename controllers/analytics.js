const Analytics = require('../models/analytics');

exports.getAnalytics = (req, res) => {
  Analytics.fetchTodayStats((err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(stats);
  });
};
