const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/dashboard.controller');

router.use(authenticate);
router.get('/', ctrl.getDashboard);
router.get('/stats/weekly', ctrl.getWeeklyStats);

module.exports = router;
