const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validate');
const ctrl = require('../controllers/auth.controller');

router.post('/signup',               authRateLimiter, validate(schemas.signup), ctrl.signup);
router.post('/login',                authRateLimiter, validate(schemas.login),  ctrl.login);
router.post('/google',               ctrl.googleOAuth);
router.post('/refresh',              ctrl.refreshToken);
router.post('/logout',               authenticate, ctrl.logout);
router.post('/forgot-password',      authRateLimiter, ctrl.forgotPassword);
router.post('/reset-password',       authenticate, ctrl.resetPassword);
router.post('/resend-verification',  authRateLimiter, ctrl.resendVerification);

module.exports = router;