// CUSTOMER page: "My Payments" (what I still need to pay and my payment history)
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var VIEWS = UI.VIEWS,
      badge = UI.badge,
      esc = UI.esc,
      fmtDay = UI.fmtDay,
      moto = UI.moto,
      motoLabel = UI.motoLabel,
      peso = UI.peso,
      table = UI.table;

  // My Payments page: outstanding balances and payment history
  VIEWS.mypayments = function () {
    var mine = UI.myRepairs(), ids = mine.map(function (r) { return r.id; });
    var pays = DB.all('payments').filter(function (p) { return ids.indexOf(p.repairId) >= 0; })
      .sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; });
    var owing = mine.filter(function (r) { return Payments.totals(r).balance > 0; });
    var paid = pays.reduce(function (a, p) { return a + (+p.amount || 0); }, 0);
    var due = owing.reduce(function (a, r) { return a + Payments.totals(r).balance; }, 0);

    var toPay = owing.map(function (r) {
      return '<tr><td>#' + r.id + '</td><td>' + esc(motoLabel(moto(r.motorcycleId))) + '</td><td>' + badge(r.status) + '</td><td class="num"><b>' + peso(Payments.totals(r).balance) +
        '</b></td><td><button class="btn sm" onclick="App.viewRepair(' + r.id + ')">View</button></td></tr>';
    });
    var history = pays.map(function (p) {
      var r = DB.get('repairs', p.repairId);
      return '<tr><td>' + fmtDay(p.date) + '</td><td>#' + p.repairId + '</td><td>' + esc(motoLabel(moto(r.motorcycleId))) + '</td><td>' + esc(p.method) + '</td><td class="num">' + peso(p.amount) +
        '</td><td><button class="btn sm" onclick="App.receipt(' + p.id + ')">Receipt</button></td></tr>';
    });
    return '<p class="help">Here you can see what you still need to pay and the payments you already made. Payments are made in full at the shop.</p>' +
      '<div class="cards"><div class="stat green"><div class="n">' + peso(paid) + '</div><div class="l">Total paid</div></div>' +
      '<div class="stat red"><div class="n">' + peso(due) + '</div><div class="l">Still to pay</div></div></div>' +
      '<div class="panel"><h3>To pay</h3>' + table(['Job #', 'Motorcycle', 'Repair', 'num:Balance', ''], toPay, 'You have nothing to pay right now.') + '</div>' +
      '<div class="panel" style="margin-top:18px"><h3>My payments</h3>' + table(['Date', 'Job #', 'Motorcycle', 'Method', 'num:Amount', ''], history, 'No payments yet.') + '</div>';
  };
})();
