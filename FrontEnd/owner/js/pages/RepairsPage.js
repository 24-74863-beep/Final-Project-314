// OWNER page: repairs list, repair job form with service and part lines
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var $ = UI.$,
      $$ = UI.$$,
      STATUSES = UI.STATUSES,
      TBL = UI.TBL,
      VIEWS = UI.VIEWS,
      badge = UI.badge,
      confirmBox = UI.confirmBox,
      cust = UI.cust,
      custName = UI.custName,
      esc = UI.esc,
      fil = UI.fil,
      fmtDate = UI.fmtDate,
      fmtDateCell = UI.fmtDateCell,
      fmtDay = UI.fmtDay,
      fmtTime = UI.fmtTime,
      matches = UI.matches,
      mechName = UI.mechName,
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
  function mechOptions() { return UI.mechOptions.apply(null, arguments); }
  function partStockOptions() { return UI.partStockOptions.apply(null, arguments); }

  function repairsFiltered() {
    var f = fil(UI.view());
    return UI.myRepairs().filter(function (r) {
      var m = moto(r.motorcycleId);
      if (f.s && r.status !== f.s) return false;
      return matches(f.q, [r.id, custName(r.customerId), m ? m.plate + m.brand + m.model : '', r.problem, mechName(r.mechanicId)]);
    }).sort(newestFirst);
  }
  TBL.repairs = function () {
    var rows = repairsFiltered().map(function (r) {
      var t = Payments.totals(r), m = moto(r.motorcycleId);
      var statusCell = '<select class="status-sel" onchange="App.setStatus(' + r.id + ',this.value)">' + opts(STATUSES, r.status) + '</select>';
      var acts = '<button class="btn sm" onclick="App.viewRepair(' + r.id + ')">View</button>' +
        '<button class="btn sm" onclick="App.repairForm(' + r.id + ')">Edit</button>' +
        '<button class="btn sm danger" onclick="App.delRepair(' + r.id + ')">Delete</button>';
      return '<tr><td>#' + r.id + '</td><td>' + fmtDateCell(r.createdAt) + '</td>' +
        '<td>' + esc(custName(r.customerId)) + '</td>' +
        '<td>' + esc(motoLabel(m)) + '</td><td>' + (r.requested ? '<span class="badge skill">Requested online</span> ' : '') + esc(r.problem) + '</td>' +
        '<td>' + esc(mechName(r.mechanicId)) + '</td><td>' + statusCell + '</td>' +
        '<td class="num">' + peso(t.total) + '</td><td>' + badge(t.status) + '</td><td>' + acts + '</td></tr>';
    });
    return table(['Job #', 'Date', 'Customer', 'Motorcycle', 'Problem', 'Mechanic', 'Status', 'num:Total', 'Payment', 'Actions'], rows, 'No repair jobs found.');
  };
  VIEWS.repairs = function () {
    var f = fil(UI.view());
    return '<div class="toolbar">' + searchBox(UI.view(), 'Search job #, customer, plate, problem…') +
      '<select onchange="App.filter(\'' + UI.view() + '\',\'s\',this.value)"><option value="">All statuses</option>' +
      STATUSES.map(function (s) { return '<option' + (f.s === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
      '<button class="btn primary" onclick="App.repairForm()">+ New repair job</button>' +
      '</div><div id="tbl">' + TBL.repairs() + '</div>';
  };

  function setStatus(id, status) {
    Repairs.setStatus(id, status);
    toast('Job #' + id + ' marked "' + status + '".');
    refresh();
  }

  function viewRepair(id) {
    var r = DB.get('repairs', id); if (!r) return;
    var t = Payments.totals(r), m = moto(r.motorcycleId), c = cust(r.customerId);
    var pays = DB.all('payments').filter(function (p) { return p.repairId === id; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var body = '<div class="kv"><span>Job #</span><b>' + r.id + (r.isEmergency ? ' <span class="sos">Emergency</span>' : '') + '</b>' +
      '<span>Date received</span><span>' + fmtDate(r.createdAt) + '</span>' +
      '<span>Customer</span><span>' + esc(c ? c.name + (c.phone ? ' · ' + c.phone : '') : '—') + '</span>' +
      '<span>Motorcycle</span><span>' + esc(motoLabel(m)) + (m ? ' · ' + esc(m.type) : '') + '</span>' +
      '<span>Problem</span><span>' + esc(r.problem) + '</span>' +
      (r.requested ? '<span>Request</span><span>Requested online' + (r.preferredDate ? ' · wants to bring it on ' + fmtDay(r.preferredDate) : '') + '</span>' : '') +
      '<span>Mechanic</span><span>' + esc(mechName(r.mechanicId)) + '</span>' +
      '<span>Status</span><span>' + badge(r.status) + '</span>' +
      (r.notes ? '<span>Notes</span><span>' + esc(r.notes) + '</span>' : '') + '</div>';
    body += '<h3 style="margin:14px 0 6px">Services performed</h3>' + (r.services.length
      ? table(['Service', 'num:Price'], r.services.map(function (s) { return '<tr><td>' + esc(s.name) + '</td><td class="num">' + peso(s.price) + '</td></tr>'; }))
      : '<p class="hint">None recorded yet.</p>');
    body += '<h3 style="margin:14px 0 6px">Parts used</h3>' + (r.parts.length
      ? table(['Part', 'num:Qty', 'num:Unit price', 'num:Amount'], r.parts.map(function (p) { return '<tr><td>' + esc(p.name) + '</td><td class="num">' + p.qty + '</td><td class="num">' + peso(p.price) + '</td><td class="num">' + peso(p.qty * p.price) + '</td></tr>'; }))
      : '<p class="hint">None recorded yet.</p>');
    body += '<div class="totalbox">Total: ' + peso(t.total) + '<br><small style="font-weight:600">Paid: ' + peso(t.paid) + ' · Balance: ' + peso(t.balance) + ' ' + badge(t.status) + '</small></div>';
    body += '<h3 style="margin:14px 0 6px">Payments</h3>' + (pays.length
      ? table(['Date', 'Method', 'num:Amount', 'Note'], pays.map(function (p) { return '<tr><td>' + fmtDay(p.date) + ' ' + fmtTime(p.createdAt) + '</td><td>' + esc(p.method) + '</td><td class="num">' + peso(p.amount) + '</td><td>' + esc(p.note) + '</td></tr>'; }))
      : '<p class="hint">No payments recorded.</p>');
    if (t.balance > 0) body += '<p><button type="button" class="btn primary" onclick="App.payForm(' + id + ')">Record full payment</button></p>';
    modal('Repair Job #' + id, body, { wide: true, hideSave: true });
  }

  // Repair job form
  function svcRow(s) {
    s = s || {};
    return '<div class="line"><input name="sname" list="svcList" placeholder="Service (pick or type)" value="' + esc(s.name || '') + '" oninput="App.svcPick(this)">' +
      '<input type="number" name="sprice" min="0" step="0.01" placeholder="Price" value="' + (s.price == null ? '' : s.price) + '" oninput="App.calc()">' +
      '<button type="button" class="btn sm danger" onclick="App.rmRow(this)">Remove</button></div>';
  }
  function partRow(p) {
    p = p || {};
    var other = !p.partId && !!p.name;           // a previously saved custom ("Other") part
    var o = '<option value="">— select part —</option>' + partStockOptions(p.partId) +
      '<option value="other"' + (other ? ' selected' : '') + '>Other (custom part)</option>';
    return '<div class="line"><select name="ppart" onchange="App.partPick(this)">' + o + '</select>' +
      '<input class="pname" name="pname" placeholder="Type the part name" value="' + esc(other ? p.name : '') + '"' + (other ? '' : ' style="display:none"') + '>' +
      '<input class="qty" type="number" name="pqty" min="1" step="1" placeholder="Qty" value="' + (p.qty || 1) + '" oninput="App.calc()">' +
      '<input type="number" name="pprice" min="0" step="0.01" placeholder="Unit price" value="' + (p.price == null ? '' : p.price) + '" oninput="App.calc()">' +
      '<button type="button" class="btn sm danger" onclick="App.rmRow(this)">Remove</button></div>';
  }

  function repairForm(id, pre) {
    var r = id ? DB.get('repairs', id) : null;
    pre = pre || {};
    var src = r || { motorcycleId: pre.motorcycleId, problem: pre.problem || '', mechanicId: pre.mechanicId || null, status: 'Waiting', isEmergency: !!pre.isEmergency, services: [], parts: [], notes: '' };
    var motos = DB.all('motorcycles');
    if (!motos.length) { toast('Add a motorcycle first (Motorcycles page).', true); return; }
    var jobDay = r ? DB.dayOf(r.createdAt) : todayStr();
    var body =
      '<div class="field"><label>Motorcycle *</label><select name="motorcycleId" required><option value="">— select —</option>' +
      motos.map(function (m) { return '<option value="' + m.id + '"' + (m.id === src.motorcycleId ? ' selected' : '') + '>' + esc(motoLabel(m) + ' — ' + custName(m.customerId)) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>Problem / complaint *</label><textarea name="problem" required>' + esc(src.problem) + '</textarea></div>' +
      '<div class="grid2"><div class="field"><label>Assigned mechanic</label><select name="mechanicId">' +
      mechOptions(src.mechanicId, jobDay, r ? r.id : null) + '</select><div class="hint">Limit: ' + JobLimit.MAX_JOBS_PER_DAY + ' jobs per mechanic per day (' + fmtDay(jobDay) + ').</div></div>' +
      '<div class="field"><label>Status</label><select name="status">' + opts(STATUSES, src.status) + '</select></div></div>' +
      '<datalist id="svcList">' + DB.all('services').map(function (s) { return '<option value="' + esc(s.name) + '">'; }).join('') + '</datalist>' +
      '<div class="subhead">Services performed <button type="button" class="btn sm" onclick="App.addSvc()">+ Add service</button></div><div id="svcRows">' + src.services.map(svcRow).join('') + '</div>' +
      '<div class="subhead">Parts used <button type="button" class="btn sm" onclick="App.addPart()">+ Add part</button></div><div id="partRows">' + src.parts.map(partRow).join('') + '</div>' +
      '<div class="totalbox">Total cost: <span id="calcTotal">' + peso(0) + '</span></div>' +
      '<div class="field" style="margin-top:12px"><label>Notes</label><textarea name="notes">' + esc(src.notes || '') + '</textarea></div>';
    modal(r ? 'Edit Repair Job #' + r.id : 'New Repair Job', body, {
      wide: true,
      onSave: function (form) {
        var services = $$('#svcRows .line', form).map(function (row) {
          return { name: $('[name=sname]', row).value, price: $('[name=sprice]', row).value };
        });
        var parts = $$('#partRows .line', form).map(function (row) {
          var sel = $('[name=ppart]', row).value;
          return { other: sel === 'other', partId: sel, name: $('[name=pname]', row).value, qty: $('[name=pqty]', row).value, price: $('[name=pprice]', row).value };
        });
        var res = Repairs.save(r ? r.id : null, {
          motorcycleId: form.elements.motorcycleId.value, problem: val(form, 'problem'),
          mechanicId: form.elements.mechanicId.value, status: form.elements.status.value, isEmergency: !!src.isEmergency,
          services: services, parts: parts, notes: val(form, 'notes')
        }, { emergencyId: pre.emergencyId });
        toast(res.created ? 'Repair job #' + res.repair.id + ' created.' : 'Repair job updated.');
        setTimeout(refresh, 0);
      }
    });
    setTimeout(calc, 0);
  }

  function calc() {
    var f = $('#mform'); if (!f || !$('#calcTotal')) return;
    var s = $$('#svcRows .line', f).reduce(function (a, row) { return a + (+$('[name=sprice]', row).value || 0); }, 0);
    var p = $$('#partRows .line', f).reduce(function (a, row) { return a + (+$('[name=pqty]', row).value || 0) * (+$('[name=pprice]', row).value || 0); }, 0);
    $('#calcTotal').textContent = peso(s + p);
  }

  function delRepair(id) {
    if (!confirmBox('Delete repair job #' + id + ' and its payment records? Parts used will be returned to stock.')) return;
    Repairs.remove(id);
    toast('Repair job deleted.'); refresh();
  }

  App.setStatus = setStatus; App.viewRepair = viewRepair; App.repairForm = repairForm; App.delRepair = delRepair;
  App.addSvc = function () { $('#svcRows').insertAdjacentHTML('beforeend', svcRow()); };
  App.addPart = function () { $('#partRows').insertAdjacentHTML('beforeend', partRow()); calc(); };
  App.rmRow = function (b) { b.parentNode.remove(); calc(); };
  App.calc = calc;
  App.svcPick = function (inp) {
    var s = DB.all('services').filter(function (x) { return x.name === inp.value; })[0];
    if (s) { var price = inp.parentNode.querySelector('[name=sprice]'); if (!price.value) price.value = s.price; calc(); }
  };
  App.partPick = function (sel) {
    var p = DB.get('parts', sel.value), price = sel.parentNode.querySelector('[name=pprice]'), nm = sel.parentNode.querySelector('[name=pname]');
    var other = sel.value === 'other';
    nm.style.display = other ? '' : 'none';
    if (other) { nm.focus(); } else { nm.value = ''; }
    if (p) price.value = p.price; calc();
  };
  UI.repairForm = repairForm;
})();
