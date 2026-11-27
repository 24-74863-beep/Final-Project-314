// OWNER page: motorcycles list, add/edit form and repair history
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var TBL = UI.TBL,
      VIEWS = UI.VIEWS,
      confirmBox = UI.confirmBox,
      custName = UI.custName,
      esc = UI.esc,
      fil = UI.fil,
      matches = UI.matches,
      modal = UI.modal,
      moto = UI.moto,
      motoLabel = UI.motoLabel,
      newestFirst = UI.newestFirst,
      refresh = UI.refresh,
      searchBox = UI.searchBox,
      table = UI.table,
      toast = UI.toast;
  function repairHistoryTable() { return UI.repairHistoryTable.apply(null, arguments); }

  TBL.motorcycles = function () {
    var f = fil(UI.view());
    var rows = UI.myMotos().filter(function (m) {
      return matches(f.q, [m.brand, m.model, m.plate, m.type, custName(m.customerId)]);
    }).sort(function (a, b) { return a.plate.localeCompare(b.plate); }).map(function (m) {
      var n = DB.all('repairs').filter(function (r) { return r.motorcycleId === m.id; }).length;
      return '<tr><td><b>' + esc(m.plate) + '</b></td><td>' + esc(m.brand) + '</td><td>' + esc(m.model) + '</td><td>' + esc(m.type) + '</td>' +
        '<td>' + esc(custName(m.customerId)) + '</td><td class="num">' + n + '</td><td>' +
        '<button class="btn sm" onclick="App.motoHistory(' + m.id + ')">History</button>' +
        '<button class="btn sm" onclick="App.motoForm(' + m.id + ')">Edit</button>' +
        '<button class="btn sm danger" onclick="App.delMoto(' + m.id + ')">Delete</button></td></tr>';
    });
    return table(['Plate no.', 'Brand', 'Model', 'Type', 'Owner', 'num:Repairs', 'Actions'], rows, 'No motorcycles found.');
  };
  VIEWS.motorcycles = function () {
    return '<div class="toolbar">' + searchBox(UI.view(), 'Search plate, brand, model, owner…') +
      '<button class="btn primary" onclick="App.motoForm()">+ Add motorcycle</button></div><div id="tbl">' + TBL.motorcycles() + '</div>';
  };
  function motoForm(id) {
    var m = id ? moto(id) : { customerId: '', brand: '', model: '', plate: '', type: 'Scooter' };
    var custField =
      '<div class="field"><label>Owner (customer) *</label><select name="customerId" required><option value="">— select —</option>' +
      DB.all('customers').sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (c) {
        return '<option value="' + c.id + '"' + (c.id === m.customerId ? ' selected' : '') + '>' + esc(c.name) + '</option>';
      }).join('') + '</select></div>';
    if (!DB.all('customers').length) { toast('Add a customer first.', true); return; }
    modal(id ? 'Edit Motorcycle' : 'Add Motorcycle', custField +
      UI.motoFields(m, true), {
      onSave: function (f) {
        var r = UI.readMoto(f);
        Motorcycles.save(id, { customerId: f.elements.customerId.value, brand: r.brand, model: r.model, plate: r.plate, type: r.type });
        toast('Motorcycle saved.'); setTimeout(refresh, 0);
      }
    });
  }
  function delMoto(id) {
    var why = Motorcycles.whyNotDelete(id);
    if (why) { toast(why, true); return; }
    if (!confirmBox('Delete this motorcycle?')) return;
    Motorcycles.remove(id); toast('Motorcycle deleted.'); refresh();
  }
  function motoHistory(id) {
    var reps = DB.all('repairs').filter(function (r) { return r.motorcycleId === id; }).sort(newestFirst);
    modal('Repair history – ' + esc(motoLabel(moto(id))), repairHistoryTable(reps, false), { wide: true, hideSave: true });
  }

  App.motoForm = motoForm; App.delMoto = delMoto; App.motoHistory = motoHistory;
  UI.motoForm = motoForm;
})();
