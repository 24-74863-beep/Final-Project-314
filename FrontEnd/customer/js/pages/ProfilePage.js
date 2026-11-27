// CUSTOMER page: "My Profile"
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var PHONE_ATTR = UI.PHONE_ATTR,
      VIEWS = UI.VIEWS,
      cust = UI.cust,
      esc = UI.esc,
      me = UI.me,
      modal = UI.modal,
      phoneVal = UI.phoneVal,
      toast = UI.toast,
      val = UI.val;

  VIEWS.profile = function () {
    var u = DB.get('users', me.id) || me, c = cust(me.customerId) || {};
    var rows = [['Full name', u.name], ['Username', u.username], ['Mobile number', phoneVal(c.phone) || '—'], ['Email', c.email || '—'], ['Address', c.address || '—']];
    return '<p class="help">These are the details the shop has about you. Keep your mobile number up to date so the shop can reach you, especially when you ask for emergency help.</p>' +
      '<div class="panel"><div class="kv">' + rows.map(function (x) { return '<span>' + esc(x[0]) + '</span><span>' + esc(x[1]) + '</span>'; }).join('') + '</div>' +
      '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn primary" onclick="App.profileForm()">Edit my details</button>' +
      '<button class="btn" onclick="document.getElementById(\'pwBtn\').click()">Change password</button></div></div>';
  };

  function profileForm() {
    var u = DB.get('users', me.id), c = cust(me.customerId) || {};
    modal('Edit my details',
      '<div class="field"><label>Full name *</label><input name="name" required value="' + esc(u.name) + '"></div>' +
      '<div class="grid2"><div class="field"><label>Mobile number * <span class="opt">(11 digits)</span></label><input name="phone" required' + PHONE_ATTR + ' value="' + esc(phoneVal(c.phone)) + '"></div>' +
      '<div class="field"><label>Email</label><input name="email" type="email" value="' + esc(c.email || '') + '"></div></div>' +
      '<div class="field"><label>Address</label><input name="address" value="' + esc(c.address || '') + '"></div>' +
      '<p class="hint">Your username cannot be changed here.</p>', {
      onSave: function (f) {
        Accounts.updateProfile(me.id, { name: val(f, 'name'), phone: f.elements.phone.value, email: val(f, 'email'), address: val(f, 'address') });
        toast('Your details were updated.');
        setTimeout(function () { location.reload(); }, 600);   // reload to refresh the name shown across the app
      }
    });
  }

  App.profileForm = profileForm;
})();
