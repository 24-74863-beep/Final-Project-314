// Page: Backup and Data page (download, restore, reset)
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var VIEWS = UI.VIEWS,
      confirmBox = UI.confirmBox,
      download = UI.download,
      refresh = UI.refresh,
      toast = UI.toast,
      todayStr = UI.todayStr;

  // Backup & Data page (owner only)
  VIEWS.backup = function () {
    return '<div class="panel"><h3>Back up data</h3><p>All system data is stored in the MySQL database on the shop server. Download a backup file regularly so records are not lost if the computer has a problem.</p>' +
      '<button class="btn primary" onclick="App.exportDb()">Download backup (.json)</button></div>' +
      '<div class="panel"><h3>Restore from backup</h3><p>Choose a backup file. This <b>replaces</b> all current data.</p><input type="file" accept=".json,application/json" onchange="App.importDb(this)"></div>' +
      '<div class="panel"><h3>Reset system</h3><p>Erase everything and restore the default accounts, services and parts.</p><button class="btn danger" onclick="App.resetDb()">Reset all data</button></div>';
  };

  App.exportDb = function () { download('bobbys-repair-backup-' + todayStr() + '.json', DB.exportJSON(), 'application/json'); toast('Backup downloaded.'); };
  App.importDb = function (inp) {
    var file = inp.files[0]; if (!file) return;
    if (!confirmBox('Replace ALL current data with this backup?')) { inp.value = ''; return; }
    var rd = new FileReader();
    rd.onload = function () {
      try { DB.importJSON(rd.result); Auth.logout(); alert('Backup restored. Please log in again.'); location.href = '/index.html'; }
      catch (e) { toast('Restore failed: ' + e.message, true); }
    };
    rd.readAsText(file);
  };
  App.resetDb = function () {
    if (!confirmBox('This erases ALL data. Are you sure?')) return;
    if (!confirmBox('Last warning – everything will be deleted. Continue?')) return;
    DB.reset(); Auth.logout(); location.href = '/index.html';
  };
})();
