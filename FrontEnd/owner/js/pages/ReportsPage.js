// Page: reports page (tabs, date filters, CSV export, print)
(function () {
  'use strict';

  var UI = window.UI, App = window.App;
  var TBL = UI.TBL,
      VIEWS = UI.VIEWS,
      csvCell = UI.csvCell,
      download = UI.download,
      esc = UI.esc,
      fmtDate = UI.fmtDate,
      fmtDay = UI.fmtDay,
      fmtTime = UI.fmtTime,
      peso = UI.peso,
      refresh = UI.refresh,
      table = UI.table,
      todayStr = UI.todayStr;

  // Reports page (owner only)
  var rep = { type: 'repairs', from: '', to: '' };
  var REPORT_NAMES = { repairs: 'Repair Report', services: 'Service Report', payments: 'Payment Report', emergency: 'Emergency Service Report' };

  // Formats a raw backend value for display.
  function cellText(v, kind) {
    if (kind === 'money') return peso(v);
    if (kind === 'datetime') return fmtDate(v);
    if (kind === 'day') return fmtDay(v);
    if (kind === 'time') return fmtTime(v);
    return v;
  }
  function reportBody() {
    var R = Reports.collect(rep.type, rep.from, rep.to);
    var title = REPORT_NAMES[rep.type] + (rep.from || rep.to ? ' (' + (rep.from ? fmtDay(rep.from) : 'start') + ' – ' + (rep.to ? fmtDay(rep.to) : 'today') + ')' : ' (all dates)');
    return '<h2 class="print-title">' + esc("Bobby's Motorcycle Repair – " + title) + '</h2>' +
      '<div class="sumrow">' + R.sum.map(function (s) { return '<div><small>' + esc(s.label) + '</small><b>' + esc(cellText(s.value, s.kind)) + '</b></div>'; }).join('') + '</div>' +
      table(R.cols.map(function (c) { return c.kind === 'money' ? 'num:' + c.name : c.name; }), R.rows.map(function (r) {
        return '<tr>' + r.map(function (v, i) { var k = R.cols[i].kind; return '<td' + (k === 'money' ? ' class="num"' : '') + '>' + esc(cellText(v, k)) + '</td>'; }).join('') + '</tr>';
      }), 'No data for the selected period.');
  }
  TBL.reports = reportBody;
  VIEWS.reports = function () {
    var tabs = Object.keys(REPORT_NAMES).map(function (k) { return '<button class="' + (rep.type === k ? 'on' : '') + '" onclick="App.repType(\'' + k + '\')">' + REPORT_NAMES[k].replace(' Report', 's') + '</button>'; }).join('');
    return '<div class="tabbar">' + tabs + '</div>' +
      '<div class="toolbar"><label style="margin:0">From</label><input type="date" value="' + rep.from + '" onchange="App.repRange(\'from\',this.value)">' +
      '<label style="margin:0">To</label><input type="date" value="' + rep.to + '" onchange="App.repRange(\'to\',this.value)">' +
      '<button class="btn" onclick="App.repRange(\'clear\')">Clear</button><div class="grow"></div>' +
      '<button class="btn" onclick="App.repCsv()">Export CSV</button><button class="btn primary" onclick="window.print()">Print</button></div>' +
      '<div id="tbl">' + reportBody() + '</div>';
  };
  function repCsv() {
    var R = Reports.collect(rep.type, rep.from, rep.to);
    var lines = [R.cols.map(function (c) { return csvCell(c.name); }).join(',')].concat(R.rows.map(function (r) {
      return r.map(function (v, i) { var k = R.cols[i].kind; return csvCell(k === 'money' ? (+v).toFixed(2) : cellText(v, k)); }).join(',');
    }));
    download('bobbys-' + rep.type + '-report-' + todayStr() + '.csv', '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  }

  App.repType = function (t) { rep.type = t; refresh(); };
  App.repRange = function (k, v) { if (k === 'clear') { rep.from = rep.to = ''; } else rep[k] = v; refresh(); };
  App.repCsv = repCsv;
})();
