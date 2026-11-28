// Service: builds the rows and totals of each report for a date range
(function (global) {
  'use strict';

  var EM_STATUSES = ['Pending', 'Dispatched', 'Resolved', 'Cancelled'];
  function cname(id) { var c = DB.get('customers', id); return c ? c.name : '—'; }
  function mname(id) { var m = DB.get('mechanics', id); return m ? m.name : '—'; }
  function mlabel(id) { var m = DB.get('motorcycles', id); return m ? m.brand + ' ' + m.model + ' (' + m.plate + ')' : '—'; }
  function newest(a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); }
  function col(name, kind) { return { name: name, kind: kind || 'text' }; }          // kind: text, money, datetime, day or time

  var Reports = {
    TYPES: ['repairs', 'services', 'payments', 'emergency'],

    // Returns { cols: [{ name, kind }], rows: [[raw values]], sum: [{ label, value, kind }] }.
  // from and to are YYYY-MM-DD, or '' for no limit.
    collect: function (type, from, to) {
      function inRange(iso) { var d = iso.length > 10 ? DB.dayOf(iso) : iso; return (!from || d >= from) && (!to || d <= to); }
      var cols, rows, sum;
      if (type === 'repairs') {
        var rs = DB.all('repairs').filter(function (r) { return inRange(r.createdAt); }).sort(newest);
        var billed = 0, paid = 0;
        cols = [col('Job #'), col('Date', 'datetime'), col('Customer'), col('Motorcycle'), col('Problem'), col('Mechanic'), col('Status'), col('Total', 'money'), col('Paid', 'money'), col('Balance', 'money')];
        rows = rs.map(function (r) {
          var t = Payments.totals(r); billed += t.total; paid += t.paid;
          return [r.id, r.createdAt, cname(r.customerId), mlabel(r.motorcycleId), r.problem, mname(r.mechanicId), r.status, t.total, t.paid, t.balance];
        });
        sum = [{ label: 'Jobs', value: rs.length }, { label: 'Completed', value: rs.filter(function (r) { return r.status === 'Completed'; }).length },
          { label: 'Total billed', value: billed, kind: 'money' }, { label: 'Collected', value: paid, kind: 'money' }];
      } else if (type === 'services') {
        var agg = {};
        DB.all('repairs').filter(function (r) { return inRange(r.createdAt); }).forEach(function (r) {
          r.services.forEach(function (s) { var a = agg[s.name] || (agg[s.name] = { n: 0, amt: 0 }); a.n++; a.amt += +s.price || 0; });
        });
        var names = Object.keys(agg).sort(function (a, b) { return agg[b].n - agg[a].n; });
        cols = [col('Service'), col('Times performed'), col('Revenue', 'money')];
        rows = names.map(function (n) { return [n, agg[n].n, agg[n].amt]; });
        sum = [{ label: 'Service types', value: names.length },
          { label: 'Total services done', value: names.reduce(function (a, n) { return a + agg[n].n; }, 0) },
          { label: 'Service revenue', value: names.reduce(function (a, n) { return a + agg[n].amt; }, 0), kind: 'money' }];
      } else if (type === 'payments') {
        var ps = DB.all('payments').filter(function (p) { return inRange(p.date); }).sort(function (a, b) { return b.date.localeCompare(a.date); });
        var tot = 0;
        cols = [col('Date', 'day'), col('Time', 'time'), col('Job #'), col('Customer'), col('Method'), col('Amount', 'money'), col('Note')];
        rows = ps.map(function (p) {
          tot += +p.amount; var r = DB.get('repairs', p.repairId);
          return [p.date, p.createdAt, p.repairId, r ? cname(r.customerId) : '—', p.method, +p.amount, p.note || ''];
        });
        var byM = {}; ps.forEach(function (p) { byM[p.method] = (byM[p.method] || 0) + (+p.amount); });
        sum = [{ label: 'Payments', value: ps.length }, { label: 'Total collected', value: tot, kind: 'money' }]
          .concat(Object.keys(byM).map(function (k) { return { label: k, value: byM[k], kind: 'money' }; }));
      } else {
        var es = DB.all('emergencies').filter(function (e) { return inRange(e.createdAt); }).sort(newest);
        cols = [col('#'), col('Date', 'datetime'), col('Contact'), col('Phone'), col('Location'), col('Problem'), col('Urgency'), col('Status'), col('Mechanic')];
        rows = es.map(function (e) { return [e.id, e.createdAt, e.contactName, e.phone, e.location, e.problem, e.urgency, e.status, mname(e.mechanicId)]; });
        sum = [{ label: 'Requests', value: es.length }].concat(EM_STATUSES.map(function (s) { return { label: s, value: es.filter(function (e) { return e.status === s; }).length }; }));
      }
      return { cols: cols, rows: rows, sum: sum };
    }
  };

  global.Reports = Reports;
})(window);
