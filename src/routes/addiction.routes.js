const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const ctrl = require('../controllers/addiction.controller');

router.use(authenticate);

router.get('/', ctrl.getAddictions);
router.post('/', validate(schemas.createAddiction), ctrl.createAddiction);
router.get('/:id', ctrl.getAddiction);
router.patch('/:id', ctrl.updateAddiction);
router.delete('/:id', ctrl.deleteAddiction);
router.post('/:id/relapse', ctrl.logRelapse);

module.exports = router;
