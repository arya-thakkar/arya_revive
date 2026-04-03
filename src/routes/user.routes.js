const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/user.controller');

router.use(authenticate);

router.get('/me', ctrl.getProfile);
router.patch('/me', ctrl.updateProfile);
router.delete('/me', ctrl.deleteAccount);

module.exports = router;
