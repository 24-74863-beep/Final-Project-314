// Service: job totals, full payment only, void payment
(function (global) {
  'use strict';

  var Payments = {
    // Payment summary for a repair job.
    totals: function (r) {
      var s = (r.services || []).reduce(function (a, x) { return a + (+x.price || 0); }, 0);
      var p = (r.parts || []).reduce(function (a, x) { return a + (+x.qty || 0) * (+x.price || 0); }, 0);
      var paid = DB.all('payments').filter(function (x) { return x.repairId === r.id; })
        .reduce(function (a, x) { return a + (+x.amount || 0); }, 0);
      var total = s + p;
      var status = total === 0 ? 'No charge' : (paid >= total - 0.004 ? 'Paid' : 'Unpaid');   // payments are always made in full
      return { services: s, parts: p, total: total, paid: paid, balance: Math.max(0, total - paid), status: status };
    },
    // The amount is always the full balance; any value sent by the client is ignored.
    payInFull: function (repairId, f) {
      var r = DB.get('repairs', repairId);
      if (!r) throw new Error('Repair job not found.');
      var amt = Math.round(Payments.totals(r).balance * 100) / 100;
      if (!(amt > 0)) throw new Error('This job is already fully paid.');
      DB.insert('payments', { repairId: repairId, amount: amt, method: f.method, date: f.date, note: String(f.note || '').trim() });
      return amt;
    },
    voidPayment: function (id) { DB.remove('payments', id); }
  };

  global.Payments = Payments;
})(window);
