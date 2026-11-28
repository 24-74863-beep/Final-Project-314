// Shop details used by the customer Shop Info page and by printed receipts. Empty fields are not displayed.
(function () {
  'use strict';

  // Shop details. Empty fields are not displayed.
  var SHOP = {
    name: "Bobby's Motorcycle Repair",
    address: 'Gumamela, Balayan, Batangas',
    phone: '',     // for example '09171234567'
    hours: '',     // for example 'Monday to Saturday, 8:00 AM - 5:00 PM'
    note: ''       // anything else customers should know
  };
  window.SHOP = SHOP;
})();
