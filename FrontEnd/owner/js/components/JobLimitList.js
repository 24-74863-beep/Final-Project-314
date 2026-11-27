// Component: mechanic list showing jobs per day (e.g. 3/5) and a FULL indicator
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var esc = UI.esc;

  // <option> list of mechanics with their skills and job count for the selected day.
  function mechOptions(selId, day, exceptRepairId) {
    var o = '<option value="">— unassigned —</option>';
    DB.all('mechanics').sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (m) {
      var n = JobLimit.jobsOn(m.id, day, exceptRepairId), full = n >= JobLimit.MAX_JOBS_PER_DAY, sel = m.id === selId;
      o += '<option value="' + m.id + '"' + (sel ? ' selected' : '') + (full && !sel ? ' disabled' : '') + '>' + esc(m.name) +
        (m.skills && m.skills.length ? ' [' + esc(m.skills.join(', ')) + ']' : '') + ' (' + n + '/' + JobLimit.MAX_JOBS_PER_DAY + (full ? ', FULL' : '') + ')</option>';
    });
    return o;
  }

  UI.mechOptions = mechOptions;
})();
