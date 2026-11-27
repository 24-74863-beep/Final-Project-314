// Database layer. Records are stored in MySQL (see /backend). This file exposes the DB.* functions
// used by the other modules (all, get, insert, update, remove, ...) and forwards them to the server.
// Reads are served from a copy loaded at start-up. Every change is saved to MySQL immediately, and the copy
// is refreshed when another client changes the data.
(function (global) {
  'use strict';

  var SKEY = 'bobbys_repair_session';
  var TABLES = ['users', 'customers', 'motorcycles', 'services', 'parts', 'repairs', 'emergencies', 'payments', 'mechanics'];
  var SCHEMA = 2;                 // backup format 2: mechanics are stored as records, not login accounts
  function dayOf(iso) {
    var d = new Date(iso);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Login session. Stored per browser tab; not shared data.
  var mem = {};
  var SS = (function () {
    try { var s = global.sessionStorage; s.setItem('__t', '1'); s.removeItem('__t'); return s; }
    catch (e) {
      return { getItem: function (k) { return mem[k] === undefined ? null : mem[k]; },
               setItem: function (k, v) { mem[k] = String(v); }, removeItem: function (k) { delete mem[k]; } };
    }
  })();

  // Synchronous SHA-256 implementation used for password hashing
  function sha256(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mp = Math.pow, mw = mp(2, 32), i, j, result = '';
    var words = [], bitLen = ascii.length * 8;
    var hash = sha256.h = sha256.h || [], k = sha256.k = sha256.k || [], pc = k.length, comp = {};
    for (var c = 2; pc < 64; c++) {
      if (!comp[c]) {
        for (i = 0; i < 313; i += c) comp[i] = c;
        hash[pc] = (mp(c, 0.5) * mw) | 0;
        k[pc++] = (mp(c, 1 / 3) * mw) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((bitLen / mw) | 0);
    words[words.length] = bitLen;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), old = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] +
            (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
    return result;
  }
  function hashPw(pw) {
    return sha256(unescape(encodeURIComponent('bobbys$' + pw + '$motoshop')));
  }


  // Older backups stored mechanics as login accounts. Converts them to mechanic records
  // (name and skills) and relinks their jobs to the new records.
  function migrate(d) {
    if (d.v === SCHEMA) return false;
    if (!Array.isArray(d.mechanics)) d.mechanics = [];
    if (!d.seq) d.seq = {};
    var map = {};
    function toMech(uid) {
      if (map[uid]) return map[uid];
      var u = d.users.find(function (x) { return x.id === uid; });
      if (!u) return null;
      d.seq.mechanics = Math.max(d.seq.mechanics || 0, d.mechanics.reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0)) + 1;
      d.mechanics.push({ id: d.seq.mechanics, name: u.name, phone: u.phone || '', skills: [], createdAt: u.createdAt || new Date().toISOString() });
      map[uid] = d.seq.mechanics;
      return map[uid];
    }
    ['repairs', 'emergencies'].forEach(function (t) {
      d[t].forEach(function (r) { if (r.mechanicId) r.mechanicId = toMech(r.mechanicId); });
    });
    d.users.filter(function (u) { return u.role === 'mechanic'; }).forEach(function (u) { toMech(u.id); });
    d.users = d.users.filter(function (u) { return u.role !== 'mechanic'; });
    d.v = SCHEMA;
    return true;
  }

  // Server communication
  // Requests are synchronous because other modules use the result of DB.insert and DB.update immediately.
  var rev = 0;
  function call(method, url, body) {
    var x = new XMLHttpRequest();
    try {
      x.open(method, url, false);
      x.setRequestHeader('Content-Type', 'application/json');
      x.send(body === undefined ? null : JSON.stringify(body));
    } catch (e) {
      throw new Error('Cannot reach the server. Make sure it is running (npm start) and open the site at http://localhost:3000.');
    }
    var r = +x.getResponseHeader('X-Rev'); if (r) rev = r;
    var j = null;
    try { j = JSON.parse(x.responseText); } catch (e) { j = null; }
    if (x.status === 0) throw new Error('Cannot reach the server. Make sure it is running (npm start) and open the site at http://localhost:3000.');
    if (x.status < 200 || x.status >= 300) throw new Error((j && j.error) || ('Server error (' + x.status + ').'));
    return j;
  }

  // In-memory copy
  var data = null;
  function emptyDb() { var d = { seq: {}, v: SCHEMA }; TABLES.forEach(function (t) { d[t] = []; }); return d; }
  function fill(d) {
    var n = emptyDb();
    TABLES.forEach(function (t) { n[t] = Array.isArray(d[t]) ? d[t] : []; });
    rev = d.rev || rev;
    data = n;
  }
  function load() {
    try { fill(call('GET', '/api/data')); }
    catch (e) {
      data = emptyDb();
      if (document.body) document.body.innerHTML = '<div style="max-width:520px;margin:12vh auto;padding:24px;font:16px/1.5 sans-serif;border:1px solid #e0b4b4;background:#fff6f6;border-radius:8px">' +
        '<h2 style="margin-top:0">Cannot connect to the database</h2><p>' + String(e.message).replace(/</g, '&lt;') + '</p>' +
        '<p>Check that MySQL is running, then start the server with <b>npm start</b>.</p></div>';
      throw e;
    }
  }

  // Every 10 seconds, check whether another client changed the data and reload silently if so.
  function poll() {
    if (document.hidden || !global.fetch) return;
    fetch('/api/version', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (v) {
      if (v && v.rev && v.rev !== rev) return fetch('/api/data', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(fill);
    }).catch(function () { /* server temporarily unreachable; retry on the next check */ });
  }

  var DB = {
    init: load,
    all: function (t) { return data[t].slice(); },
    get: function (t, id) { id = +id; return data[t].find(function (x) { return x.id === id; }) || null; },
    insert: function (t, o) {
      o.createdAt = o.createdAt || new Date().toISOString();
      Object.assign(o, call('POST', '/api/' + t, o));       // the server assigns the record id
      data[t].push(o);
      return o;
    },
    update: function (t, id, patch) {
      var o = DB.get(t, id);
      if (!o) return null;
      Object.assign(o, call('PUT', '/api/' + t + '/' + (+id), patch));
      return o;
    },
    remove: function (t, id) {
      call('DELETE', '/api/' + t + '/' + (+id));
      data[t] = data[t].filter(function (x) { return x.id !== +id; });
      fill(call('GET', '/api/data'));                        // MySQL may have cleared references (ON DELETE SET NULL), so use the server's version
    },
    adjustStock: function (partId, delta) {
      if (!partId) return;          // custom ("Other") parts are not tracked in inventory
      var p = DB.get('parts', partId);
      if (p) Object.assign(p, call('POST', '/api/parts/' + (+partId) + '/adjust', { delta: delta }));   // applied in MySQL so concurrent updates do not overwrite each other
    },
    exportJSON: function () {
      fill(call('GET', '/api/data'));
      var out = { v: SCHEMA, seq: {} };
      TABLES.forEach(function (t) {
        out[t] = data[t];
        out.seq[t] = data[t].reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0);
      });
      return JSON.stringify(out, null, 2);
    },
    importJSON: function (text) {
      var d;
      try { d = JSON.parse(text); } catch (e) { throw new Error('the file is not a valid backup file.'); }
      if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('the file is not a valid backup file.');
      if (!Array.isArray(d.mechanics)) d.mechanics = [];      // older backups do not include mechanics
      TABLES.forEach(function (t) { if (!Array.isArray(d[t])) throw new Error('Missing table: ' + t); });
      if (!d.users.some(function (u) { return u.role === 'owner'; })) throw new Error('Backup has no owner account');
      if (!d.seq) d.seq = {};
      migrate(d);
      var body = {}; TABLES.forEach(function (t) { body[t] = d[t]; });
      call('POST', '/api/import', body);
      fill(call('GET', '/api/data'));
    },
    reset: function () { call('POST', '/api/reset'); fill(call('GET', '/api/data')); }
  };

  // Services required by the backend modules: password hashing and the login session
  DB.hashPw = hashPw;
  DB.session = SS;
  DB.dayOf = dayOf;

  DB.init();
  global.DB = DB;
  setInterval(poll, 10000);
})(window);
