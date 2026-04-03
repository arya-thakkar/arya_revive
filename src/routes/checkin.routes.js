const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const ctrl = require('../controllers/checkin.controller');

router.use(authenticate);
router.get('/', ctrl.getCheckins);
router.post('/', validate(schemas.checkin), ctrl.createCheckin);

module.exports = router;
