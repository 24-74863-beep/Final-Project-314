// Page: accounts page
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var PHONE_ATTR = UI.PHONE_ATTR,
      VIEWS = UI.VIEWS,
      confirmBox = UI.confirmBox,
      esc = UI.esc,
      me = UI.me,
      modal = UI.modal,
      phoneVal = UI.phoneVal,
      refresh = UI.refresh,
      table = UI.table,
      toast = UI.toast,
      userOf = UI.userOf,
      val = UI.val;

  // Accounts page (owner only)
  VIEWS.accounts = function () {
    var rows = DB.all('users').sort(function (a, b) { return a.role.localeCompare(b.role) || a.name.localeCompare(b.name); }).map(function (u) {
      return '<tr><td><b>' + esc(u.name) + '</b></td><td>' + esc(u.username) + '</td><td><span class="role-pill">' + u.role + '</span></td><td>' + esc(u.phone || '') + '</td><td>' +
        '<button class="btn sm" onclick="App.userForm(' + u.id + ')">Edit</button>' +
        (u.id !== me.id ? '<button class="btn sm danger" onclick="App.delUser(' + u.id + ')">Delete</button>' : '<small>(you)</small>') + '</td></tr>';
    });
    return '<div class="toolbar"><div class="grow"><p style="margin:0;color:var(--muted)">Manage logins for the owner and customers. Mechanics are managed in the Mechanics page.</p></div><button class="btn primary" onclick="App.userForm()">+ Add account</button></div>' +
      table(['Name', 'Username', 'Role', 'Phone', 'Actions'], rows);
  };
  function userForm(id) {
    var u = id ? userOf(id) : { name: '', username: '', role: 'customer', phone: '' };
    modal(id ? 'Edit Account' : 'Add Account',
      '<div class="field"><label>Full name *</label><input name="name" required value="' + esc(u.name) + '"></div>' +
      '<div class="grid2"><div class="field"><label>Username *</label><input name="username" required value="' + esc(u.username) + '"></div>' +
      '<div class="field"><label>Role *</label><select name="role"' + (id ? ' disabled' : '') + '>' + ['owner', 'customer'].map(function (r) { return '<option value="' + r + '"' + (r === u.role ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="grid2"><div class="field"><label>Mobile number <span class="opt">(11 digits)</span></label><input name="phone"' + PHONE_ATTR + ' value="' + esc(phoneVal(u.phone)) + '"></div>' +
      (id ? '' : '<div class="field"><label>Password *</label><input name="password" type="password" minlength="6" required></div>') + '</div>' +
      (id ? '<p class="hint">Passwords can only be changed by the person who uses this account (Change password button at the top).</p>' : ''), {
      onSave: function (f) {
        Accounts.save(id, { name: val(f, 'name'), username: val(f, 'username'), password: f.elements.password ? f.elements.password.value : '', phone: val(f, 'phone'), role: f.elements.role.value });
        toast('Account saved.'); setTimeout(refresh, 0);
      }
    });
  }
  function delUser(id) {
    var u = userOf(id);
    var why = Accounts.whyNotDelete(id);
    if (why) { toast(why, true); return; }
    if (!confirmBox('Delete the account "' + u.username + '"? Their repair records stay in the system.')) return;
    Accounts.remove(id); toast('Account deleted.'); refresh();
  }

  App.userForm = userForm; App.delUser = delUser;
})();
