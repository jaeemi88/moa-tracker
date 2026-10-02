/* ─────────────────────────────────────────────
   MOA FORMULA 공통 상단 바 (2026-10-03) — 트래커·운영보드·제안서용
   · index.html의 <script src="/moa-ui.js" data-color="#앱색" data-student="survey"> 처럼 씀
   · data-student: 이 주소 값(?survey=1 등)이 있으면 학생 화면(강사 버튼 숨김)
   · 화면 내용은 건드리지 않고, 흰 상단 바·자물쇠 버튼·디자인 키트 적용만 합니다.
   ───────────────────────────────────────────── */
(function () {
  'use strict';
  var me = document.currentScript;
  var COLOR = (me && me.getAttribute('data-color')) || '#141A2E';
  var STUDENT_PARAM = me && me.getAttribute('data-student');
  var params = new URLSearchParams(location.search);
  var isStudent = !!(STUDENT_PARAM && params.get(STUDENT_PARAM));
  var STRIP = me && me.getAttribute('data-strip'); // 앞머리 이모지를 뺄 제목 (CSS 선택자)
  var EMOJI = /^[\s\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F\u200D]+/;
  function strip() {
    if (!STRIP) return;
    document.querySelectorAll(STRIP).forEach(function (n) {
      var t = n.firstChild;
      if (t && t.nodeType === 3 && EMOJI.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(EMOJI, '');
    });
  }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function apply() {
    var b = document.body;
    b.classList.add('moa-ui');
    b.classList.toggle('moa-teacher', !isStudent);
    document.documentElement.style.setProperty('--moa-app', COLOR);
    var header = document.querySelector('header');
    if (header && !header.querySelector('.moa-wordmark')) {
      var wm = el('div', 'moa-wordmark', '<i></i>MOA FORMULA');
      wm.setAttribute('aria-label', 'MOA FORMULA');
      header.insertBefore(wm, header.firstChild);
    }
    if (header && !isStudent && !header.querySelector('.moa-head-right')) {
      var right = el('div', 'moa-head-right');
      var hub = document.querySelector('.moa-hubbar a');
      if (hub && hub.style.display !== 'none') {
        var a = el('a', 'moa-lock', '허브');
        a.href = hub.getAttribute('href');
        right.appendChild(a);
      }
      header.appendChild(right);
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#FFFFFF');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  new MutationObserver(function () { if (!document.querySelector('header .moa-wordmark')) apply(); strip(); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
