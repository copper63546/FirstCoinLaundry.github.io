/* Christmas theme + falling snow for every page.
   It switches itself off at the end of HOLIDAY_END (store's local time), so nothing has to be
   removed after the season - the site simply goes back to its normal look on Jan 1. */
(function () {
  "use strict";
  var HOLIDAY_END = new Date(2027, 0, 1, 0, 0, 0);   // snow + theme run through Dec 31, 2026
  if (new Date() >= HOLIDAY_END) return;

  var root = document.documentElement;
  root.classList.add("xmas");

  var css = [
    /* Christmas colors: candy-cane red buttons and links, evergreen accents */
    "html.xmas{--primary:#c8102e;--primary-ink:#fff;--primary-soft:#fde3e6;--aqua:#1f9d55;--lime:#1f9d55;--lime-ink:#14663a;--sun:#ffcf4d}",
    "@media (prefers-color-scheme:dark){html.xmas{--primary:#ff5a6e;--primary-ink:#1a0508;--primary-soft:#3a1720;--aqua:#3ecf7a;--lime:#3ecf7a;--lime-ink:#7be3a6}}",
    /* string of lights under the header */
    "html.xmas header.top{position:relative}",
    ".xmas-lights{position:absolute;left:0;right:0;bottom:-9px;height:18px;pointer-events:none;overflow:hidden;z-index:2}",
    ".xmas-lights::before{content:'';position:absolute;left:0;right:0;top:3px;border-top:2px solid #2d5a3a;border-radius:50%}",
    ".xmas-lights i{position:absolute;top:4px;width:8px;height:12px;border-radius:50% 50% 50% 50%/40% 40% 60% 60%;animation:xmas-twinkle 1.6s ease-in-out infinite}",
    "@keyframes xmas-twinkle{0%,100%{opacity:1;filter:brightness(1.15)}50%{opacity:.45;filter:brightness(.8)}}",
    /* greeting strip */
    ".xmas-banner{background:linear-gradient(90deg,#14663a,#c8102e 50%,#14663a);color:#fff;text-align:center;font-weight:700;font-size:.95rem;padding:9px 16px 8px;letter-spacing:.01em}",
    ".xmas-banner span{display:inline-block}",
    /* snow layer: never blocks taps or clicks */
    ".xmas-snow{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60}",
    "@media (prefers-reduced-motion:reduce){.xmas-lights i{animation:none}}",
    "@media print{.xmas-snow,.xmas-lights,.xmas-banner{display:none!important}}"
  ].join("\n");
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function decorate() {
    var header = document.querySelector("header.nav, header.top, header");
    if (header) {
      var lights = document.createElement("div");
      lights.className = "xmas-lights";
      lights.setAttribute("aria-hidden", "true");
      var colors = ["#ff3b3b", "#ffd23f", "#2ecc71", "#3fa9ff", "#ff7ad9"];
      for (var i = 0; i < 60; i++) {
        var b = document.createElement("i");
        var c = colors[i % colors.length];
        b.style.left = (i * 2.5 + 0.6) + "%";
        b.style.background = c;
        b.style.boxShadow = "0 0 6px 1px " + c;
        b.style.animationDelay = (-(i % 5) * 0.32) + "s";
        lights.appendChild(b);
      }
      header.appendChild(lights);

      var banner = document.createElement("div");
      banner.className = "xmas-banner";
      banner.innerHTML = "<span>\u{1F384} Merry Christmas &amp; Happy Holidays from First Coin Laundry!</span> " +
                         "<span>Open 24/7 all season ❄️</span>";
      header.parentNode.insertBefore(banner, header.nextSibling);
    }
    startSnow();
  }

  function startSnow() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var canvas = document.createElement("canvas");
    canvas.className = "xmas-snow";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = 1, w = 0, h = 0, flakes = [];

    function flake(top) {
      var r = 1.2 + Math.random() * 2.8;
      return { x: Math.random() * w, y: top ? -10 : Math.random() * h, r: r,
               vy: 0.35 + r * 0.28 + Math.random() * 0.3, sway: Math.random() * 6.28,
               swaySpeed: 0.008 + Math.random() * 0.012, a: 0.55 + Math.random() * 0.4 };
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var want = Math.round(Math.min(160, Math.max(45, w * h / 9000)));
      while (flakes.length < want) flakes.push(flake(false));
      flakes.length = want;
    }
    resize();
    window.addEventListener("resize", resize);

    var lastCheck = 0;
    function frame(t) {
      if (t - lastCheck > 60000) {            // page left open past New Year's Eve: let it stop
        lastCheck = t;
        if (new Date() >= HOLIDAY_END) { canvas.remove(); return; }
      }
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.sway += f.swaySpeed;
        f.y += f.vy;
        f.x += Math.sin(f.sway) * 0.5;
        if (f.y > h + 10) { flakes[i] = flake(true); continue; }
        if (f.x > w + 10) f.x = -10; else if (f.x < -10) f.x = w + 10;
        // soft blue rim so the flakes still show on the light background
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r + 0.9, 0, 6.2832);
        ctx.fillStyle = "rgba(110,140,190," + (f.a * 0.35) + ")";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.2832);
        ctx.fillStyle = "rgba(255,255,255," + f.a + ")";
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
})();
