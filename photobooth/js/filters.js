// FOTO FOTO — filters.js
// Filter dihitung per-piksel di canvas, jadi benar-benar masuk ke hasil foto (juga di Safari/iPhone).
// Preview live memakai CSS filter dengan parameter yang sama.
(function () {
  'use strict';
  const ID = { b: 1, c: 1, s: 1, g: 0, sep: 0, h: 0, fade: 0, glow: 0 };
  const LIST = [
    { id: 'normal', name: 'Normal', p: {} },
    { id: 'bw', name: 'Black & White', p: { g: 1, c: 1.15 } },
    { id: 'vintage', name: 'Vintage', p: { sep: .4, c: .95, s: .85, b: 1.05, fade: .25 } },
    { id: 'retro', name: 'Retro', p: { sep: .25, h: -12, s: 1.3, c: 1.1, fade: .12 } },
    { id: 'warm', name: 'Warm', p: { sep: .3, s: 1.2, b: 1.05, h: -8 } },
    { id: 'cool', name: 'Cool', p: { sep: .3, h: 170, s: 1.1, b: 1.05 } },
    { id: 'sepia', name: 'Sepia', p: { sep: 1 } },
    { id: 'film', name: 'Film', p: { c: 1.15, s: .9, fade: .2, sep: .15 } },
    { id: 'soft', name: 'Soft', p: { b: 1.08, c: .9, s: .95, glow: .35 } },
    { id: 'bright', name: 'Bright', p: { b: 1.25, c: 1.05, s: 1.1 } },
    { id: 'contrast', name: 'Contrast', p: { c: 1.4, s: 1.1 } },
    { id: 'dreamy', name: 'Dreamy', p: { b: 1.1, c: .88, s: 1.15, glow: .6, fade: .08 } }
  ];
  const mul = (A, B) => { const R = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]); return R; };
  function mat(p) {
    const u = 1 - p.g, g = [.2126 + .7874 * u, .7152 - .7152 * u, .0722 - .0722 * u, .2126 - .2126 * u, .7152 + .2848 * u, .0722 - .0722 * u, .2126 - .2126 * u, .7152 - .7152 * u, .0722 + .9278 * u];
    const v = 1 - p.sep, se = [.393 + .607 * v, .769 - .769 * v, .189 - .189 * v, .349 - .349 * v, .686 + .314 * v, .168 - .168 * v, .272 - .272 * v, .534 - .534 * v, .131 + .869 * v];
    const a = p.h * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
    const h = [.213 + co * .787 - si * .213, .715 - co * .715 - si * .715, .072 - co * .072 + si * .928, .213 - co * .213 + si * .143, .715 + co * .285 + si * .14, .072 - co * .072 - si * .283, .213 - co * .213 - si * .787, .715 - co * .715 + si * .715, .072 + co * .928 + si * .072];
    const s = p.s, sa = [.213 + .787 * s, .715 - .715 * s, .072 - .072 * s, .213 - .213 * s, .715 + .285 * s, .072 - .072 * s, .213 - .213 * s, .715 - .715 * s, .072 + .928 * s];
    return mul(sa, mul(h, mul(se, g)));
  }
  window.FotoFilters = {
    list: LIST,
    // parameter akhir = filter (dikali intensitas 0..1) + penyesuaian brightness/contrast/saturation
    params(id, k, adj) {
      const f = LIST.find(x => x.id === id) || LIST[0], p = {};
      for (const q in ID) p[q] = ID[q] + ((f.p[q] != null ? f.p[q] : ID[q]) - ID[q]) * k;
      if (adj) { p.b *= adj.b; p.c *= adj.c; p.s *= adj.s; }
      return p;
    },
    css(p) { return `grayscale(${p.g}) sepia(${p.sep}) hue-rotate(${p.h}deg) saturate(${p.s}) brightness(${p.b}) contrast(${p.c})`; },
    // selalu mengembalikan canvas baru
    apply(src, p, maxW) {
      const sc = maxW && src.width > maxW ? maxW / src.width : 1;
      const w = Math.round(src.width * sc), h = Math.round(src.height * sc);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d'); x.drawImage(src, 0, 0, w, h);
      const flat = p.b === 1 && p.c === 1 && p.s === 1 && !p.g && !p.sep && !p.h && !p.fade;
      if (!flat) {
        const d = x.getImageData(0, 0, w, h), a = d.data, M = mat(p), b = p.b, c = p.c, f = p.fade;
        for (let i = 0; i < a.length; i += 4) {
          const r = a[i], g = a[i + 1], bl = a[i + 2];
          let R = (M[0] * r + M[1] * g + M[2] * bl) * b, G = (M[3] * r + M[4] * g + M[5] * bl) * b, B = (M[6] * r + M[7] * g + M[8] * bl) * b;
          R = (R - 128) * c + 128; G = (G - 128) * c + 128; B = (B - 128) * c + 128;
          if (f) { R = R * (1 - f) + f * 46; G = G * (1 - f) + f * 46; B = B * (1 - f) + f * 46; }
          a[i] = R; a[i + 1] = G; a[i + 2] = B;
        }
        x.putImageData(d, 0, 0);
      }
      if (p.glow > 0) {
        const t = document.createElement('canvas'); t.width = Math.max(8, w >> 3); t.height = Math.max(8, h >> 3);
        t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height);
        x.save(); x.globalAlpha = p.glow * .6; x.globalCompositeOperation = 'screen'; x.imageSmoothingQuality = 'high';
        x.drawImage(t, 0, 0, w, h); x.restore();
      }
      return cv;
    }
  };
})();
