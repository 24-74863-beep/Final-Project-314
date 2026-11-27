const router = require('express').Router();
const c = require('../controllers/partController');

router.post('/parts/:id/adjust', c.adjust);

module.exports = router;
