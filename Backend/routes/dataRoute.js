const router = require('express').Router();
const c = require('../controllers/dataController');

router.get('/version', c.version);
router.get('/data', c.all);
router.post('/import', c.importBackup);
router.post('/reset', c.reset);

module.exports = router;
