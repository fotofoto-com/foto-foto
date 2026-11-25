// FOTO FOTO — editor.js (gabungkan foto + filter + frame + stiker menjadi satu gambar)
(function () {
  'use strict';
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  window.FotoEditor = {
    // full=true memakai foto resolusi penuh (untuk download), false memakai salinan kecil (untuk preview)
    compose(cv, S, scale, full) {
      const p = FotoFilters.params(S.filter, S.intensity / 100, { b: S.bri / 100, c: S.con / 100, s: S.sat / 100 });
      const imgs = S.photos.map((c, i) => c ? FotoFilters.apply(full ? c : S.small[i], p) : null);
      FotoFrames.render(cv, S.frame, imgs, { scale, custom: S.custom, caption: S.caption, adjust: S.adjust });
      const c = cv.getContext('2d');
      c.textAlign = 'center'; c.textBaseline = 'middle';
      S.stickers.forEach(s => {
        c.font = Math.round(s.size * cv.width) + 'px ' + EMOJI_FONT;
        c.fillText(s.e, s.x * cv.width, s.y * cv.height);
      });
      return cv;
    }
  };
})();
