// Service: mechanic records and their skills
(function (global) {
  'use strict';

  var Mechanics = {
    SKILLS: ['Engine Repair', 'Tune-up', 'Electrical', 'Brakes', 'CVT / Transmission', 'Suspension', 'Tires & Wheels', 'Carburetor / Fuel System', 'Body & Paint'],

    // f = { name, phone, skills: [...], other: 'extra skills, separated by commas' }
    save: function (id, f) {
      var name = String(f.name || '').trim();
      if (!name) throw new Error('Name is required.');
      if (DB.all('mechanics').some(function (x) { return x.id !== id && x.name.toLowerCase() === name.toLowerCase(); })) throw new Error('A mechanic with that name already exists.');
      var skills = (f.skills || []).slice();
      String(f.other || '').split(',').forEach(function (k) {
        k = k.trim();
        if (k && !skills.some(function (x) { return x.toLowerCase() === k.toLowerCase(); })) skills.push(k.slice(0, 40));
      });
      if (!skills.length) throw new Error('Choose or type at least one skill.');
      var d = { name: name, phone: Validate.cleanPhone(f.phone), skills: skills };
      if (id) DB.update('mechanics', id, d); else DB.insert('mechanics', d);
    },
    // Number of jobs that would lose their assigned mechanic if this record is deleted.
    jobCount: function (id) { return DB.all('repairs').filter(function (r) { return r.mechanicId === id; }).length; },
    remove: function (id) {
      DB.all('repairs').forEach(function (r) { if (r.mechanicId === id) DB.update('repairs', r.id, { mechanicId: null }); });
      DB.all('emergencies').forEach(function (e) { if (e.mechanicId === id) DB.update('emergencies', e.id, { mechanicId: null }); });
      DB.remove('mechanics', id);
    }
  };

  global.Mechanics = Mechanics;
})(window);
