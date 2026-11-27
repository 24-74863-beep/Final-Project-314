// Component: Change Password form
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var $ = UI.$,
      me = UI.me,
      modal = UI.modal,
      toast = UI.toast;

  function pwForm() {
    modal('Change password',
      '<div class="field"><label>Current password</label><input type="password" name="cur" required></div>' +
      '<div class="field"><label>New password (min. 6 characters)</label><input type="password" name="nw" minlength="6" required></div>' +
      '<div class="field"><label>Confirm new password</label><input type="password" name="cf" required></div>', {
      onSave: function (f) {
        Accounts.changePassword(me.id, f.elements.cur.value, f.elements.nw.value, f.elements.cf.value);
        toast('Password changed.');
      }
    });
  }


  $('#pwBtn').onclick = pwForm;

})();
