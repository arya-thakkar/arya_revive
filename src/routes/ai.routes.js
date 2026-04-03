const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/ai.controller');

router.use(authenticate);
router.use(aiRateLimiter);

router.get('/daily-motivation/:addictionId', ctrl.getDailyMotivation);
router.post('/chat', ctrl.chat);
router.post('/journal-reflection', ctrl.journalReflection);

module.exports = router;
