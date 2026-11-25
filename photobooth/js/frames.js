// FOTO FOTO — frames.js: 17 desain frame digambar dengan Canvas
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const resolve = (v, o) => (typeof v === 'function' ? v(o) : v);
  const fill = (col) => (c, W, H) => { c.fillStyle = col; c.fillRect(0, 0, W, H); };

  function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function heart(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, s * 0.6);
    c.bezierCurveTo(-s * 1.3, -s * 0.2, -s * 0.6, -s * 1.1, 0, -s * 0.4);
    c.bezierCurveTo(s * 0.6, -s * 1.1, s * 1.3, -s * 0.2, 0, s * 0.6); c.fill(); c.restore();
  }
  function star(c, x, y, r, col) {
    c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, d = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
    c.closePath(); c.fill(); c.restore();
  }
  function burst(c, x, y, r, col, stroke) {
    c.save(); c.translate(x, y); c.beginPath();
    for (let i = 0; i < 32; i++) { const a = (i * Math.PI) / 16, d = i % 2 ? r * 0.72 : r; c.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
    c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = stroke; c.stroke(); c.restore();
  }
  function smiley(c, x, y, r, bg, fg) {
    c.fillStyle = bg; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = fg;
    [-0.35, 0.35].forEach((k) => { c.beginPath(); c.arc(x + r * k, y - r * 0.2, r * 0.1, 0, TAU); c.fill(); });
    c.strokeStyle = fg; c.lineWidth = r * 0.1; c.beginPath(); c.arc(x, y + r * 0.05, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  }
  function cloud(c, x, y, s) {
    c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath();
    c.arc(x, y, s, 0, TAU); c.arc(x + s * 1.1, y - s * 0.3, s * 1.2, 0, TAU); c.arc(x + s * 2.3, y, s, 0, TAU); c.fill();
  }
  function dots(c, W, H, col, gap, r) {
    c.fillStyle = col;
    for (let y = gap / 2, row = 0; y < H; y += gap, row++)
      for (let x = row % 2 ? gap : gap / 2; x < W; x += gap) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  }
  function grain(c, W, H, col, n, seed) { const r = rng(seed); c.fillStyle = col; for (let i = 0; i < n; i++) c.fillRect(r() * W, r() * H, 2, 2); }
  function margins(fn) { for (let i = 0; i < 4; i++) { const y = 60 + i * 405 + 187; fn(25, y, i); fn(575, y, i); } }
  function lum(hex) { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
  function gradient(c, W, H, a, b) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); }

  const LAY = {
    strip: { W: 600, H: 1800, slots: () => [0, 1, 2, 3].map((i) => ({ x: 50, y: 60 + i * 405, w: 500, h: 375 })) },
    grid: { W: 1240, H: 1500, slots: () => [0, 1, 2, 3].map((i) => ({ x: 80 + (i % 2) * 560, y: 190 + Math.floor(i / 2) * 560, w: 520, h: 520 })) }
  };
  const SG = '"Space Grotesk",sans-serif', PF = '"Playfair Display",serif';
  const customCol = (o) => o.custom || '#222222';
  const customInk = (o) => (lum(customCol(o)) > 0.6 ? '#111111' : '#ffffff');

  const FRAMES = [
    { id: 'classic-black', name: 'Classic Black', cat: 'Classic Photostrip', layout: 'strip', bg: fill('#0b0b0b'), slot: {}, text: { color: '#fff', font: '700 44px ' + SG, ls: '8px' }, caption: 'FOTO FOTO' },
    { id: 'classic-white', name: 'Classic White', cat: 'Classic Photostrip', layout: 'strip', bg: fill('#ffffff'), slot: { border: 2, bc: '#111' },
      over: (c, W, H) => { c.strokeStyle = '#ddd'; c.lineWidth = 4; c.strokeRect(2, 2, W - 4, H - 4); },
      text: { color: '#111', font: '700 44px ' + SG, ls: '8px' }, caption: 'FOTO FOTO' },
    { id: 'vintage-film', name: 'Vintage Film', cat: 'Vintage', layout: 'strip',
      bg: (c, W, H) => { fill('#3b2a1e')(c, W, H); grain(c, W, H, 'rgba(255,220,160,.12)', 900, 3); }, slot: { border: 6, bc: '#e8d9b5' },
      over: (c, W, H) => { c.fillStyle = '#e8d9b5'; for (let y = 20; y < H - 20; y += 64) { rr(c, 12, y, 20, 32, 5); c.fill(); rr(c, W - 32, y, 20, 32, 5); c.fill(); } },
      text: { color: '#e8d9b5', font: 'italic 400 48px ' + PF }, caption: 'Kodak 400' },
    { id: 'vintage-cream', name: 'Vintage Cream', cat: 'Vintage', layout: 'strip',
      bg: (c, W, H) => { fill('#efe4cc')(c, W, H); grain(c, W, H, 'rgba(120,90,40,.18)', 700, 5); }, slot: { border: 10, bc: '#fffaf0', shadow: true },
      over: (c, W, H) => { c.strokeStyle = '#8a6d3b'; c.lineWidth = 3; c.strokeRect(16, 16, W - 32, H - 32); c.lineWidth = 1; c.strokeRect(26, 26, W - 52, H - 52); },
      text: { color: '#6b4f2a', font: 'italic 400 50px ' + PF }, caption: 'Memories' },
    { id: 'bw-noir', name: 'Noir Stripes', cat: 'Black & White', layout: 'strip',
      bg: (c, W, H) => { fill('#fff')(c, W, H); c.strokeStyle = '#e2e2e2'; c.lineWidth = 14; for (let x = -H; x < W; x += 44) { c.beginPath(); c.moveTo(x, H); c.lineTo(x + H, 0); c.stroke(); } },
      slot: { border: 14, bc: '#000' }, text: { color: '#000', font: '700 54px ' + PF, ls: '10px' }, caption: 'NOIR' },
    { id: 'minimal-white', name: 'Minimal White', cat: 'Minimalist', layout: 'strip', bg: fill('#fafafa'), slot: {},
      over: (c, W) => { c.fillStyle = '#111'; c.fillRect(W / 2 - 30, 1672, 60, 2); },
      text: { color: '#111', font: '400 32px "Inter",sans-serif', ls: '12px' }, caption: 'FOTO FOTO' },
    { id: 'minimal-sand', name: 'Minimal Sand', cat: 'Minimalist', layout: 'strip', bg: fill('#e9e4dc'), slot: { radius: 22 }, text: { color: '#5a5248', font: 'italic 400 46px ' + PF }, caption: 'moments' },
    { id: 'cute-pink', name: 'Cute Pink', cat: 'Cute & Aesthetic', layout: 'strip',
      bg: (c, W, H) => { gradient(c, W, H, '#ffc2dc', '#ffd9e8'); dots(c, W, H, 'rgba(255,255,255,.55)', 40, 6); }, slot: { border: 10, bc: '#fff', radius: 28 },
      over: (c) => margins((x, y, i) => (i % 2 ? heart(c, x, y, 14, '#ff4f93') : star(c, x, y, 15, '#ffb703'))),
      text: { color: '#e0457b', font: '700 56px ' + SG }, caption: 'cute.' },
    { id: 'cute-sky', name: 'Cute Sky', cat: 'Cute & Aesthetic', layout: 'strip',
      bg: (c, W, H) => { gradient(c, W, H, '#a9d8ff', '#e8f5ff'); [[70, 30, 22], [380, 200, 26], [60, 620, 24], [400, 1000, 28], [80, 1420, 24], [380, 1700, 20]].forEach((p) => cloud(c, p[0], p[1], p[2])); },
      slot: { border: 10, bc: '#fff', radius: 30 }, over: (c) => margins((x, y) => star(c, x, y, 15, '#ffd166')),
      text: { color: '#3b82c4', font: '700 54px ' + SG }, caption: 'so happy' },
    { id: 'scrapbook', name: 'Scrapbook Kraft', cat: 'Scrapbook', layout: 'strip',
      bg: (c, W, H) => { fill('#d9bb8e')(c, W, H); grain(c, W, H, 'rgba(110,70,30,.16)', 1200, 9); },
      slot: { border: 14, bc: '#fff', shadow: true }, rot: [-2.5, 2, -1.5, 2.5],
      over: (c, W) => {
        [-6, 5, -4, 6].forEach((deg, i) => { c.save(); c.translate(W / 2 + (i % 2 ? 90 : -90), 60 + i * 405 - 6); c.rotate((deg * Math.PI) / 180); c.fillStyle = 'rgba(255,238,170,.82)'; c.fillRect(-70, -18, 140, 36); c.restore(); });
        star(c, 60, 1725, 22, '#e63946'); heart(c, 540, 1722, 20, '#e63946');
      },
      text: { color: '#5b3b1d', font: 'italic 700 50px ' + PF }, caption: 'our scrapbook' },
    { id: 'couple-red', name: 'Couple Red', cat: 'Couple', layout: 'strip',
      bg: (c, W, H) => { gradient(c, W, H, '#c1122f', '#7d0a1f'); const r = rng(11); for (let i = 0; i < 40; i++) heart(c, r() * W, r() * H, 16 + r() * 14, 'rgba(255,255,255,.12)'); },
      slot: { border: 8, bc: '#fff', radius: 14 }, over: (c) => { heart(c, 120, 1725, 28, '#ffb3c1'); heart(c, 480, 1725, 28, '#ffb3c1'); },
      text: { color: '#fff', font: 'italic 400 50px ' + PF }, caption: 'you & me' },
    { id: 'friend-yellow', name: 'Best Friends', cat: 'Friendship', layout: 'strip',
      bg: (c, W, H) => { fill('#ffd23f')(c, W, H); c.fillStyle = '#ffe071'; for (let x = 0; x < W; x += 60) c.fillRect(x, 0, 30, H); },
      slot: { border: 10, bc: '#111', radius: 14 }, over: (c) => { margins((x, y) => star(c, x, y, 15, '#111')); smiley(c, 545, 1725, 30, '#111', '#ffd23f'); },
      text: { color: '#111', font: '700 40px ' + SG }, caption: 'BEST FRIENDS' },
    { id: 'newspaper', name: 'The Foto Times', cat: 'Newspaper / Magazine', layout: 'grid',
      bg: (c, W, H) => { fill('#ece8dd')(c, W, H); grain(c, W, H, 'rgba(60,50,30,.15)', 1500, 13); }, slot: { border: 3, bc: '#111' },
      over: (c, W) => {
        c.fillStyle = '#111'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.font = '700 78px ' + PF; c.fillText('THE FOTO TIMES', W / 2, 100);
        c.fillRect(80, 122, W - 160, 4); c.fillRect(80, 132, W - 160, 1.5);
        c.font = '400 22px "Inter",sans-serif';
        c.fillText(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), W / 2, 164);
        const r = rng(7), cw = (W - 220) / 3; c.fillStyle = '#8c887d';
        for (let k = 0; k < 3; k++) for (let y = 1352; y < 1480; y += 22) c.fillRect(80 + k * (cw + 30), y, cw * (0.6 + r() * 0.4), 6);
      },
      text: { color: '#111', font: '700 44px ' + PF, y: 1316 }, caption: 'MOMEN HARI INI' },
    { id: 'polaroid-grid', name: 'Polaroid Set', cat: 'Polaroid', layout: 'grid', bg: (c, W, H) => gradient(c, W, H, '#f6e3d4', '#f1cfd9'),
      slot: { card: { color: '#fff', inset: [18, 18, 18, 88], label: true }, shadow: true }, rot: [-3, 2, 2, -2],
      text: { color: '#8a5a6b', font: 'italic 400 54px ' + PF }, caption: 'FOTO FOTO' },
    { id: 'retro-pop', name: 'Retro Pop', cat: 'Retro', layout: 'strip',
      bg: (c, W, H) => { gradient(c, W, H, '#1d4ed8', '#1e3a8a'); dots(c, W, H, 'rgba(255,255,255,.12)', 30, 6); }, slot: { border: 10, bc: '#fff' }, rot: [-1, 1, -1, 1],
      over: (c) => {
        burst(c, 525, 1720, 70, '#ffd400', '#e11d48');
        c.save(); c.translate(525, 1720); c.rotate(-0.17); c.fillStyle = '#e11d48'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 34px ' + SG; c.fillText('POP!', 0, 0); c.restore();
        heart(c, 25, 1720, 14, '#ff4d6d');
      },
      text: { color: '#ffd400', font: '700 40px ' + SG }, caption: 'GOOD TIMES' },
    { id: 'retro-70s', name: 'Retro 70s', cat: 'Retro', layout: 'strip',
      bg: (c, W, H) => { fill('#fdf0d5')(c, W, H); ['#d62828', '#f77f00', '#fcbf49', '#eae2b7'].forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.arc(0, H, 330 - k * 60, 0, TAU); c.fill(); c.beginPath(); c.arc(W, 0, 300 - k * 55, 0, TAU); c.fill(); }); },
      slot: { border: 8, bc: '#3d2c1e', radius: 36 }, text: { color: '#3d2c1e', font: 'italic 700 50px ' + PF }, caption: 'groovy' },
    { id: 'custom', name: 'Custom Color', cat: 'Custom Frame', layout: 'strip', bg: (c, W, H, o) => fill(customCol(o))(c, W, H),
      slot: { border: 10, bc: customInk, radius: 8 },
      over: (c, W, H, o) => { c.save(); c.setLineDash([4, 12]); c.strokeStyle = customInk(o); c.lineWidth = 3; c.strokeRect(14, 14, W - 28, H - 28); c.restore(); },
      text: { color: customInk, font: '700 44px ' + SG, ls: '8px' }, caption: 'FOTO FOTO' }
  ];

  // foto contoh (hanya untuk preview frame)
  const samples = [];
  function sample(i) {
    if (samples[i]) return samples[i];
    const cv = document.createElement('canvas'); cv.width = cv.height = 400;
    const c = cv.getContext('2d'), h = [340, 200, 45, 150][i % 4];
    const g = c.createLinearGradient(0, 0, 400, 400);
    g.addColorStop(0, 'hsl(' + h + ',60%,82%)'); g.addColorStop(1, 'hsl(' + (h + 30) + ',50%,62%)');
    c.fillStyle = g; c.fillRect(0, 0, 400, 400);
    [[140, '#3a2a22'], [270, '#1f1f1f']].forEach((p) => {
      c.fillStyle = '#2b2b2f'; c.beginPath(); c.ellipse(p[0], 430, 90, 120, 0, 0, TAU); c.fill();
      c.fillStyle = '#f1c9a5'; c.beginPath(); c.ellipse(p[0], 230, 50, 60, 0, 0, TAU); c.fill();
      c.fillStyle = p[1]; c.beginPath(); c.ellipse(p[0], 192, 56, 38, 0, Math.PI, TAU); c.fill();
    });
    return (samples[i] = cv);
  }

  // gambar foto ke area slot (crop "cover" + zoom/geser)
  function cover(c, img, x, y, w, h, adj) {
    adj = adj || {};
    const iw = img.width, ih = img.height, s = Math.max(w / iw, h / ih) * (adj.zoom || 1), sw = w / s, sh = h / s;
    const sx = Math.min(iw - sw, Math.max(0, (iw - sw) / 2 - (adj.dx || 0) * iw));
    const sy = Math.min(ih - sh, Math.max(0, (ih - sh) / 2 - (adj.dy || 0) * ih));
    c.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function drawSlot(c, f, s, i, img, o) {
    const w = s.w, h = s.h, st = f.slot || {}, bw = st.border || 0, r = st.radius || 0;
    let px = 0, py = 0, pw = w, ph = h;
    c.save();
    if (st.shadow) { c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 22; c.shadowOffsetY = 8; }
    if (st.card) {
      const n = st.card.inset; c.fillStyle = st.card.color; rr(c, 0, 0, w, h, 6); c.fill();
      px = n[0]; py = n[1]; pw = w - n[0] - n[2]; ph = h - n[1] - n[3];
    } else if (bw) { c.fillStyle = resolve(st.bc, o); rr(c, -bw, -bw, w + bw * 2, h + bw * 2, r + bw); c.fill(); }
    c.restore();
    c.save(); rr(c, px, py, pw, ph, st.card ? 0 : r); c.clip();
    const src = img || (o.sample ? sample(i) : null);
    if (src) cover(c, src, px, py, pw, ph, o.adjust && o.adjust[i]); else { c.fillStyle = '#c8c8c8'; c.fillRect(px, py, pw, ph); }
    c.restore();
    if (st.card && st.card.label) {
      c.fillStyle = '#8a8a8a'; c.font = 'italic 400 30px ' + PF; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('foto ' + (i + 1), w / 2, h - 44);
    }
  }

  const get = (id) => FRAMES.find((f) => f.id === id) || FRAMES[0];

  // images: array 4 canvas/img atau null. opts: {scale, caption, custom, sample, adjust}
  function render(canvas, id, images, opts) {
    const o = opts || {}, f = get(id), L = LAY[f.layout], k = o.scale || 1;
    canvas.width = Math.round(L.W * k); canvas.height = Math.round(L.H * k);
    const c = canvas.getContext('2d'); c.scale(k, k);
    f.bg(c, L.W, L.H, o);
    L.slots().forEach((s, i) => {
      c.save(); c.translate(s.x + s.w / 2, s.y + s.h / 2); c.rotate((((f.rot && f.rot[i]) || 0) * Math.PI) / 180); c.translate(-s.w / 2, -s.h / 2);
      drawSlot(c, f, s, i, images && images[i], o); c.restore();
    });
    if (f.over) f.over(c, L.W, L.H, o);
    const t = f.text, text = o.caption != null && o.caption !== '' ? o.caption : f.caption;
    c.save(); c.fillStyle = resolve(t.color, o); c.font = t.font; c.textAlign = 'center'; c.textBaseline = 'middle';
    if ('letterSpacing' in c) c.letterSpacing = t.ls || '0px';
    c.fillText(text, L.W / 2, t.y || L.H - (f.layout === 'strip' ? 75 : 110));
    c.restore();
    return canvas;
  }

  const FONTS = ['700 40px "Playfair Display"', 'italic 400 40px "Playfair Display"', '700 40px "Space Grotesk"', '400 40px "Inter"'];
  const loadFonts = () => (document.fonts ? Promise.all(FONTS.map((f) => document.fonts.load(f))).catch(() => {}) : Promise.resolve());

  function mount(el, id, opts) {
    const cv = document.createElement('canvas'); el.innerHTML = ''; el.appendChild(cv);
    const draw = () => render(cv, id, null, Object.assign({ sample: true, scale: 0.5 }, opts));
    draw(); loadFonts().then(draw); return cv;
  }

  window.FotoFrames = {
    all: () => FRAMES, get, render, mount, loadFonts,
    categories: ['Classic Photostrip', 'Vintage', 'Black & White', 'Minimalist', 'Cute & Aesthetic', 'Scrapbook', 'Couple', 'Friendship', 'Newspaper / Magazine', 'Polaroid', 'Retro', 'Custom Frame']
  };
})();
