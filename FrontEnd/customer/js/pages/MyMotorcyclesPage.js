// CUSTOMER page: "My Motorcycles" list, add/edit form and repair history
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var TBL = UI.TBL,
      VIEWS = UI.VIEWS,
      esc = UI.esc,
      me = UI.me,
      modal = UI.modal,
      moto = UI.moto,
      motoLabel = UI.motoLabel,
      newestFirst = UI.newestFirst,
      refresh = UI.refresh,
      table = UI.table,
      toast = UI.toast;
  function repairHistoryTable() { return UI.repairHistoryTable.apply(null, arguments); }

  TBL.mymotos = function () {
    var rows = UI.myMotos().sort(function (a, b) { return a.plate.localeCompare(b.plate); }).map(function (m) {
      var n = DB.all('repairs').filter(function (r) { return r.motorcycleId === m.id; }).length;
      return '<tr><td><b>' + esc(m.plate) + '</b></td><td>' + esc(m.brand) + '</td><td>' + esc(m.model) + '</td><td>' + esc(m.type) + '</td>' +
        '<td class="num">' + n + '</td><td>' +
        '<button class="btn sm" onclick="App.motoHistory(' + m.id + ')">History</button>' +
        '<button class="btn sm" onclick="App.motoForm(' + m.id + ')">Edit</button></td></tr>';
    });
    return table(['Plate no.', 'Brand', 'Model', 'Type', 'num:Repairs', 'Actions'], rows, 'You have not added a motorcycle yet. Click "Add my motorcycle".');
  };
  VIEWS.mymotos = function () {
    return '<p class="help">Add the motorcycles you own here. Then the shop can find them quickly when you bring them in.</p>' +
      '<div class="toolbar"><div class="grow"></div>' +
      '<button class="btn primary" onclick="App.motoForm()">Add my motorcycle</button></div><div id="tbl">' + TBL.mymotos() + '</div>';
  };
  function motoForm(id) {
    if (id) {                                         // customers can only edit their own motorcycles
      var own = moto(id);
      if (!own || own.customerId !== me.customerId) return;
    }
    var m = id ? moto(id) : { customerId: me.customerId, brand: '', model: '', plate: '', type: 'Scooter' };
    modal(id ? 'Edit Motorcycle' : 'Add My Motorcycle', UI.motoFields(m, true), {
      onSave: function (f) {
        var r = UI.readMoto(f);
        Motorcycles.save(id, { customerId: me.customerId, brand: r.brand, model: r.model, plate: r.plate, type: r.type });
        toast('Motorcycle saved.'); setTimeout(refresh, 0);
      }
    });
  }
  function motoHistory(id) {
    var own = moto(id);
    if (!own || own.customerId !== me.customerId) return;
    var reps = DB.all('repairs').filter(function (r) { return r.motorcycleId === id; }).sort(newestFirst);
    modal('Repair history – ' + esc(motoLabel(own)), repairHistoryTable(reps, false), { wide: true, hideSave: true });
  }

  App.motoForm = motoForm; App.motoHistory = motoHistory;
  UI.motoForm = motoForm;
})();
