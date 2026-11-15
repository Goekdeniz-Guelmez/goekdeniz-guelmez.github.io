// Velora website: stippled-V mark (assembling animation + sparkle) and the mobile menu.
// Geometry follows VeloraDesign's MarkGeometry: two stippled strokes meeting low, a soft ground line,
// and one four-point sparkle above. Deterministic (seeded), so every load draws the same mark.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  function points() {
    var r = rng(7), pts = [], i, t, a, b;
    var arms = [[[30, 36], [58, 84]], [[92, 35], [60, 84]]];
    for (i = 0; i < 170; i++) {
      a = arms[i % 2]; t = r();
      var w = 5.5 * (1 - t * 0.55);             // strokes taper toward the point
      pts.push({ x: a[0][0] + (a[1][0] - a[0][0]) * t + (r() - .5) * w,
                 y: a[0][1] + (a[1][1] - a[0][1]) * t + (r() - .5) * w,
                 r: .45 + r() * .95, o: .55 + r() * .45 });
    }
    for (i = 0; i < 55; i++) {                  // ground line
      t = r(); b = (r() - .5);
      pts.push({ x: 26 + t * 68, y: 89.5 + b * 3 + Math.abs(t - .5) * 6, r: .48, o: .35 + r() * .4 });
    }
    return pts;
  }

  function draw(el) {
    var animate = el.hasAttribute('data-animate') && !reduce;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 120');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Velora');
    svg.style.width = '100%'; svg.style.height = '100%';
    var fill = el.getAttribute('data-color') || '#FFF4E6';
    var dots = points(), nodes = [], r = rng(99);
    dots.forEach(function (p) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', p.r.toFixed(2)); c.setAttribute('fill', fill);
      var sx = animate ? 60 + (r() - .5) * 140 : p.x, sy = animate ? 60 + (r() - .5) * 140 : p.y;
      c.setAttribute('cx', sx); c.setAttribute('cy', sy);
      c.setAttribute('opacity', animate ? 0 : p.o);
      svg.appendChild(c); nodes.push({ c: c, p: p, sx: sx, sy: sy, d: r() * .6 });
    });
    var spark = document.createElementNS(NS, 'path');
    spark.setAttribute('d', 'M60 17.4Q60.9 23.1 66.6 24Q60.9 24.9 60 30.6Q59.1 24.9 53.4 24Q59.1 23.1 60 17.4Z');
    spark.setAttribute('fill', fill);
    spark.style.transformOrigin = '60px 24px';
    var glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', 60); glow.setAttribute('cy', 24); glow.setAttribute('r', 3.3);
    glow.setAttribute('fill', fill); glow.setAttribute('opacity', .18);
    svg.appendChild(glow); svg.appendChild(spark);
    el.appendChild(svg);
    if (!animate) return;

    spark.style.opacity = 0;
    var start = null, D = 1.9;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(ts) {
      if (start === null) start = ts;
      var s = (ts - start) / 1000, done = true;
      nodes.forEach(function (n) {
        var t = Math.min(1, Math.max(0, (s - n.d) / (D - .6))); if (t < 1) done = false;
        var e = ease(t);
        n.c.setAttribute('cx', (n.sx + (n.p.x - n.sx) * e).toFixed(2));
        n.c.setAttribute('cy', (n.sy + (n.p.y - n.sy) * e).toFixed(2));
        n.c.setAttribute('opacity', (n.p.o * Math.min(1, t * 1.6)).toFixed(2));
      });
      var k = Math.max(0, s - D + .3);           // sparkle pops in, then breathes gently
      spark.style.opacity = Math.min(1, k * 3);
      var sc = k < .35 ? k / .35 * 1.25 : 1 + .08 * Math.sin((s - D) * 2.2);
      spark.style.transform = 'scale(' + sc.toFixed(3) + ') rotate(' + (k < .35 ? (1 - k / .35) * 45 : 0) + 'deg)';
      if (!done || s < D + 30) requestAnimationFrame(frame); // stop breathing after ~30 s
    }
    requestAnimationFrame(frame);
  }

  document.querySelectorAll('[data-mark]').forEach(draw);

  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', open);
  });
})();
