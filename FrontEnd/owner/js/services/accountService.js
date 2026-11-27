// Service: owner / customer accounts and change password
(function (global) {
  'use strict';

  var Accounts = {
    // f = { name, username, password, phone, role }
    save: function (id, f) {
      var name = String(f.name || '').trim(), username = String(f.username || '').trim(), pw = f.password || '', phone = Validate.cleanPhone(f.phone);
      if (!name) throw new Error('Name is required.');
      if (!/^[A-Za-z0-9_.-]{4,}$/.test(username)) throw new Error('Username: at least 4 characters (letters, numbers, . _ -).');
      if (Auth.usernameTaken(username, id)) throw new Error('That username is already taken.');
      if (pw && pw.length < 6) throw new Error('Password must be at least 6 characters.');
      if (id) {
        var u = DB.get('users', id), patch = { name: name, username: username, phone: phone };
        // Editing an account does not change its password. Users change their own password through changePassword.
        DB.update('users', id, patch);
        if (u && u.customerId) DB.update('customers', u.customerId, { name: name, phone: phone });
      } else {
        if (!pw) throw new Error('Password must be at least 6 characters.');
        var role = f.role === 'owner' ? 'owner' : 'customer', nu = { role: role, name: name, username: username, passHash: Auth.hashPw(pw), phone: phone };
        if (role === 'customer') {
          var c = DB.insert('customers', { name: name, phone: phone, address: '', email: '', userId: null });
          nu.customerId = c.id;
          var made = DB.insert('users', nu);
          DB.update('customers', c.id, { userId: made.id });
        } else DB.insert('users', nu);
      }
    },
    whyNotDelete: function (id) {
      var u = DB.get('users', id);
      if (u && u.role === 'owner' && DB.all('users').filter(function (x) { return x.role === 'owner'; }).length < 2) return 'Cannot delete the only owner account.';
      return '';
    },
    remove: function (id) {
      var why = Accounts.whyNotDelete(id);
      if (why) throw new Error(why);
      var u = DB.get('users', id);
      if (u && u.customerId) DB.update('customers', u.customerId, { userId: null });
      DB.remove('users', id);
    },
    // Customer self-service edit. The customer record and the account name and phone are kept in sync.
    updateProfile: function (userId, f) {
      var u = DB.get('users', userId);
      if (!u || !u.customerId) throw new Error('Profile not found.');
      Validate.cleanPhone(f.phone, true);   // customers must keep a mobile number
      Customers.save(u.customerId, f);
    },
    changePassword: function (userId, current, next, confirm) {
      if (DB.get('users', userId).passHash !== Auth.hashPw(current)) throw new Error('Current password is incorrect.');
      if (next.length < 6) throw new Error('New password must be at least 6 characters.');
      if (next !== confirm) throw new Error('Passwords do not match.');
      DB.update('users', userId, { passHash: Auth.hashPw(next) });
    }
  };

  global.Accounts = Accounts;
})(window);
