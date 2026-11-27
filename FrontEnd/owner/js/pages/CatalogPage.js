// Page: Services and Parts page with low-stock indicator
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var VIEWS = UI.VIEWS,
      badge = UI.badge,
      confirmBox = UI.confirmBox,
      esc = UI.esc,
      modal = UI.modal,
      peso = UI.peso,
      refresh = UI.refresh,
      table = UI.table,
      toast = UI.toast,
      val = UI.val;

  // Services & Parts page (owner only)
  var catTab = 'services';
  VIEWS.catalog = function () {
    var h = '<div class="tabbar"><button class="' + (catTab === 'services' ? 'on' : '') + '" onclick="App.catTab(\'services\')">Services</button>' +
      '<button class="' + (catTab === 'parts' ? 'on' : '') + '" onclick="App.catTab(\'parts\')">Parts / Inventory</button></div>';
    if (catTab === 'services') {
      h += '<div class="toolbar"><div class="grow"></div><button class="btn primary" onclick="App.svcForm()">+ Add service</button></div>' +
        table(['Service', 'num:Standard price', 'Actions'], DB.all('services').sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (s) {
          return '<tr><td>' + esc(s.name) + '</td><td class="num">' + peso(s.price) + '</td><td><button class="btn sm" onclick="App.svcForm(' + s.id + ')">Edit</button><button class="btn sm danger" onclick="App.delCat(\'services\',' + s.id + ')">Delete</button></td></tr>';
        }), 'No services yet.');
    } else {
      h += '<div class="toolbar"><div class="grow"></div><button class="btn primary" onclick="App.partForm()">+ Add part</button></div>' +
        table(['Part', 'num:Unit price', 'num:In stock', 'Actions'], DB.all('parts').sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (p) {
          return '<tr><td>' + esc(p.name) + '</td><td class="num">' + peso(p.price) + '</td><td class="num">' + (p.stock <= 3 ? '<span class="badge s-unpaid">' + p.stock + ' low</span>' : p.stock) + '</td><td><button class="btn sm" onclick="App.partForm(' + p.id + ')">Edit</button><button class="btn sm danger" onclick="App.delCat(\'parts\',' + p.id + ')">Delete</button></td></tr>';
        }), 'No parts yet.');
    }
    return h;
  };
  function svcForm(id) {
    var s = id ? DB.get('services', id) : { name: '', price: '' };
    modal(id ? 'Edit Service' : 'Add Service',
      '<div class="field"><label>Service name *</label><input name="name" required value="' + esc(s.name) + '"></div>' +
      '<div class="field"><label>Standard price (₱) *</label><input name="price" type="number" min="0" step="0.01" required value="' + s.price + '"></div>', {
      onSave: function (f) {
        Catalog.saveService(id, { name: val(f, 'name'), price: f.elements.price.value });
        toast('Service saved.'); setTimeout(refresh, 0);
      }
    });
  }
  function partForm(id) {
    var p = id ? DB.get('parts', id) : { name: '', price: '', stock: 0 };
    modal(id ? 'Edit Part' : 'Add Part',
      '<div class="field"><label>Part name *</label><input name="name" required value="' + esc(p.name) + '"></div>' +
      '<div class="grid2"><div class="field"><label>Unit price (₱) *</label><input name="price" type="number" min="0" step="0.01" required value="' + p.price + '"></div>' +
      '<div class="field"><label>Stock quantity *</label><input name="stock" type="number" min="0" step="1" required value="' + p.stock + '"></div></div>', {
      onSave: function (f) {
        Catalog.savePart(id, { name: val(f, 'name'), price: f.elements.price.value, stock: f.elements.stock.value });
        toast('Part saved.'); setTimeout(refresh, 0);
      }
    });
  }
  function delCat(t, id) {
    if (!confirmBox('Delete this item from the catalog? Existing repair records keep their own copy.')) return;
    Catalog.remove(t, id); toast('Deleted.'); refresh();
  }

  App.catTab = function (t) { catTab = t; refresh(); };
  App.svcForm = svcForm; App.partForm = partForm; App.delCat = delCat;
})();
