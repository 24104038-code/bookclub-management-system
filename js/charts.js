/* =========================================================
   BOOKCLUB — Tiny vanilla-JS SVG chart helpers
   No chart libraries — just plain SVG built from data.
   ========================================================= */

const BookClubCharts = (function () {

  /* Smooth-ish area/line chart. points: [{label, value}] */
  function lineChart(svgEl, points, opts) {
    opts = opts || {};
    const w = opts.width || 560;
    const h = opts.height || 200;
    const padL = 30, padR = 10, padT = 14, padB = 26;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    const values = points.map(function (p) { return p.value; });
    const max = Math.max.apply(null, values) * 1.15;
    const min = 0;

    const xStep = chartW / (points.length - 1);
    const coords = points.map(function (p, i) {
      const x = padL + i * xStep;
      const y = padT + chartH - ((p.value - min) / (max - min)) * chartH;
      return { x: x, y: y, label: p.label, value: p.value };
    });

    const linePath = coords.map(function (c, i) {
      return (i === 0 ? 'M' : 'L') + c.x.toFixed(1) + ',' + c.y.toFixed(1);
    }).join(' ');

    const areaPath = linePath +
      ' L' + coords[coords.length - 1].x.toFixed(1) + ',' + (padT + chartH) +
      ' L' + coords[0].x.toFixed(1) + ',' + (padT + chartH) + ' Z';

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(function (t) {
      const y = padT + chartH * t;
      return '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (padL + chartW) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)" stroke-width="1"/>';
    }).join('');

    const xLabels = coords.map(function (c) {
      return '<text x="' + c.x.toFixed(1) + '" y="' + (h - 6) + '" font-size="10" fill="var(--ink-soft)" text-anchor="middle">' + c.label + '</text>';
    }).join('');

    const dots = coords.map(function (c) {
      return '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="3.2" fill="var(--shell-green)" />';
    }).join('');

    svgEl.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svgEl.innerHTML =
      '<defs><linearGradient id="lineFade" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--shell-green)" stop-opacity="0.25"/>' +
      '<stop offset="100%" stop-color="var(--shell-green)" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      gridLines +
      '<path d="' + areaPath + '" fill="url(#lineFade)" stroke="none"/>' +
      '<path d="' + linePath + '" fill="none" stroke="var(--shell-green)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots +
      xLabels;
  }

  /* Donut chart. segments: [{label, value, color}] */
  function donutChart(svgEl, segments, opts) {
    opts = opts || {};
    const size = opts.size || 160;
    const r = size / 2 - 14;
    const cx = size / 2, cy = size / 2;
    const total = segments.reduce(function (s, seg) { return s + seg.value; }, 0);

    let angleStart = -90;
    const arcs = segments.map(function (seg) {
      const angle = (seg.value / total) * 360;
      const angleEnd = angleStart + angle;
      const large = angle > 180 ? 1 : 0;
      const x1 = cx + r * Math.cos(Math.PI * angleStart / 180);
      const y1 = cy + r * Math.sin(Math.PI * angleStart / 180);
      const x2 = cx + r * Math.cos(Math.PI * angleEnd / 180);
      const y2 = cy + r * Math.sin(Math.PI * angleEnd / 180);
      const path = '<path d="M' + x1.toFixed(2) + ',' + y1.toFixed(2) +
        ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) + '" ' +
        'fill="none" stroke="' + seg.color + '" stroke-width="22" />';
      angleStart = angleEnd;
      return path;
    }).join('');

    svgEl.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svgEl.innerHTML = arcs;
  }

  return { lineChart: lineChart, donutChart: donutChart };
})();
