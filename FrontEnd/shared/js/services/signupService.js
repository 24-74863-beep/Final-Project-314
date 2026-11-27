// Service: customer sign-up checks, unique username
(function (global) {
  'use strict';

  var hashPw = DB.hashPw;
  // Extends the Auth object defined in auth.js with the sign-up functions.
  Auth.usernameTaken = function (u, exceptId) {
    u = String(u || '').trim().toLowerCase();
    return DB.all('users').some(function (x) { return x.username.toLowerCase() === u && x.id !== exceptId; });
  };
  Auth.registerCustomer = function (f) {
      var name = (f.name || '').trim(), username = (f.username || '').trim();
      if (!name) throw new Error('Full name is required.');
      var phone = Validate.cleanPhone(f.phone, true);
      if (username.length < 4) throw new Error('Username must be at least 4 characters.');
      if (!/^[A-Za-z0-9_.-]+$/.test(username)) throw new Error('Username may only contain letters, numbers, dot, dash and underscore.');
      if (Auth.usernameTaken(username)) throw new Error('That username is already taken.');
      if ((f.password || '').length < 6) throw new Error('Password must be at least 6 characters.');
      var c = DB.insert('customers', { name: name, phone: phone, address: (f.address || '').trim(), email: (f.email || '').trim(), userId: null });
      var u = DB.insert('users', { role: 'customer', name: name, username: username, passHash: hashPw(f.password), phone: phone, customerId: c.id });
      DB.update('customers', c.id, { userId: u.id });
      return u;
  };
})(window);
