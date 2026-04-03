const express = require('express');
const planRouter = express.Router();
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const planCtrl = require('../controllers/plan.controller');

planRouter.use(authenticate);
planRouter.post('/generate/:addictionId', aiRateLimiter, planCtrl.generatePlan);
planRouter.get('/:addictionId', planCtrl.getPlan);
planRouter.get('/:addictionId/day/:dayNumber', planCtrl.getPlanDay);

module.exports = planRouter;
