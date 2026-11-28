// OWNER page: payments list and the "Pay in full" form
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var METHODS = UI.METHODS,
      TBL = UI.TBL,
      VIEWS = UI.VIEWS,
      badge = UI.badge,
      confirmBox = UI.confirmBox,
      custName = UI.custName,
      esc = UI.esc,
      fil = UI.fil,
      fmtDateCell = UI.fmtDateCell,
      fmtDay = UI.fmtDay,
      fmtTime = UI.fmtTime,
      matches = UI.matches,
      modal = UI.modal,
      moto = UI.moto,
      motoLabel = UI.motoLabel,
      newestFirst = UI.newestFirst,
      opts = UI.opts,
      peso = UI.peso,
      refresh = UI.refresh,
      searchBox = UI.searchBox,
      table = UI.table,
      toast = UI.toast,
      todayStr = UI.todayStr,
      val = UI.val;

  // Payments page (owner only)
  TBL.payments = function () {
    var f = fil('payments');
    var rows = DB.all('repairs').filter(function (r) {
      var t = Payments.totals(r);
      if (f.s === 'Unpaid' && t.status !== 'Unpaid') return false;
      if (f.s === 'Paid' && t.status !== 'Paid') return false;
      return matches(f.q, [r.id, custName(r.customerId), motoLabel(moto(r.motorcycleId))]);
    }).sort(newestFirst).map(function (r) {
      var t = Payments.totals(r), last = lastPayment(r.id);
      return '<tr><td>#' + r.id + '</td><td>' + fmtDateCell(r.createdAt) + '</td><td>' + esc(custName(r.customerId)) + '</td><td>' + esc(motoLabel(moto(r.motorcycleId))) +
        '</td><td>' + badge(r.status) + '</td><td class="num">' + peso(t.total) + '</td><td class="num">' + peso(t.paid) + '</td><td class="num"><b>' + peso(t.balance) + '</b></td><td>' + badge(t.status) +
        '</td><td><button class="btn sm" onclick="App.viewRepair(' + r.id + ')">View</button>' + (t.balance > 0 ? '<button class="btn sm primary" onclick="App.payForm(' + r.id + ')">Pay in full</button>' : '') +
        (last ? '<button class="btn sm" onclick="App.receipt(' + last.id + ')">Receipt</button>' : '') + '</td></tr>';
    });
    return table(['Job #', 'Date', 'Customer', 'Motorcycle', 'Repair', 'num:Total', 'num:Paid', 'num:Balance', 'Payment', 'Actions'], rows, 'No repair jobs found.');
  };
  VIEWS.payments = function () {
    var f = fil('payments');
    var all = DB.all('repairs').map(Payments.totals);
    var billed = all.reduce(function (a, t) { return a + t.total; }, 0), paid = all.reduce(function (a, t) { return a + t.paid; }, 0);
    var pays = DB.all('payments').sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; }).slice(0, 10);
    return '<div class="cards"><div class="stat"><div class="n">' + peso(billed) + '</div><div class="l">Total billed</div></div>' +
      '<div class="stat green"><div class="n">' + peso(paid) + '</div><div class="l">Total collected</div></div>' +
      '<div class="stat red"><div class="n">' + peso(billed - paid) + '</div><div class="l">Outstanding</div></div></div>' +
      '<div class="toolbar">' + searchBox('payments', 'Search job #, customer, motorcycle…') +
      '<select onchange="App.filter(\'payments\',\'s\',this.value)"><option value="">All payment statuses</option>' + ['Unpaid', 'Paid'].map(function (s) { return '<option' + (f.s === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
      '<div id="tbl">' + TBL.payments() + '</div>' +
      '<div class="panel" style="margin-top:18px"><h3>Latest payments</h3>' + table(['Date', 'Job #', 'Customer', 'Method', 'num:Amount', 'Note', ''], pays.map(function (p) {
        var r = DB.get('repairs', p.repairId);
        return '<tr><td>' + fmtDay(p.date) + '<br><small>' + fmtTime(p.createdAt) + '</small></td><td>#' + p.repairId + '</td><td>' + esc(r ? custName(r.customerId) : '—') + '</td><td>' + esc(p.method) + '</td><td class="num">' + peso(p.amount) + '</td><td>' + esc(p.note) +
          '</td><td><button class="btn sm" onclick="App.receipt(' + p.id + ')">Receipt</button><button class="btn sm danger" onclick="App.delPay(' + p.id + ')">Void</button></td></tr>';
      }), 'No payments recorded yet.') + '</div>';
  };
  function payForm(id) {
    var r = DB.get('repairs', id), t = Payments.totals(r);
    if (t.total <= 0) { toast('This job has no charges yet. Add services/parts first.', true); return; }
    modal('Full payment – Job #' + id,
      '<div class="kv"><span>Customer</span><span>' + esc(custName(r.customerId)) + '</span><span>Total</span><span>' + peso(t.total) + '</span><span>Already paid</span><span>' + peso(t.paid) + '</span><span>Balance</span><b>' + peso(t.balance) + '</b></div>' +
      '<p class="hint" style="margin:0 0 10px">Payment must be made in full. The amount cannot be changed.</p>' +
      '<div class="grid2"><div class="field"><label>Amount to pay (₱)</label><input name="amount" type="number" readonly value="' + t.balance.toFixed(2) + '"></div>' +
      '<div class="field"><label>Method</label><select name="method">' + opts(METHODS, 'Cash') + '</select></div></div>' +
      '<div class="grid2"><div class="field"><label>Date</label><input name="date" type="date" required value="' + todayStr() + '"></div>' +
      '<div class="field"><label>Note</label><input name="note"></div></div>', {
      saveLabel: 'Confirm full payment',
      onSave: function (f) {
        var amt = Payments.payInFull(id, { method: f.elements.method.value, date: f.elements.date.value, note: val(f, 'note') });
        toast('Paid in full: ' + peso(amt) + '.'); setTimeout(refresh, 0);
      }
    });
  }
  // The most recent payment for a repair job, or null if there is none.
  function lastPayment(repairId) {
    var list = DB.all('payments').filter(function (x) { return x.repairId === repairId; });
    return list.length ? list[list.length - 1] : null;
  }

  function delPay(id) { if (!confirmBox('Void this payment record?')) return; Payments.voidPayment(id); toast('Payment voided.'); refresh(); }

  App.payForm = payForm; App.delPay = delPay;
})();
