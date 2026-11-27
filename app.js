// Bobby's Repair System: Express app. Serves the API under /api and the frontend files.
const path = require('path');
const express = require('express');
const { init, DB_NAME } = require('./backend/config/db');
const { seedIfEmpty } = require('./backend/services/seedService');
const revision = require('./backend/middleware/revision');
const dataRoute = require('./backend/routes/dataRoute');
const partRoute = require('./backend/routes/partRoute');
const recordRoute = require('./backend/routes/recordRoute');

const FRONTEND = path.join(__dirname, 'frontend');
const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(revision.middleware);

// API (specific routes first, generic /:table routes last)
app.use('/api', dataRoute);
app.use('/api', partRoute);
app.use('/api', recordRoute);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Frontend. Dotfiles and package files are never served.
app.use((req, res, next) => {
  const p = decodeURIComponent(req.path).toLowerCase();
  if (/(^|\/)\.|package(-lock)?\.json$|\.sql$/.test(p)) return res.status(404).end();
  next();
});
app.use(express.static(FRONTEND, { index: 'index.html', dotfiles: 'deny' }));

(async function start() {
  try {
    await init();
    if (await seedIfEmpty()) console.log('Empty database: created the default owner account (owner / owner123).');
    const port = +process.env.PORT || 3000;
    app.listen(port, () => console.log('Bobby\'s Repair System running at http://localhost:' + port + '  (database: ' + DB_NAME + ')'));
  } catch (e) {
    console.error('\nCould not start. Is MySQL running and is .env correct?\n' + (e && e.message || e));
    process.exit(1);
  }
})();

module.exports = app;
