// Page: sign-up form for customers
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  function showErr(id, msg) { var e = $(id); e.textContent = msg; e.classList.add('show'); }
  function clearErr() { var e = $('#regErr'); e.textContent = ''; e.classList.remove('show'); }

  $('#regForm').onsubmit = function (e) {
    e.preventDefault();
    clearErr();
    var f = e.target;
    try {
      var u = Auth.registerCustomer({
        name: f.name.value, phone: f.phone.value, email: f.email.value,
        address: f.address.value, username: f.username.value, password: f.password.value
      });
      Auth.login(u.username, f.password.value);
      location.href = Auth.homePage(u);
    } catch (err) { showErr('#regErr', err.message || 'Sign up failed. Please try again.'); }
  };
})();
