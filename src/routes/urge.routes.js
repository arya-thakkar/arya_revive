const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const ctrl = require('../controllers/urge.controller');

router.use(authenticate);
router.get('/', ctrl.getUrges);
router.post('/', validate(schemas.urgeLog), ctrl.logUrge);

module.exports = router;
