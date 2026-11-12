/* calendar.shareyourgroup.com: date tools and printable calendars. Everything runs in the browser; nothing typed is sent anywhere.
   All date arithmetic uses UTC day numbers, so daylight saving time cannot shift a result. */
(function () {
  'use strict';
  var C = {}, DAY = 86400000;
  C.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  C.DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  C.SAKA = ['Chaitra', 'Vaisakha', 'Jyaishtha', 'Ashadha', 'Sravana', 'Bhadra', 'Asvina', 'Kartika', 'Agrahayana', 'Pausha', 'Magha', 'Phalguna'];

  C.d = function (y, m, day) { var t = new Date(Date.UTC(2000, m - 1, day)); t.setUTCFullYear(y); return t; };   // m = 1..12; safe for years below 100
  C.parse = function (s) {            // "YYYY-MM-DD" -> Date (UTC midnight) or null
    var m = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2], da = +m[3];
    if (y < 1 || mo < 1 || mo > 12 || da < 1 || da > C.dim(y, mo)) return null;
    return C.d(y, mo, da);
  };
  C.iso = function (t) { return ('000' + t.getUTCFullYear()).slice(-4) + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2); };
  C.leap = function (y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; };
  C.dim = function (y, m) { return [31, C.leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; };
  C.days = function (a, b) { return Math.round((b - a) / DAY); };
  C.addDays = function (t, n) { return new Date(t.getTime() + n * DAY); };
  C.addMonths = function (t, n) {     // end of month is kept inside the month: 31 January + 1 month = 28 or 29 February
    var y = t.getUTCFullYear(), m = t.getUTCMonth() + n, day = t.getUTCDate();
    y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    return C.d(y, m + 1, Math.min(day, C.dim(y, m + 1)));
  };
  C.long = function (t) { return C.DAYS[t.getUTCDay()] + ', ' + t.getUTCDate() + ' ' + C.MONTHS[t.getUTCMonth()] + ' ' + t.getUTCFullYear(); };
  C.doy = function (t) { return C.days(C.d(t.getUTCFullYear(), 1, 1), t) + 1; };
  C.week = function (t) {             // ISO 8601: weeks start on Monday; week 1 holds the first Thursday of the year
    var dow = (t.getUTCDay() + 6) % 7, thu = C.addDays(t, 3 - dow), y = thu.getUTCFullYear();
    return { year: y, week: Math.floor(C.days(C.d(y, 1, 1), thu) / 7) + 1, start: C.addDays(t, -dow), end: C.addDays(t, 6 - dow) };
  };
  C.weeksIn = function (y) { return C.week(C.d(y, 12, 28)).week; };
  C.weekStart = function (y, w) { var jan4 = C.d(y, 1, 4); return C.addDays(jan4, -((jan4.getUTCDay() + 6) % 7) + (w - 1) * 7); };
  C.diff = function (a, b) {          // whole years, months, days from a to b (a <= b): the most whole months that fit, then the days left over
    var k = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
    if (C.addMonths(a, k) > b) k--;
    return { y: Math.floor(k / 12), m: k % 12, d: C.days(C.addMonths(a, k), b) };
  };
  C.workdays = function (a, b, sixDay, skip) {   // counts a..b inclusive; Sunday off, Saturday off too unless sixDay; skip = {iso: 1}
    var n = 0, hol = 0;
    for (var t = a; t <= b; t = C.addDays(t, 1)) {
      var w = t.getUTCDay();
      if (w === 0 || (w === 6 && !sixDay)) continue;
      if (skip && skip[C.iso(t)]) { hol++; continue; }
      n++;
    }
    return { work: n, holidays: hol };
  };
  /* Indian national calendar (Saka): Chaitra 1 is 22 March, or 21 March in a leap year, when Chaitra has 31 days */
  C.saka = function (t) {
    var y = t.getUTCFullYear(), start = C.d(y, 3, C.leap(y) ? 21 : 22);
    if (t < start) { y--; start = C.d(y, 3, C.leap(y) ? 21 : 22); }
    var n = C.days(start, t), len = [C.leap(y) ? 31 : 30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30], m = 0;
    while (n >= len[m]) { n -= len[m]; m++; }
    return { year: y - 78, month: m, day: n + 1, name: C.SAKA[m] };
  };
  C.fromSaka = function (sy, sm, sd) {  // sm 0..11
    var y = sy + 78, len = [C.leap(y) ? 31 : 30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
    if (sm < 0 || sm > 11 || sd < 1 || sd > len[sm]) return null;
    var n = sd - 1; for (var i = 0; i < sm; i++) n += len[i];
    return C.addDays(C.d(y, 3, C.leap(y) ? 21 : 22), n);
  };
  C.same = function (y, from, to) { var out = [], k = C.d(y, 1, 1).getUTCDay(), l = C.leap(y); for (var i = from; i <= to; i++) if (i !== y && C.leap(i) === l && C.d(i, 1, 1).getUTCDay() === k) out.push(i); return out; };
  if (typeof module !== 'undefined') { module.exports = C; return; }

  var d = document, S = window.SYG, $ = function (q, el) { return (el || d).querySelector(q); };
  var now = new Date(), today = C.d(now.getFullYear(), now.getMonth() + 1, now.getDate());
  var HOL = window.CAL_HOL || {};      // {iso: name} for the gazetted Central Government holidays the site has an official list for
  function num(n) { return Number(n).toLocaleString('en-IN'); }
  function pl(n, w) { return num(n) + ' ' + w + (n === 1 ? '' : 's'); }
  function facts(rows) { return '<dl class="facts">' + rows.map(function (r) { return '<dt>' + S.esc(r[0]) + '</dt><dd>' + S.esc(r[1]) + '</dd>'; }).join('') + '</dl>'; }
  function show(el, h) { el.innerHTML = h; el.hidden = false; }
  function val(id) { return C.parse($('#' + id).value); }
  function setToday(id, plus) { var e = $('#' + id); if (e && !e.value) e.value = C.iso(C.addDays(today, plus || 0)); }
  function bind(ids, fn) { ids.forEach(function (i) { var e = $('#' + i); if (e) { e.addEventListener('input', fn); e.addEventListener('change', fn); } }); fn(); }
  var BAD = '<p><b>Please choose a valid date.</b> Use the date picker, or type the date as year-month-day, for example 2027-03-15.</p>';
  function sakaText(t) { var s = C.saka(t); return s.day + ' ' + s.name + ' ' + s.year; }

  /* a month as a table. opt: {mon: week starts on Monday, big: large boxes for printing} */
  function monthTable(y, m, opt) {
    opt = opt || {};
    var first = C.d(y, m, 1), off = (first.getUTCDay() - (opt.mon ? 1 : 0) + 7) % 7, n = C.dim(y, m), names = opt.mon ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var h = '<table class="cal' + (opt.big ? ' big' : '') + '"><caption>' + C.MONTHS[m - 1] + ' ' + y + '</caption><thead><tr>' + names.map(function (x) { return '<th scope="col"' + (x === 'Sun' ? ' class="sun"' : '') + '>' + x + '</th>'; }).join('') + '</tr></thead><tbody><tr>';
    for (var i = 0; i < off; i++) h += '<td class="e"></td>';
    for (var day = 1; day <= n; day++) {
      var t = C.d(y, m, day), iso = C.iso(t), cls = [];
      if (t.getUTCDay() === 0) cls.push('sun'); if (t.getUTCDay() === 6) cls.push('sat');
      if (HOL[iso] && opt.hol !== false) cls.push('hol'); if (t.getTime() === today.getTime()) cls.push('now');
      h += '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + (HOL[iso] && opt.hol !== false ? ' title="' + S.esc(HOL[iso]) + '"' : '') + '><b>' + day + '</b>' + (opt.big && HOL[iso] && opt.hol !== false ? '<small>' + S.esc(HOL[iso]) + '</small>' : '') + '</td>';
      if ((off + day) % 7 === 0 && day < n) h += '</tr><tr>';
    }
    for (var k = (off + n) % 7; k && k < 7; k++) h += '<td class="e"></td>';
    return h + '</tr></tbody></table>';
  }

  /* ---------- home: today and this month ---------- */
  var tEl = $('[data-tool=today]');
  if (tEl) (function () {
    var w = C.week(today), y = today.getUTCFullYear(), left = C.days(today, C.d(y, 12, 31));
    show($('#t-out'), '<h2>Today is ' + S.esc(C.long(today)) + '</h2>' + facts([['Day of the year', C.doy(today) + ' of ' + (C.leap(y) ? 366 : 365) + ' (' + pl(left, 'day') + ' left)'], ['Week number (ISO)', 'Week ' + w.week + ' of ' + C.weeksIn(w.year)],
      ['Indian national calendar (Saka)', sakaText(today)], ['Quarter', 'Q' + (Math.floor(today.getUTCMonth() / 3) + 1) + ' of the calendar year'],
      ['Financial year in India', today.getUTCMonth() >= 3 ? y + '-' + String(y + 1).slice(2) : (y - 1) + '-' + String(y).slice(2)]]) +
      '<div class="acts"><button class="btn sm" type="button" data-copy="' + S.esc(C.long(today)) + '">Copy the date</button></div>');
    var cy = y, cm = today.getUTCMonth() + 1, box = $('#t-month');
    function draw() {
      var list = []; for (var k in HOL) if (k.slice(0, 7) === C.iso(C.d(cy, cm, 1)).slice(0, 7)) list.push('<li><b>' + (+k.slice(8)) + ' ' + C.MONTHS[cm - 1] + '</b>: ' + S.esc(HOL[k]) + '</li>');
      box.innerHTML = monthTable(cy, cm) + (list.length ? '<ul class="hl">' + list.sort().join('') + '</ul>' : '');
    }
    $('#t-prev').addEventListener('click', function () { cm--; if (cm < 1) { cm = 12; cy--; } draw(); });
    $('#t-next').addEventListener('click', function () { cm++; if (cm > 12) { cm = 1; cy++; } draw(); });
    $('#t-now').addEventListener('click', function () { cy = y; cm = today.getUTCMonth() + 1; draw(); });
    draw();
  })();

  /* mark today on the static calendars */
  d.querySelectorAll('td[data-d="' + C.iso(today) + '"]').forEach(function (td) { td.classList.add('now'); });

  /* ---------- days between two dates ---------- */
  if ($('[data-tool=between]')) (function () {
    setToday('b-from'); setToday('b-to', 30);
    bind(['b-from', 'b-to', 'b-incl'], function () {
      var a = val('b-from'), b = val('b-to'), out = $('#b-out');
      if (!a || !b) return show(out, BAD);
      var flip = a > b; if (flip) { var x = a; a = b; b = x; }
      var incl = $('#b-incl').checked ? 1 : 0, n = C.days(a, b) + incl, df = C.diff(a, incl ? C.addDays(b, 1) : b), wk = C.workdays(incl ? a : C.addDays(a, 1), b, false);
      show(out, '<h2>' + pl(n, 'day') + '</h2>' + facts([['From', C.long(a)], ['To', C.long(b)], ['In weeks', Math.floor(n / 7) + ' weeks and ' + pl(n % 7, 'day')],
        ['In years, months, days', pl(df.y, 'year') + ', ' + pl(df.m, 'month') + ', ' + pl(df.d, 'day')], ['Weekdays (Monday to Friday)', num(wk.work)], ['Saturdays and Sundays', num(n - wk.work)],
        ['In hours', num(n * 24)]]) + (flip ? '<p class="hint">The first date is later than the second, so the two were swapped.</p>' : '') +
        '<p class="hint">' + (incl ? 'Both the first and the last day are counted.' : 'The first day is not counted, the last day is. Tick the box to count both.') + '</p>');
    });
  })();

  /* ---------- add or subtract ---------- */
  if ($('[data-tool=add]')) (function () {
    setToday('a-from');
    bind(['a-from', 'a-n', 'a-unit', 'a-dir'], function () {
      var a = val('a-from'), n = parseInt($('#a-n').value, 10), out = $('#a-out');
      if (!a) return show(out, BAD);
      if (!(n >= 0) || n > 100000) return show(out, '<p><b>Type a whole number from 0 to 100000.</b></p>');
      var u = $('#a-unit').value, s = $('#a-dir').value === 'sub' ? -1 : 1, r;
      if (u === 'days') r = C.addDays(a, s * n); else if (u === 'weeks') r = C.addDays(a, s * n * 7); else if (u === 'months') r = C.addMonths(a, s * n); else if (u === 'years') r = C.addMonths(a, s * n * 12);
      else { r = a; var left = n; while (left > 0) { r = C.addDays(r, s); if (r.getUTCDay() !== 0 && r.getUTCDay() !== 6) left--; } }
      if (r.getUTCFullYear() < 1 || r.getUTCFullYear() > 9999) return show(out, '<p><b>The answer falls outside the years 1 to 9999.</b></p>');
      show(out, '<h2>' + S.esc(C.long(r)) + '</h2>' + facts([['Starting from', C.long(a)], [s > 0 ? 'Added' : 'Subtracted', pl(n, u === 'work' ? 'working day' : u.slice(0, -1))], ['Days between the two dates', num(Math.abs(C.days(a, r)))],
        ['Week number (ISO)', String(C.week(r).week)], ['Day of the year', String(C.doy(r))]]) + '<div class="acts"><button class="btn sm" type="button" data-copy="' + S.esc(C.long(r)) + '">Copy the date</button></div>');
    });
  })();

  /* ---------- age ---------- */
  if ($('[data-tool=age]')) (function () {
    setToday('g-on');
    bind(['g-dob', 'g-on'], function () {
      var a = val('g-dob'), b = val('g-on'), out = $('#g-out');
      if (!$('#g-dob').value) return show(out, '<p>Choose the date of birth above. The age appears here.</p>');
      if (!a || !b) return show(out, BAD);
      if (a > b) return show(out, '<p><b>The date of birth is after the "age on" date.</b> Check the two dates.</p>');
      var df = C.diff(a, b), total = C.days(a, b), by = b.getUTCFullYear(), bm = a.getUTCMonth() + 1, bd = a.getUTCDate();
      var nb = function (y) { return C.d(y, bm, Math.min(bd, C.dim(y, bm))); }, next = nb(by); if (next <= b) next = nb(by + 1);
      show(out, '<h2>' + pl(df.y, 'year') + ', ' + pl(df.m, 'month') + ', ' + pl(df.d, 'day') + '</h2>' + facts([['Born on', C.long(a)], ['Age on', C.long(b)], ['Completed years', String(df.y)],
        ['In months', num(df.y * 12 + df.m) + ' months and ' + pl(df.d, 'day')], ['In weeks', num(Math.floor(total / 7)) + ' weeks and ' + pl(total % 7, 'day')], ['In days', num(total)],
        ['Next birthday', C.long(next) + ' (in ' + pl(C.days(b, next), 'day') + ')']]) +
        (bm === 2 && bd === 29 ? '<p class="hint">Born on 29 February: in years that are not leap years this page counts the birthday on 28 February. Some rules use 1 March; check the form you are filling.</p>' : ''));
    });
  })();

  /* ---------- day of the week, day of year, week number, Saka ---------- */
  if ($('[data-tool=dow]')) (function () {
    setToday('w-date');
    bind(['w-date'], function () {
      var a = val('w-date'), out = $('#w-out');
      if (!a) return show(out, BAD);
      var y = a.getUTCFullYear(), w = C.week(a), n = C.days(today, a);
      show(out, '<h2>' + S.esc(C.DAYS[a.getUTCDay()]) + '</h2><p>' + S.esc(C.long(a)) + (n === 0 ? ' is today.' : n > 0 ? ' is ' + pl(n, 'day') + ' from today.' : ' was ' + pl(-n, 'day') + ' ago.') + '</p>' +
        facts([['Day of the year', C.doy(a) + ' of ' + (C.leap(y) ? 366 : 365)], ['Days left in the year', String(C.days(a, C.d(y, 12, 31)))], ['Week number (ISO)', 'Week ' + w.week + ' of ' + w.year + ' (' + C.long(w.start) + ' to ' + C.long(w.end) + ')'],
          ['Indian national calendar (Saka)', sakaText(a)], ['Leap year', C.leap(y) ? 'Yes, ' + y + ' has 366 days' : 'No, ' + y + ' has 365 days']]) +
        (y < 1583 ? '<p class="hint">This page uses today\'s (Gregorian) calendar for every year. Before the calendar change of 1582 (1752 in Britain and its colonies) people used the Julian calendar, so a weekday shown for those years is not the one they would have written.</p>' : ''));
    });
  })();

  /* ---------- week number ---------- */
  if ($('[data-tool=week]')) (function () {
    setToday('k-date'); $('#k-year').value = C.week(today).year; $('#k-week').value = C.week(today).week;
    bind(['k-date'], function () {
      var a = val('k-date'), out = $('#k-out');
      if (!a) return show(out, BAD);
      var w = C.week(a);
      show(out, '<h2>Week ' + w.week + ' of ' + w.year + '</h2>' + facts([['The date', C.long(a)], ['Week starts', C.long(w.start)], ['Week ends', C.long(w.end)], ['Written the ISO way', w.year + '-W' + ('0' + w.week).slice(-2) + '-' + (((a.getUTCDay() + 6) % 7) + 1)],
        ['Weeks in ' + w.year, String(C.weeksIn(w.year))]]) + (w.year !== a.getUTCFullYear() ? '<p class="hint">This date belongs to a week of ' + w.year + ', because a week is counted in the year that holds its Thursday.</p>' : ''));
    });
    bind(['k-year', 'k-week'], function () {
      var y = parseInt($('#k-year').value, 10), w = parseInt($('#k-week').value, 10), out = $('#k-out2');
      if (!(y >= 1 && y <= 9998)) return show(out, '<p><b>Type a year.</b></p>');
      if (!(w >= 1 && w <= C.weeksIn(y))) return show(out, '<p><b>' + y + ' has weeks 1 to ' + C.weeksIn(y) + '.</b></p>');
      var st = C.weekStart(y, w);
      show(out, '<h2>' + S.esc(C.long(st)) + ' to ' + S.esc(C.long(C.addDays(st, 6))) + '</h2><p>Week ' + w + ' of ' + y + ' runs from Monday to Sunday on these dates.</p>');
    });
  })();

  /* ---------- countdown ---------- */
  if ($('[data-tool=count]')) (function () {
    var y = today.getUTCFullYear(), nextOf = function (m, day) { var t = C.d(y, m, day); return t > today ? t : C.d(y + 1, m, day); };
    var presets = [['New Year', nextOf(1, 1)], ['Republic Day', nextOf(1, 26)], ['Independence Day', nextOf(8, 15)], ['Gandhi Jayanti', nextOf(10, 2)], ['Christmas', nextOf(12, 25)]];
    var dw = Object.keys(HOL).filter(function (k) { return /Diwali/.test(HOL[k]) && C.parse(k) > today; }).sort()[0];
    if (dw) presets.splice(4, 0, ['Diwali ' + dw.slice(0, 4), C.parse(dw)]);
    $('#n-presets').innerHTML = presets.map(function (p) { return '<button type="button" data-set="' + C.iso(p[1]) + '" data-name="' + S.esc(p[0]) + '">' + S.esc(p[0]) + '</button>'; }).join('');
    var name = '';
    $('#n-presets').addEventListener('click', function (e) { var b = e.target.closest('[data-set]'); if (!b) return; $('#n-date').value = b.getAttribute('data-set'); name = b.getAttribute('data-name'); run(); });
    $('#n-date').value = C.iso(presets[0][1]); name = presets[0][0];
    function run() {
      var a = val('n-date'), out = $('#n-out');
      if (!a) return show(out, BAD);
      var n = C.days(today, a), an = Math.abs(n), df = n >= 0 ? C.diff(today, a) : C.diff(a, today), label = name && $('#n-date').value === C.iso(a) ? name : 'that day';
      show(out, '<h2>' + (n === 0 ? 'It is today' : n > 0 ? pl(n, 'day') + ' to go' : pl(an, 'day') + ' ago') + '</h2>' + facts([['The date', C.long(a)], ['Counted from today', C.long(today)], ['In weeks', Math.floor(an / 7) + ' weeks and ' + pl(an % 7, 'day')],
        ['In months and days', pl(df.y * 12 + df.m, 'month') + ' and ' + pl(df.d, 'day')], ['Weekdays (Monday to Friday) in between', num(n > 0 ? C.workdays(C.addDays(today, 1), a, false).work : n < 0 ? C.workdays(C.addDays(a, 1), today, false).work : 0)],
        ['Nights of sleep', n > 0 ? num(n) : '0']]) + '<div class="acts"><button class="btn sm" type="button" data-wa="' + S.esc((n > 0 ? an + ' days to go until ' : an + ' days since ') + (label === 'that day' ? C.long(a) : label + ' (' + C.long(a) + ')') + '. https://calendar.shareyourgroup.com/countdown/') + '">Send on WhatsApp</button></div>');
    }
    $('#n-date').addEventListener('input', function () { name = ''; run(); }); run();
  })();

  /* ---------- working days ---------- */
  if ($('[data-tool=work]')) (function () {
    setToday('r-from'); setToday('r-to', 30);
    bind(['r-from', 'r-to', 'r-six', 'r-hol'], function () {
      var a = val('r-from'), b = val('r-to'), out = $('#r-out');
      if (!a || !b) return show(out, BAD);
      if (a > b) { var x = a; a = b; b = x; }
      if (C.days(a, b) > 36600) return show(out, '<p><b>Please choose two dates less than 100 years apart.</b></p>');
      var six = $('#r-six').checked, useHol = $('#r-hol').checked, r = C.workdays(a, b, six, useHol ? HOL : null), total = C.days(a, b) + 1, r0 = C.workdays(a, b, six, null);
      var years = {}; Object.keys(HOL).forEach(function (k) { years[k.slice(0, 4)] = 1; });
      var miss = []; for (var yy = a.getUTCFullYear(); yy <= b.getUTCFullYear(); yy++) if (!years[yy]) miss.push(yy);
      show(out, '<h2>' + pl(r.work, 'working day') + '</h2>' + facts([['From', C.long(a)], ['To', C.long(b)], ['Calendar days (both counted)', num(total)], ['Weekly offs (' + (six ? 'Sundays' : 'Saturdays and Sundays') + ')', num(total - r0.work)],
        ['Gazetted holidays on working days', useHol ? num(r.holidays) : 'Not taken out'], ['Working days', num(r.work)]]) +
        (useHol && miss.length ? '<p class="hint">Holidays are taken out only for ' + Object.keys(years).join(', ') + ', the year' + (Object.keys(years).length > 1 ? 's' : '') + ' for which this site has the official list. No holidays were taken out for ' + miss.slice(0, 6).join(', ') + (miss.length > 6 ? '...' : '') + '.</p>' : ''));
    });
  })();

  /* ---------- leap year ---------- */
  if ($('[data-tool=leap]')) (function () {
    $('#p-year').value = today.getUTCFullYear();
    bind(['p-year'], function () {
      var y = parseInt($('#p-year').value, 10), out = $('#p-out');
      if (!(y >= 1 && y <= 9999)) return show(out, '<p><b>Type a year from 1 to 9999.</b></p>');
      var why = y % 400 === 0 ? 'It can be divided by 400, so it is a leap year even though it ends a century.' : y % 100 === 0 ? 'It can be divided by 100 but not by 400, so it is not a leap year. Century years are leap years only when they divide by 400.'
        : y % 4 === 0 ? 'It can be divided by 4 and is not a century year.' : 'It cannot be divided by 4 (' + y + ' ÷ 4 leaves a remainder of ' + (y % 4) + ').';
      var nx = y + 1; while (!C.leap(nx)) nx++; var pv = y - 1; while (pv > 0 && !C.leap(pv)) pv--;
      show(out, '<h2>' + y + (C.leap(y) ? ' is a leap year' : ' is not a leap year') + '</h2><p>' + why + '</p>' + facts([['Days in ' + y, C.leap(y) ? '366' : '365'], ['February has', C.leap(y) ? '29 days' : '28 days'],
        ['1 January ' + y + ' is a', C.DAYS[C.d(y, 1, 1).getUTCDay()]], ['Next leap year', String(nx)], ['Leap year before', pv > 0 ? String(pv) : 'None']]) +
        (y < 1583 ? '<p class="hint">The rule used here is today\'s (Gregorian) rule. Before 1582 the Julian calendar made every fourth year a leap year, with no century exception.</p>' : ''));
    });
  })();

  /* ---------- Saka date ---------- */
  if ($('[data-tool=saka]')) (function () {
    setToday('z-date'); var st = C.saka(today);
    $('#z-m').innerHTML = C.SAKA.map(function (n, i) { return '<option value="' + i + '"' + (i === st.month ? ' selected' : '') + '>' + n + '</option>'; }).join('');
    $('#z-y').value = st.year; $('#z-d').value = st.day;
    bind(['z-date'], function () {
      var a = val('z-date'), out = $('#z-out');
      if (!a) return show(out, BAD);
      if (a.getUTCFullYear() < 80) return show(out, '<p><b>Choose a date from the year 80 onward.</b></p>');
      var s = C.saka(a), gy = s.year + 78;
      show(out, '<h2>' + s.day + ' ' + s.name + ' ' + s.year + ' Saka</h2>' + facts([['Common (Gregorian) date', C.long(a)], ['Saka month', s.name + ' (month ' + (s.month + 1) + ' of 12)'], ['Saka year ' + s.year + ' began on', C.long(C.d(gy, 3, C.leap(gy) ? 21 : 22))],
        ['Days in this Saka year', C.leap(gy) ? '366 (Chaitra has 31 days)' : '365 (Chaitra has 30 days)']]) + '<div class="acts"><button class="btn sm" type="button" data-copy="' + S.esc(s.day + ' ' + s.name + ' ' + s.year + ' Saka (' + C.long(a) + ')') + '">Copy</button></div>');
    });
    bind(['z-y', 'z-m', 'z-d'], function () {
      var y = parseInt($('#z-y').value, 10), m = +$('#z-m').value, day = parseInt($('#z-d').value, 10), out = $('#z-out2');
      if (!(y >= 1 && y <= 9900)) return show(out, '<p><b>Type a Saka year.</b></p>');
      var t = C.fromSaka(y, m, day);
      if (!t) return show(out, '<p><b>' + C.SAKA[m] + ' does not have a day ' + S.esc(String($('#z-d').value)) + ' in that year.</b> Chaitra has 30 days (31 in a leap year), the next five months have 31, the last six have 30.</p>');
      show(out, '<h2>' + S.esc(C.long(t)) + '</h2><p>' + day + ' ' + C.SAKA[m] + ' ' + y + ' Saka is this date in the common calendar.</p>');
    });
  })();

  /* ---------- same calendar years ---------- */
  if ($('[data-tool=same]')) (function () {
    $('#e-year').value = today.getUTCFullYear();
    bind(['e-year'], function () {
      var y = parseInt($('#e-year').value, 10), out = $('#e-out');
      if (!(y >= 1583 && y <= 9000)) return show(out, '<p><b>Type a year from 1583 onward.</b></p>');
      var past = C.same(y, Math.max(1583, y - 120), y - 1), fut = C.same(y, y + 1, y + 120), link = function (v) { return '<span class="yr">' + v + '</span>'; };
      show(out, '<h2>' + y + ' starts on a ' + C.DAYS[C.d(y, 1, 1).getUTCDay()] + (C.leap(y) ? ' and is a leap year' : '') + '</h2><p>A calendar of ' + y + ' can be used again, date for date, in these years:</p>' +
        '<p><b>Earlier:</b> ' + (past.length ? past.slice(-8).map(link).join(' ') : 'none in the 120 years before') + '</p><p><b>Later:</b> ' + (fut.length ? fut.slice(0, 8).map(link).join(' ') : 'none in the 120 years after') + '</p>' +
        '<p class="hint">Only the dates and weekdays match. Festivals that follow the moon, and public holidays, fall on different dates each year.</p>');
    });
  })();

  /* ---------- printable month and year ---------- */
  if ($('[data-tool=pmonth]')) (function () {
    $('#m-year').value = today.getUTCFullYear(); $('#m-month').innerHTML = C.MONTHS.map(function (n, i) { return '<option value="' + (i + 1) + '"' + (i === today.getUTCMonth() ? ' selected' : '') + '>' + n + '</option>'; }).join('');
    bind(['m-year', 'm-month', 'm-mon', 'm-hol', 'm-notes'], function () {
      var y = parseInt($('#m-year').value, 10), out = $('#m-out');
      if (!(y >= 1583 && y <= 9000)) return show(out, '<p><b>Type a year from 1583 onward.</b></p>');
      show(out, monthTable(y, +$('#m-month').value, { mon: $('#m-mon').checked, big: true, hol: $('#m-hol').checked }) + ($('#m-notes').checked ? '<div class="notes"><b>Notes</b><i></i><i></i><i></i><i></i></div>' : ''));
    });
    $('#m-print').addEventListener('click', function () { window.print(); });
  })();
  if ($('[data-tool=pyear]')) (function () {
    $('#y-year').value = today.getUTCFullYear() + (today.getUTCMonth() >= 9 ? 1 : 0);
    bind(['y-year', 'y-mon', 'y-hol'], function () {
      var y = parseInt($('#y-year').value, 10), out = $('#y-out'), h = '';
      if (!(y >= 1583 && y <= 9000)) return show(out, '<p><b>Type a year from 1583 onward.</b></p>');
      for (var m = 1; m <= 12; m++) h += monthTable(y, m, { mon: $('#y-mon').checked, hol: $('#y-hol').checked });
      show(out, '<h2 class="ytitle">' + y + '</h2><div class="year">' + h + '</div>');
    });
    $('#y-print').addEventListener('click', function () { window.print(); });
  })();
  d.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
})();
