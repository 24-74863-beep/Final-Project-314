// Service: repair jobs (create, update, delete), totals and custom "Other" parts
(function (global) {
  'use strict';

  function today() { return DB.dayOf(new Date().toISOString()); }
  function nowIso() { return new Date().toISOString(); }
  function num(v) { return +v || 0; }

  var Repairs = {
    setStatus: function (id, status) {
      DB.update('repairs', id, { status: status, updatedAt: nowIso() });
    },

    // Creates (id = null) or updates a repair job.
    // f = { motorcycleId, problem, mechanicId, status, isEmergency, notes,
    //       services: [{ name, price }], parts: [{ other, partId, name, qty, price }] }
    // opts.emergencyId links a new job to an emergency request.
    // Returns { repair, created }.
    save: function (id, f, opts) {
      opts = opts || {};
      var r = id ? DB.get('repairs', id) : null;
      var m = DB.get('motorcycles', +f.motorcycleId);
      if (!m) throw new Error('Please select a motorcycle.');
      var services = (f.services || []).map(function (s) { return { name: String(s.name || '').trim(), price: num(s.price) }; })
        .filter(function (s) { return s.name; });
      var parts = (f.parts || []).map(function (x) {
        var qty = Math.max(1, Math.floor(num(x.qty) || 1)), price = num(x.price);
        if (x.other) {
          var cname = String(x.name || '').trim();
          if (!cname) throw new Error('Type the name of the custom part, or choose another part.');
          return { partId: null, custom: true, name: cname.slice(0, 80), qty: qty, price: price };
        }
        var p = DB.get('parts', +x.partId);
        return p ? { partId: p.id, name: p.name, qty: qty, price: price } : null;
      }).filter(Boolean);

      Stock.check(r ? r.parts : [], parts);
      var mech = f.mechanicId ? +f.mechanicId : null;
      if (mech) JobLimit.assertCanTake(mech, r ? DB.dayOf(r.createdAt) : today(), r);

      var patch = {
        motorcycleId: m.id, customerId: m.customerId, problem: String(f.problem || '').trim(), mechanicId: mech,
        status: f.status, isEmergency: !!f.isEmergency, services: services, parts: parts,
        notes: String(f.notes || '').trim(), updatedAt: nowIso()
      };
      if (!patch.problem) throw new Error('Please describe the problem.');

      Stock.apply(r ? r.parts : [], parts);
      if (r) { DB.update('repairs', r.id, patch); return { repair: DB.get('repairs', r.id), created: false }; }
      var nr = DB.insert('repairs', patch);
      if (opts.emergencyId) {
        var em = DB.get('emergencies', opts.emergencyId);
        DB.update('emergencies', opts.emergencyId, { repairId: nr.id, status: em && em.status === 'Pending' ? 'Dispatched' : (em ? em.status : 'Dispatched'), mechanicId: patch.mechanicId || (em && em.mechanicId) || null });
      }
      return { repair: nr, created: true };
    },

    // Deletes a job: returns its parts to stock, removes its payments and clears any emergency link.
    remove: function (id) {
      var r = DB.get('repairs', id);
      if (!r) return;
      Stock.giveBack(r.parts);
      DB.all('payments').filter(function (p) { return p.repairId === id; }).forEach(function (p) { DB.remove('payments', p.id); });
      DB.all('emergencies').filter(function (e) { return e.repairId === id; }).forEach(function (e) { DB.update('emergencies', e.id, { repairId: null }); });
      DB.remove('repairs', id);
    }
  };

  global.Repairs = Repairs;
})(window);
