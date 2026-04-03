const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const ctrl = require('../controllers/journal.controller');

router.use(authenticate);
router.get('/', ctrl.getEntries);
router.post('/', validate(schemas.journalEntry), ctrl.createEntry);
router.patch('/:id', ctrl.updateEntry);
router.delete('/:id', ctrl.deleteEntry);

module.exports = router;
