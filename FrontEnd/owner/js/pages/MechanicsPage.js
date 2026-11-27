// Page: mechanics page with skills
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var $$ = UI.$$,
      PHONE_ATTR = UI.PHONE_ATTR,
      TBL = UI.TBL,
      VIEWS = UI.VIEWS,
      badge = UI.badge,
      confirmBox = UI.confirmBox,
      esc = UI.esc,
      fil = UI.fil,
      matches = UI.matches,
      mechOf = UI.mechOf,
      modal = UI.modal,
      phoneVal = UI.phoneVal,
      refresh = UI.refresh,
      searchBox = UI.searchBox,
      table = UI.table,
      toast = UI.toast,
      todayStr = UI.todayStr,
      val = UI.val;

  // Mechanics page (owner only): mechanic records with skills and a daily job limit
  TBL.mechanics = function () {
    var f = fil('mechanics'), today = todayStr(), max = JobLimit.MAX_JOBS_PER_DAY;
    var rows = DB.all('mechanics').filter(function (m) {
      return matches(f.q, [m.name, m.phone, (m.skills || []).join(' ')]);
    }).sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (m) {
      var n = JobLimit.jobsOn(m.id, today), full = n >= max;
      var total = DB.all('repairs').filter(function (r) { return r.mechanicId === m.id; }).length;
      return '<tr><td><b>' + esc(m.name) + '</b></td><td>' + esc(m.phone || '') + '</td><td>' +
        ((m.skills || []).map(function (k) { return '<span class="badge skill">' + esc(k) + '</span> '; }).join('') || '<small>No skills yet</small>') +
        '</td><td class="num">' + n + ' / ' + max + ' ' + (full ? '<span class="badge s-cancelled">Full</span>' : '<span class="badge s-completed">Available</span>') +
        '</td><td class="num">' + total + '</td><td>' +
        '<button class="btn sm" onclick="App.mechForm(' + m.id + ')">Edit skills</button>' +
        '<button class="btn sm danger" onclick="App.delMech(' + m.id + ')">Delete</button></td></tr>';
    });
    return table(['Name', 'Phone', 'Skills', 'num:Jobs today', 'num:All jobs', 'Actions'], rows, 'No mechanics yet. Click "+ Add mechanic".');
  };
  VIEWS.mechanics = function () {
    return '<div class="toolbar">' + searchBox('mechanics', 'Search name or skill…') +
      '<button class="btn primary" onclick="App.mechForm()">+ Add mechanic</button></div>' +
      '<p class="hint" style="margin:-6px 0 12px">Each mechanic can take up to ' + JobLimit.MAX_JOBS_PER_DAY + ' repair jobs per day. Mechanics do not log in; the owner assigns the jobs.</p>' +
      '<div id="tbl">' + TBL.mechanics() + '</div>';
  };
  function mechForm(id) {
    var m = id ? mechOf(id) : { name: '', phone: '', skills: [] };
    var have = m.skills || [];
    var other = have.filter(function (k) { return Mechanics.SKILLS.indexOf(k) < 0; }).join(', ');
    modal(id ? 'Edit Mechanic' : 'Add Mechanic',
      '<div class="grid2"><div class="field"><label>Full name *</label><input name="name" required value="' + esc(m.name) + '"></div>' +
      '<div class="field"><label>Mobile number <span class="opt">(11 digits)</span></label><input name="phone"' + PHONE_ATTR + ' value="' + esc(phoneVal(m.phone)) + '"></div></div>' +
      '<div class="field"><label>Skills (what this mechanic can do) *</label><div class="checks">' +
      Mechanics.SKILLS.map(function (k) { return '<label class="chk"><input type="checkbox" name="skill" value="' + esc(k) + '"' + (have.indexOf(k) >= 0 ? ' checked' : '') + '> ' + esc(k) + '</label>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>Other skills (separate with commas)</label><input name="other" value="' + esc(other) + '" placeholder="e.g. Wiring, Welding"></div>', {
      onSave: function (f) {
        Mechanics.save(id, { name: val(f, 'name'), phone: val(f, 'phone'), skills: $$('input[name=skill]:checked', f).map(function (c) { return c.value; }), other: val(f, 'other') });
        toast('Mechanic saved.'); setTimeout(refresh, 0);
      }
    });
  }
  function delMech(id) {
    var m = mechOf(id);
    var jobs = Mechanics.jobCount(id);
    if (!confirmBox('Delete mechanic "' + m.name + '"?' + (jobs ? ' Their ' + jobs + ' job(s) will become unassigned.' : ''))) return;
    Mechanics.remove(id); toast('Mechanic deleted.'); refresh();
  }

  App.mechForm = mechForm; App.delMech = delMech;
})();
