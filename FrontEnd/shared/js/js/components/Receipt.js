// Shared component: printable payment receipt (used by the owner Payments page and the customer My Payments page)
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var custName = UI.custName,
      esc = UI.esc,
      fmtDay = UI.fmtDay,
      me = UI.me,
      moto = UI.moto,
      motoLabel = UI.motoLabel,
      peso = UI.peso,
      toast = UI.toast;

  // Opens a printable receipt for a payment in a new window.
  function receipt(paymentId) {
    var p = DB.get('payments', paymentId), r = p && DB.get('repairs', p.repairId);
    if (!r) { toast('Payment not found.', true); return; }
    if (UI.role === 'customer' && r.customerId !== me.customerId) { toast('You can only print your own receipts.', true); return; }
    var shop = window.SHOP || { name: "Bobby's Motorcycle Repair", address: '' };
    var t = Payments.totals(r), c = DB.get('customers', r.customerId), m = moto(r.motorcycleId);
    var mech = r.mechanicId ? DB.get('mechanics', r.mechanicId) : null;

    var rows = [];
    (r.services || []).forEach(function (x) { rows.push([x.name, 1, +x.price || 0]); });
    (r.parts || []).forEach(function (x) { rows.push([x.name, +x.qty || 0, +x.price || 0]); });
    var items = rows.map(function (x) {
      return '<tr><td>' + esc(x[0]) + '</td><td class="n">' + x[1] + '</td><td class="n">' + peso(x[2]) + '</td><td class="n">' + peso(x[1] * x[2]) + '</td></tr>';
    }).join('');

    var no = String(p.id).padStart(6, '0');
    var info = [
      ['Date paid', fmtDay(p.date)],
      ['Job #', '#' + r.id],
      ['Customer', custName(r.customerId) + (c && c.phone ? ' · ' + c.phone : '')],
      ['Motorcycle', motoLabel(m)],
      ['Mechanic', mech ? mech.name : '—'],
      ['Paid by', p.method]
    ].map(function (x) { return '<div><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>'; }).join('');

    var css = 'body{font:14px/1.45 Arial,Helvetica,sans-serif;color:#111;margin:0;padding:24px;background:#f2f2f2}' +
      '.rc{max-width:420px;margin:0 auto;background:#fff;padding:22px 24px;border:1px solid #ddd}' +
      'h1{font-size:19px;margin:0;text-align:center}.sub{text-align:center;margin:2px 0 0;color:#555;font-size:12.5px}' +
      'h2{font-size:13px;letter-spacing:.12em;text-align:center;margin:14px 0 2px}.no{text-align:center;color:#555;font-size:12.5px;margin-bottom:12px}' +
      '.info div{display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-bottom:1px dotted #ccc}.info span{color:#555}.info b{text-align:right;font-weight:600}' +
      'table{width:100%;border-collapse:collapse;margin:14px 0 6px;font-size:13px}th{text-align:left;border-bottom:2px solid #111;padding:4px 0;font-size:12px}' +
      'td{padding:4px 0;border-bottom:1px solid #eee;vertical-align:top}.n{text-align:right;white-space:nowrap;padding-left:8px}' +
      '.tot div{display:flex;justify-content:space-between;padding:2px 0}.tot .big{font-size:17px;font-weight:700;border-top:2px solid #111;margin-top:4px;padding-top:6px}' +
      '.stamp{display:inline-block;border:2px solid #1a7f37;color:#1a7f37;font-weight:700;letter-spacing:.1em;padding:2px 10px;border-radius:4px;transform:rotate(-4deg)}' +
      '.note{margin-top:10px;color:#555;font-size:12.5px}.thanks{text-align:center;margin:16px 0 0;font-weight:600}' +
      '.bar{max-width:420px;margin:14px auto 0;display:flex;gap:10px;justify-content:center}.bar button{font:inherit;padding:8px 18px;border:1px solid #999;background:#fff;border-radius:6px;cursor:pointer}' +
      '@media print{body{background:#fff;padding:0}.rc{border:0;max-width:none}.bar{display:none}}';

    var html = '<!doctype html><html><head><meta charset="utf-8"><title>Receipt ' + no + '</title><style>' + css + '</style></head>' +
      '<body onload="window.print()"><div class="rc">' +
      '<h1>' + esc(shop.name) + '</h1><p class="sub">' + esc([shop.address, shop.phone].filter(Boolean).join(' · ')) + '</p>' +
      '<h2>PAYMENT RECEIPT</h2><div class="no">Receipt No. ' + no + '</div>' +
      '<div class="info">' + info + '</div>' +
      '<table><tr><th>Description</th><th class="n">Qty</th><th class="n">Price</th><th class="n">Amount</th></tr>' + items + '</table>' +
      '<div class="tot"><div><span>Job total</span><span>' + peso(t.total) + '</span></div>' +
      '<div class="big"><span>Amount paid</span><span>' + peso(p.amount) + '</span></div>' +
      '<div><span>Balance</span><span>' + peso(t.balance) + '</span></div></div>' +
      (p.note ? '<div class="note">Note: ' + esc(p.note) + '</div>' : '') +
      (t.balance <= 0 ? '<p style="text-align:center;margin:14px 0 0"><span class="stamp">PAID IN FULL</span></p>' : '') +
      '<p class="thanks">Thank you for your business!</p></div>' +
      '<div class="bar"><button onclick="window.print()">Print</button><button onclick="window.close()">Close</button></div></body></html>';

    var w = window.open('', '_blank', 'width=520,height=760');
    if (!w) { toast('Please allow pop-ups for this site to print the receipt.', true); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  App.receipt = receipt;
})();
