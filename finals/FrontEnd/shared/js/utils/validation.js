// shared input validation (mobile number must be exactly 11 digits)
(function (global) {
  'use strict';

  var Validate = {
    // Mobile number is optional unless `required`; when provided it must be exactly 11 digits. Returns digits only.
    cleanPhone: function (v, required) {
      var d = String(v == null ? '' : v).replace(/[\s\-().]/g, '');
      if (!d) { if (required) throw new Error('Phone number is required.'); return ''; }
      if (!/^\d{11}$/.test(d)) throw new Error('Mobile number must be exactly 11 digits (example: 09171234567).');
      return d;
    }
  };

  global.Validate = Validate;
})(window);
