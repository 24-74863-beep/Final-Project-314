// Component: logout confirmation and the user name in the sidebar
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var $ = UI.$,
      confirmBox = UI.confirmBox,
      esc = UI.esc,
      me = UI.me;

  $('#me').innerHTML = '<b>' + esc(me.name) + '</b><span class="role-pill">' + me.role + '</span>';
  $('#logoutBtn').onclick = function () {
    if (!confirmBox('Are you sure you want to log out?')) return;
    Auth.logout(); location.href = '/index.html';
  };

})();
