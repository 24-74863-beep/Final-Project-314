// Page: login page (notices, tabs, show-password toggle, login form)
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };

  if (Auth.current()) { location.replace(Auth.homePage(Auth.current())); return; }

  function showErr(id, msg) { var e = $(id); e.textContent = msg; e.classList.add('show'); }
  function clearErr() { ['#loginErr', '#regErr'].forEach(function (id) { var e = $(id); e.textContent = ''; e.classList.remove('show'); }); }

  function showTab(login) {
    clearErr();
    $('#loginForm').style.display = login ? '' : 'none';
    $('#regForm').style.display = login ? 'none' : '';
    $('#tabLogin').classList.toggle('on', login);
    $('#tabReg').classList.toggle('on', !login);
  }
  $('#tabLogin').onclick = function () { showTab(true); };
  $('#tabReg').onclick = function () { showTab(false); };
  $('#showPw').onchange = function () { $('#lp').type = this.checked ? 'text' : 'password'; };

  $('#loginForm').onsubmit = function (e) {
    e.preventDefault();
    clearErr();
    var f = e.target, u;
    try { u = Auth.login(f.username.value, f.password.value); }
    catch (err) { showErr('#loginErr', err.message || 'Login failed. Please try again.'); return; }
    if (!u) { showErr('#loginErr', 'Incorrect username or password.'); f.password.value = ''; f.password.focus(); return; }
    location.href = Auth.homePage(u);
  };
})();
