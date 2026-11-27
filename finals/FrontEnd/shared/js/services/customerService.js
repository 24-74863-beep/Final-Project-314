// Service: customer records
(function (global) {
  'use strict';

  var Customers = {
    save: function (id, f) {
      var d = { name: String(f.name || '').trim(), phone: Validate.cleanPhone(f.phone), email: String(f.email || '').trim(), address: String(f.address || '').trim() };
      if (!d.name) throw new Error('Name is required.');
      if (id) {
        var c = DB.get('customers', id);
        DB.update('customers', id, d);
        if (c && c.userId) DB.update('users', c.userId, { name: d.name, phone: d.phone });
      } else return DB.insert('customers', Object.assign(d, { userId: null }));
    },
    // Adds a customer and, optionally, their first motorcycle in one operation.
    // The motorcycle is validated first, so nothing is saved if it is invalid.
    saveWithMotorcycle: function (f, m) {
      var hasMoto = m && (m.brand || m.model || m.plate);
      if (!String(f.name || '').trim()) throw new Error('Name is required.');
      if (hasMoto) Motorcycles.check(null, m, true);
      var c = Customers.save(null, f);
      if (hasMoto) Motorcycles.save(null, Object.assign({}, m, { customerId: c.id }));
      return !!hasMoto;
    },
    // Returns the reason a customer cannot be deleted, or '' if deletion is allowed.
    whyNotDelete: function (id) {
      var hasMoto = DB.all('motorcycles').some(function (m) { return m.customerId === id; });
      var hasRep = DB.all('repairs').some(function (r) { return r.customerId === id; });
      return (hasMoto || hasRep) ? 'Cannot delete: this customer still has motorcycles or repair records.' : '';
    },
    remove: function (id) {
      if (Customers.whyNotDelete(id)) throw new Error(Customers.whyNotDelete(id));
      var c = DB.get('customers', id);
      if (c && c.userId) DB.remove('users', c.userId);
      DB.remove('customers', id);
    }
  };

  global.Customers = Customers;
})(window);
