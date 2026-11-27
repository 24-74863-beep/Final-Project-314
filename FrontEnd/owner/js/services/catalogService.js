// Service: services and parts price list
(function (global) {
  'use strict';

  var Catalog = {
    saveService: function (id, f) {
      var d = { name: String(f.name || '').trim(), price: +f.price };
      if (!d.name) throw new Error('Name is required.');
      if (id) DB.update('services', id, d); else DB.insert('services', d);
    },
    savePart: function (id, f) {
      var d = { name: String(f.name || '').trim(), price: +f.price, stock: Math.max(0, Math.floor(+f.stock)) };
      if (!d.name) throw new Error('Name is required.');
      if (id) DB.update('parts', id, d); else DB.insert('parts', d);
    },
    remove: function (table, id) {
      if (table !== 'services' && table !== 'parts') throw new Error('Unknown catalog.');
      DB.remove(table, id);
    }
  };

  global.Catalog = Catalog;
})(window);
