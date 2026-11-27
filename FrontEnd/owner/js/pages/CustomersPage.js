// OWNER page: customers list and customer repair history
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var PHONE_ATTR = UI.PHONE_ATTR,
      TBL = UI.TBL,
      VIEWS = UI.VIEWS,
      badge = UI.badge,
      confirmBox = UI.confirmBox,
      cust = UI.cust,
      esc = UI.esc,
      fil = UI.fil,
      fmtDate = UI.fmtDate,
      fmtDateCell = UI.fmtDateCell,
      matches = UI.matches,
      modal = UI.modal,
      moto = UI.moto,
      motoLabel = UI.motoLabel,
      newestFirst = UI.newestFirst,
      peso = UI.peso,
      phoneVal = UI.phoneVal,
      refresh = UI.refresh,
      searchBox = UI.searchBox,
      table = UI.table,
      toast = UI.toast,
      userOf = UI.userOf,
      val = UI.val;

  // Customers
  TBL.customers = function () {
    var f = fil('customers');
    var rows = DB.all('customers').filter(function (c) {
      return matches(f.q, [c.name, c.phone, c.address, c.email]);
    }).sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (c) {
      var u = c.userId ? userOf(c.userId) : null;
      var n = DB.all('motorcycles').filter(function (m) { return m.customerId === c.id; }).length;
      return '<tr><td><b>' + esc(c.name) + '</b></td><td>' + esc(c.phone) + '</td><td>' + esc(c.address) + '</td><td>' + esc(c.email) +
        '</td><td>' + (u ? esc(u.username) : '<small>Walk-in</small>') + '</td><td class="num">' + n + '</td><td>' +
        '<button class="btn sm" onclick="App.custHistory(' + c.id + ')">History</button>' +
        '<button class="btn sm" onclick="App.custForm(' + c.id + ')">Edit</button>' +
        '<button class="btn sm danger" onclick="App.delCust(' + c.id + ')">Delete</button>' + '</td></tr>';
    });
    return table(['Name', 'Phone', 'Address', 'Email', 'Account', 'num:Motorcycles', 'Actions'], rows, 'No customers found.');
  };
  VIEWS.customers = function () {
    return '<div class="toolbar">' + searchBox('customers', 'Search name, phone, address…') +
      '<button class="btn primary" onclick="App.custForm()">+ Add customer</button></div><div id="tbl">' + TBL.customers() + '</div>';
  };
  function custForm(id) {
    var c = id ? cust(id) : { name: '', phone: '', address: '', email: '' };
    modal(id ? 'Edit Customer' : 'Add Customer',
      '<div class="field"><label>Full name *</label><input name="name" required value="' + esc(c.name) + '"></div>' +
      '<div class="grid2"><div class="field"><label>Mobile number <span class="opt">(11 digits)</span></label><input name="phone"' + PHONE_ATTR + ' value="' + esc(phoneVal(c.phone)) + '"></div>' +
      '<div class="field"><label>Email</label><input name="email" type="email" value="' + esc(c.email) + '"></div></div>' +
      '<div class="field"><label>Address</label><input name="address" value="' + esc(c.address) + '"></div>' +
      (id ? '' : '<p class="hint">Walk-in customers do not need a login. Create an account for them in Accounts if they want online access.</p>' +
        '<h4 style="margin:14px 0 6px">Motorcycle <span class="opt">(optional – fill this in to add the first motorcycle now)</span></h4>' + UI.motoFields({}, false)), {
      onSave: function (f) {
        var data = { name: val(f, 'name'), phone: val(f, 'phone'), email: val(f, 'email'), address: val(f, 'address') };
        if (id) { Customers.save(id, data); toast('Customer saved.'); }
        else { var withMoto = Customers.saveWithMotorcycle(data, UI.readMoto(f)); toast(withMoto ? 'Customer and motorcycle saved.' : 'Customer saved.'); }
        setTimeout(refresh, 0);
      }
    });
  }
  function delCust(id) {
    var why = Customers.whyNotDelete(id);
    if (why) { toast(why, true); return; }
    if (!confirmBox('Delete this customer' + (cust(id).userId ? ' and their login account' : '') + '?')) return;
    Customers.remove(id); toast('Customer deleted.'); refresh();
  }
  function custHistory(id) {
    var c = cust(id);
    var reps = DB.all('repairs').filter(function (r) { return r.customerId === id; }).sort(newestFirst);
    modal('Repair history – ' + esc(c.name), repairHistoryTable(reps, true), { wide: true, hideSave: true });
  }
  function repairHistoryTable() { return UI.repairHistoryTable.apply(null, arguments); }

  App.custForm = custForm; App.delCust = delCust; App.custHistory = custHistory;
})();
