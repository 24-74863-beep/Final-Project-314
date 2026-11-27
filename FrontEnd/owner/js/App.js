// OWNER app: menu, what data the owner can see, and the owner Dashboard.
// Loads after shared/ui/core.js. Customer code is in ../customer.
(function () {
  'use strict';

  var UI = window.UI;
  var VIEWS = UI.VIEWS,
      badge = UI.badge,
      esc = UI.esc,
      fmtDateCell = UI.fmtDateCell,
      me = UI.me,
      moto = UI.moto,
      motoLabel = UI.motoLabel,
      newestFirst = UI.newestFirst,
      peso = UI.peso,
      table = UI.table,
      todayStr = UI.todayStr,
      urgBadge = UI.urgBadge;

  // Owner menu
  UI.setNav([
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'repairs', label: 'Repairs' },
    { id: 'emergency', label: 'Emergency Services' },
    { id: 'customers', label: 'Customers' },
    { id: 'motorcycles', label: 'Motorcycles' },
    { id: 'mechanics', label: 'Mechanics' },
    { id: 'catalog', label: 'Services & Parts' },
    { id: 'payments', label: 'Payments' },
    { id: 'reports', label: 'Reports' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'backup', label: 'Backup & Data' }
  ]);

  // Data scoping: the owner sees everything.
  UI.myRepairs = function () { return DB.all('repairs'); };
  UI.myMotos = function () { return DB.all('motorcycles'); };
  UI.myEmergencies = function () { return DB.all('emergencies'); };

  // Owner Dashboard
  VIEWS.dashboard = function () {
    var reps = UI.myRepairs(), h = '';
    var active = reps.filter(function (r) { return r.status !== 'Completed'; });
    function stat(n, l, cls) { return '<div class="stat ' + (cls || '') + '"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }
    var hello = '<p style="margin:0 0 16px;color:var(--muted)">Welcome back, <b>' + esc(me.name) + '</b> <span class="role-pill">' + me.role + '</span></p>';

    var today = todayStr();
    var income = DB.all('payments').filter(function (p) { return p.date === today; }).reduce(function (a, p) { return a + (+p.amount || 0); }, 0);
    var unpaid = reps.reduce(function (a, r) { return a + Payments.totals(r).balance; }, 0);
    var pendingEm = DB.all('emergencies').filter(function (e) { return e.status === 'Pending'; }).length;
    var mechs = DB.all('mechanics'), freeMechs = mechs.filter(function (m) { return JobLimit.jobsOn(m.id, todayStr()) < JobLimit.MAX_JOBS_PER_DAY; });
    var newReq = reps.filter(UI.isNewRequest).length;
    h = hello + (newReq ? '<div class="callout"><div><b>' + newReq + '</b> new repair request' + (newReq > 1 ? 's' : '') + ' from customers to review.</div><button class="btn primary" onclick="App.go(\'repairs\')">Review requests</button></div>' : '') + '<div class="cards">' +
      stat(active.length, 'Active repairs') +
      stat(reps.filter(function (r) { return r.status === 'Waiting'; }).length, 'Waiting', 'blue') +
      stat(reps.filter(function (r) { return r.status === 'Ready for Pickup'; }).length, 'Ready for pickup', 'green') +
      stat(pendingEm, 'Pending emergencies', 'red') +
      stat(peso(income), "Today's income", 'green') +
      stat(peso(unpaid), 'Unpaid balances', 'red') +
      stat(freeMechs.length + ' / ' + mechs.length, 'Mechanics available today', 'blue') + '</div>';

    var recent = reps.slice().sort(newestFirst).slice(0, 6);
    h += '<div class="panel"><h3>Recent repair jobs</h3>' +
      table(['Job #', 'Date', 'Motorcycle', 'Problem', 'Status'], recent.map(function (r) {
        return '<tr><td>#' + r.id + '</td><td>' + fmtDateCell(r.createdAt) + '</td><td>' + esc(motoLabel(moto(r.motorcycleId))) + '</td><td>' +
          esc(r.problem) + '</td><td>' + badge(r.status) + '</td></tr>';
      }), 'No repair jobs yet.') + '</div>';

    var em = DB.all('emergencies').filter(function (e) { return e.status === 'Pending' || e.status === 'Dispatched'; }).sort(newestFirst).slice(0, 5);
    if (em.length) {
      h += '<div class="panel"><h3>Open emergency requests</h3>' + table(['#', 'Contact', 'Location', 'Problem', 'Urgency', 'Status'], em.map(function (e) {
        return '<tr><td>' + e.id + '</td><td>' + esc(e.contactName) + '<br><small>' + esc(e.phone) + '</small></td><td>' + esc(e.location) + '</td><td>' + esc(e.problem) + '</td><td>' + urgBadge(e.urgency) + '</td><td>' + badge(e.status) + '</td></tr>';
      })) + '</div>';
    }
    return h;
  };
})();
