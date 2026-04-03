function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function daysBetween(date1, date2 = new Date()) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

function formatSavings(dailySpend, streakDays) {
  const total = (dailySpend * streakDays).toFixed(2);
  return `$${total} saved in ${streakDays} day${streakDays !== 1 ? 's' : ''}`;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

module.exports = { asyncHandler, daysBetween, formatSavings, getTimeOfDay };
