// Service: motorcycle records
(function (global) {
  'use strict';

  var Motorcycles = {
    // Validates the fields and returns the normalized record. Throws if validation fails.
    // noCustomer = true when the customer has not been saved yet (Add Customer form).
    check: function (id, f, noCustomer) {
      var d = { customerId: +f.customerId, brand: String(f.brand || '').trim(), model: String(f.model || '').trim(),
        plate: String(f.plate || '').trim().toUpperCase(), type: f.type };
      if ((!noCustomer && !d.customerId) || !d.brand || !d.model || !d.plate) throw new Error('Please complete all required fields.');
      var dup = DB.all('motorcycles').some(function (x) { return x.plate.replace(/\s/g, '') === d.plate.replace(/\s/g, '') && x.id !== id; });
      if (dup) throw new Error('A motorcycle with this plate number already exists.');
      return d;
    },
    save: function (id, f) {
      var d = Motorcycles.check(id, f);
      if (id) DB.update('motorcycles', id, d); else DB.insert('motorcycles', d);
    },
    whyNotDelete: function (id) {
      return DB.all('repairs').some(function (r) { return r.motorcycleId === id; }) ? 'Cannot delete: motorcycle has repair records.' : '';
    },
    remove: function (id) {
      if (Motorcycles.whyNotDelete(id)) throw new Error(Motorcycles.whyNotDelete(id));
      DB.remove('motorcycles', id);
    }
  };

  global.Motorcycles = Motorcycles;
})(window);
