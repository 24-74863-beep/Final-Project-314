// Service: login (locks for 30 seconds after 5 failed attempts), logout and session
(function (global) {
  'use strict';

  var SS = DB.session, hashPw = DB.hashPw, SKEY = 'bobbys_repair_session';
  var FKEY = 'bobbys_login_fails', LKEY = 'bobbys_login_lock', MAX_TRIES = 5, LOCK_MS = 30000;
  function lockLeft() {
    var until = +SS.getItem(LKEY) || 0, left = Math.ceil((until - Date.now()) / 1000);
    if (left <= 0) { SS.removeItem(LKEY); return 0; }
    return left;
  }

  var Auth = {
    hashPw: hashPw,
    // Returns the user, or null if the credentials are invalid.
    // Throws an Error on empty input or while the account is locked.
    login: function (username, password) {
      var u = String(username || '').trim().toLowerCase();
      if (!u || !password) throw new Error('Please enter your username and password.');
      var lock = lockLeft();
      if (lock > 0) throw new Error('Too many failed attempts. Try again in ' + lock + ' second' + (lock === 1 ? '' : 's') + '.');
      var x = DB.all('users').find(function (a) { return String(a.username).toLowerCase() === u; });
      if (!x || x.passHash !== hashPw(password)) {
        var n = (+SS.getItem(FKEY) || 0) + 1;
        SS.setItem(FKEY, String(n));
        if (n >= MAX_TRIES) { SS.setItem(LKEY, String(Date.now() + LOCK_MS)); SS.setItem(FKEY, '0'); }
        return null;
      }
      SS.removeItem(FKEY); SS.removeItem(LKEY);
      SS.setItem(SKEY, String(x.id));
      return x;
    },
    current: function () {
      var id = SS.getItem(SKEY);
      var u = id ? DB.get('users', id) : null;
      if (id && !u) SS.removeItem(SKEY);      // the account no longer exists, so clear the stale session
      return u;
    },
    logout: function () { SS.removeItem(SKEY); },
    // The page each role uses after login.
    homePage: function (u) { return u && u.role === 'customer' ? '/customer/html/customer.html' : '/owner/html/owner.html'; }
  };

  global.Auth = Auth;
})(window);
