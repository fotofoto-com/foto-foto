// FOTO FOTO — studio.js (alur: pilih frame → kamera/countdown/retake → edit → simpan)
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const N = 4, wait = ms => new Promise(r => setTimeout(r, ms));
  const S = {
    frame: 'classic-black', custom: '#222222',
    photos: Array(N).fill(null), small: Array(N).fill(null),
    filter: 'normal', intensity: 100, bri: 100, con: 100, sat: 100,
    caption: '', adjust: [], stickers: [], sel: -1, mirror: true, secs: 3, ph: 0, saved: false
  };
  for (let i = 0; i < N; i++) S.adjust.push({ zoom: 1, dx: 0, dy: 0 });
  let step = 1, run = 0, busy = false, tt, raf;

  const params = () => FotoFilters.params(S.filter, S.intensity / 100, { b: S.bri / 100, c: S.con / 100, s: S.sat / 100 });
  const isGrid = () => FotoFrames.get(S.frame).layout === 'grid';

  function toast(m, link) {
    const t = $('#toast'); t.textContent = m;
    if (link) { const a = document.createElement('a'); a.href = link.href; a.textContent = link.text; t.append(' ', a); }
    t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 4500);
  }
  function chips(el, list, isOn, fn) {
    el.innerHTML = '';
    list.forEach(it => {
      const b = document.createElement('button'); b.className = 'chip' + (isOn(it) ? ' on' : ''); b.textContent = it.name; b.dataset.id = it.id;
      b.onclick = () => fn(it); el.append(b);
    });
  }
  const mark = (el, id) => $$(el + ' .chip').forEach(c => c.classList.toggle('on', c.dataset.id === id));
  function shrink(c, w) {
    if (c.width <= w) return c;
    const o = document.createElement('canvas'); o.width = w; o.height = Math.round(c.height * w / c.width);
    o.getContext('2d').drawImage(c, 0, 0, o.width, o.height); return o;
  }

  // ---------- navigasi langkah ----------
  function go(n) {
    if (n > 1 && busy) return;
    if (n === 3 && S.photos.some(p => !p)) return toast('Ambil semua 4 foto dulu.');
    step = n;
    [1, 2, 3].forEach(i => $('#s' + i).hidden = i !== n);
    $$('#stepper button').forEach(b => b.classList.toggle('on', +b.dataset.go === n));
    if (n !== 2) { run++; busy = false; FotoCamera.stop(); setCamUI(false); }
    if (n === 2) { document.documentElement.style.setProperty('--ar', isGrid() ? '1 / 1' : '4 / 3'); renderSlots(); ui(); }
    if (n === 3) { syncEdit(); draw(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- langkah 1: frame ----------
  function selectFrame(id) {
    S.frame = id; S.saved = false;
    mark('#framePick', id); mark('#frameChips', id);
    $('#customRow').hidden = id !== 'custom'; $('#customRow3').hidden = id !== 'custom';
    if (step === 3) draw();
  }
  function setCustom(v) {
    S.custom = v; S.saved = false; $('#customColor').value = v; $('#customColor3').value = v;
    const w = $('#framePick [data-id="custom"] .fc'); if (w) FotoFrames.mount(w, 'custom', { scale: .3, custom: v });
    draw();
  }
  function buildFrames(cat) {
    const box = $('#framePick'); box.innerHTML = '';
    FotoFrames.all().filter(f => !cat || f.cat === cat).forEach(f => {
      const b = document.createElement('button'); b.className = 'fp' + (f.id === S.frame ? ' on' : ''); b.dataset.id = f.id;
      const w = document.createElement('div'); w.className = 'fc';
      const s = document.createElement('span'); s.textContent = f.name;
      b.append(w, s); FotoFrames.mount(w, f.id, { scale: .3, custom: S.custom });
      b.onclick = () => selectFrame(f.id); box.append(b);
    });
  }

  // ---------- langkah 2: kamera ----------
  const setCamUI = on => { $('#camOff').hidden = on; $('#live').hidden = !on; $('#video').style.display = on ? 'block' : 'none'; };
  const liveFilter = () => { $('#video').style.filter = FotoFilters.css(params()); };
  const applyMirror = () => { $('#video').style.transform = S.mirror ? 'scaleX(-1)' : 'none'; };

  function camErr(e) {
    const m = {
      NotAllowedError: 'Izin kamera ditolak. Klik ikon gembok di address bar, izinkan Kamera, lalu muat ulang halaman.',
      NotFoundError: 'Kamera tidak ditemukan di perangkat ini.',
      NotReadableError: 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.',
      OverconstrainedError: 'Kamera yang dipilih tidak tersedia. Pilih kamera lain.',
      INSECURE: 'Kamera hanya bisa dipakai lewat HTTPS atau localhost. Jika dibuka dari Instagram/WhatsApp, buka lewat Chrome atau Safari.'
    };
    toast(m[e.name] || m[e.message] || 'Kamera gagal dibuka: ' + e.message); return false;
  }
  async function startCam(id) {
    try { await FotoCamera.start($('#video'), id); } catch (e) { return camErr(e); }
    const st = FotoCamera.settings();
    if (st.facingMode === 'environment') { S.mirror = false; $('#mirror').checked = false; }
    applyMirror(); setCamUI(true); liveFilter();
    try {
      const d = await FotoCamera.devices(), sel = $('#camSel');
      sel.innerHTML = d.map((x, i) => `<option value="${x.deviceId}">${x.label || 'Kamera ' + (i + 1)}</option>`).join('');
      if (st.deviceId) sel.value = st.deviceId;
      sel.hidden = d.length < 2;
    } catch (e) { /* daftar kamera opsional */ }
    return true;
  }

  const showCount = n => {
    const el = $('#count'); el.hidden = !n; if (!n) return;
    el.textContent = n; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  };
  const setProg = t => { const p = $('#prog'); p.textContent = t; p.hidden = !t; };
  function flash() { const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  function ui() {
    $('#shoot').disabled = busy; $('#cancel').hidden = !busy; $('#retakeAll').disabled = busy;
    $('#toEdit').disabled = busy || S.photos.some(p => !p);
    $$('#slots .chip').forEach(b => b.disabled = busy);
  }

  async function shoot(i, tok) {
    for (let n = S.secs; n > 0; n--) { if (tok !== run) return false; showCount(n); await wait(1000); }
    showCount(0); if (tok !== run) return false;
    flash();
    const c = FotoCamera.grab(S.mirror);
    S.photos[i] = c; S.small[i] = shrink(c, 640); S.adjust[i] = { zoom: 1, dx: 0, dy: 0 }; S.saved = false;
    renderSlots(); return true;
  }
  async function session(list) {
    if (busy) return;
    if (!FotoCamera.stream && !(await startCam($('#camSel').value || undefined))) return;
    const tok = ++run; busy = true; ui();
    for (let k = 0; k < list.length; k++) {
      const i = list[k];
      setProg(list.length > 1 ? `Foto ${i + 1}/${N}` : `Ulangi foto ${i + 1}/${N}`);
      if (!(await shoot(i, tok))) break;
      if (k < list.length - 1) { setProg('Bagus! Siap-siap pose berikutnya…'); await wait(1800); }
    }
    if (tok === run) { busy = false; setProg(''); ui(); }
  }

  function renderSlots() {
    const box = $('#slots'); box.innerHTML = ''; const p = params();
    S.photos.forEach((ph, i) => {
      const d = document.createElement('div'); d.className = 'slot';
      const t = document.createElement('div'); t.className = 'thumb';
      if (ph) t.append(FotoFilters.apply(S.small[i], p, 320)); else t.textContent = i + 1;
      const b = document.createElement('button'); b.className = 'chip'; b.textContent = ph ? 'Ulangi foto ' + (i + 1) : 'Ambil foto ' + (i + 1);
      b.disabled = busy; b.onclick = () => session([i]);
      d.append(t, b); box.append(d);
    });
    ui();
  }

  // ---------- langkah 3: edit ----------
  function draw() {
    if (step !== 3) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const pv = $('#preview'); FotoEditor.compose(pv, S, .6, false);
      pv.classList.toggle('has-st', S.stickers.length > 0);
    });
  }
  function syncEdit() {
    $$('[data-k]').forEach(el => el.value = S[el.dataset.k]);
    $('#caption').value = S.caption; mark('#frameChips', S.frame); mark('#filters3', S.filter);
    $('#customRow3').hidden = S.frame !== 'custom'; $('#customColor3').value = S.custom; selPhoto(S.ph);
  }
  function selPhoto(i) {
    S.ph = i; mark('#photoChips', 'p' + i);
    $$('[data-p]').forEach(el => el.value = S.adjust[i][el.dataset.p]);
  }
  function refresh() {
    mark('#filters2', S.filter); mark('#filters3', S.filter); liveFilter();
    if (step === 2) renderSlots(); if (step === 3) draw();
  }

  async function exportBlob(type, scale) {
    await FotoFrames.loadFonts();
    const cv = document.createElement('canvas'); FotoEditor.compose(cv, S, scale, true);
    return new Promise(r => cv.toBlob(r, type === 'jpg' ? 'image/jpeg' : 'image/png', .95));
  }
  function dlBlob(b, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function save(quiet) {
    if (S.saved) { if (!quiet) toast('Sudah tersimpan di Gallery.', { href: 'gallery.html', text: 'Buka Gallery' }); return; }
    try {
      const blob = await exportBlob('jpg', 2);
      const cv = document.createElement('canvas'); FotoEditor.compose(cv, S, .35, true);
      const thumb = await new Promise(r => cv.toBlob(r, 'image/jpeg', .85));
      await FotoStore.add({ blob, thumb, created: Date.now(), frame: S.frame });
      S.saved = true; toast('Tersimpan di Gallery.', { href: 'gallery.html', text: 'Buka Gallery' });
    } catch (e) { toast('Gagal menyimpan: penyimpanan browser tidak tersedia.'); }
  }

  // ---------- pasang event ----------
  function init() {
    chips($('#catChips'), [{ id: '', name: 'Semua' }].concat(FotoFrames.categories.map(c => ({ id: c, name: c }))), it => !it.id, it => {
      mark('#catChips', it.id); buildFrames(it.id);
    });
    buildFrames('');
    chips($('#frameChips'), FotoFrames.all(), f => f.id === S.frame, f => selectFrame(f.id));
    const fl = FotoFilters.list, onF = f => { S.filter = f.id; S.saved = false; refresh(); };
    chips($('#filters2'), fl, f => f.id === S.filter, onF); chips($('#filters3'), fl, f => f.id === S.filter, onF);
    chips($('#photoChips'), [0, 1, 2, 3].map(i => ({ id: 'p' + i, name: 'Foto ' + (i + 1) })), it => it.id === 'p0', it => selPhoto(+it.id.slice(1)));
    $('#emoji').innerHTML = ['❤️', '⭐', '✨', '😎', '🎀', '🌸', '🔥', '😂', '🥰', '🎉', '☁️', '🦋'].map(e => `<button type="button">${e}</button>`).join('');
    $$('#emoji button').forEach(b => b.onclick = () => { S.stickers.push({ e: b.textContent, x: .5, y: .5, size: .1 }); S.sel = S.stickers.length - 1; S.saved = false; draw(); });

    const q = new URLSearchParams(location.search).get('frame');
    if (q && FotoFrames.all().some(f => f.id === q)) selectFrame(q); else selectFrame(S.frame);

    $$('#stepper button').forEach(b => b.onclick = () => go(+b.dataset.go));
    $('#toCam').onclick = () => go(2); $('#toEdit').onclick = () => go(3); $('#changeFrame').onclick = () => go(1);
    $('#customColor').oninput = e => setCustom(e.target.value); $('#customColor3').oninput = e => setCustom(e.target.value);

    $('#startCam').onclick = () => startCam($('#camSel').value || undefined);
    $('#camSel').onchange = e => startCam(e.target.value);
    $('#mirror').onchange = e => { S.mirror = e.target.checked; applyMirror(); };
    $('#secs').onchange = e => { S.secs = +e.target.value; };
    $('#shoot').onclick = () => {
      const miss = S.photos.map((p, i) => p ? -1 : i).filter(i => i >= 0);
      if (!miss.length) return toast('Semua foto sudah terambil. Pakai “Ulangi foto” untuk mengganti, atau Retake All.');
      session(miss);
    };
    $('#cancel').onclick = () => { run++; busy = false; showCount(0); setProg(''); ui(); };
    $('#retakeAll').onclick = () => {
      S.photos.fill(null); S.small.fill(null); S.saved = false; renderSlots(); session([0, 1, 2, 3]);
    };

    $$('[data-k]').forEach(el => el.addEventListener('input', () => {
      const k = el.dataset.k; S[k] = +el.value; S.saved = false;
      $$('[data-k="' + k + '"]').forEach(o => { o.value = el.value; }); refresh();
    }));
    $$('[data-p]').forEach(el => el.addEventListener('input', () => { S.adjust[S.ph][el.dataset.p] = +el.value; S.saved = false; draw(); }));
    $('#caption').oninput = e => { S.caption = e.target.value; S.saved = false; draw(); };

    $('#stBig').onclick = () => { const s = S.stickers[S.sel]; if (s) { s.size = Math.min(.35, s.size * 1.15); draw(); } };
    $('#stSm').onclick = () => { const s = S.stickers[S.sel]; if (s) { s.size = Math.max(.04, s.size / 1.15); draw(); } };
    $('#stDel').onclick = () => { if (S.sel >= 0) { S.stickers.splice(S.sel, 1); S.sel = S.stickers.length - 1; draw(); } };
    $('#stClr').onclick = () => { S.stickers = []; S.sel = -1; draw(); };

    // seret stiker di preview
    const pv = $('#preview'); let drag = null;
    const np = e => { const r = pv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
    pv.addEventListener('pointerdown', e => {
      const p = np(e); let best = -1, bd = 1e9;
      S.stickers.forEach((s, i) => { const d = Math.hypot((p.x - s.x) * pv.width, (p.y - s.y) * pv.height); if (d < s.size * pv.width * .8 && d < bd) { bd = d; best = i; } });
      if (best >= 0) { S.sel = best; drag = { dx: S.stickers[best].x - p.x, dy: S.stickers[best].y - p.y }; pv.setPointerCapture(e.pointerId); }
    });
    pv.addEventListener('pointermove', e => {
      if (!drag) return; const p = np(e), s = S.stickers[S.sel];
      s.x = Math.min(1, Math.max(0, p.x + drag.dx)); s.y = Math.min(1, Math.max(0, p.y + drag.dy)); S.saved = false; draw();
    });
    ['pointerup', 'pointercancel'].forEach(t => pv.addEventListener(t, () => { drag = null; }));

    $('#dl').onclick = async () => {
      const t = $('#fmt').value; toast('Menyiapkan gambar…');
      dlBlob(await exportBlob(t, 2), `fotofoto-${Date.now()}.${t}`); await save(true);
    };
    $('#saveBtn').onclick = () => save(false);
    $('#fs').onclick = async () => {
      const b = await exportBlob('jpg', 1), u = URL.createObjectURL(b), v = $('#viewer');
      $('#viewImg').src = u; v.showModal(); v.onclose = () => URL.revokeObjectURL(u);
    };
    $('#viewer').addEventListener('click', e => { if (e.target.id === 'viewer') e.target.close(); });
    $('#single').onclick = async () => {
      const p = params(); toast('Mengunduh 4 foto satuan…');
      for (let i = 0; i < N; i++) {
        const c = FotoFilters.apply(S.photos[i], p), b = await new Promise(r => c.toBlob(r, 'image/jpeg', .95));
        dlBlob(b, `fotofoto-foto${i + 1}.jpg`); await wait(500);
      }
    };
    $('#retake').onclick = () => go(2);
    try {
      if (navigator.canShare && navigator.canShare({ files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] })) {
        $('#share').hidden = false;
        $('#share').onclick = async () => {
          const f = new File([await exportBlob('jpg', 2)], 'fotofoto.jpg', { type: 'image/jpeg' });
          try { await navigator.share({ files: [f], title: 'FOTO FOTO' }); } catch (e) { /* dibatalkan */ }
        };
      }
    } catch (e) { /* share tidak didukung */ }

    window.addEventListener('pagehide', () => FotoCamera.stop());
    FotoFrames.loadFonts().then(draw);
  }
  init();
})();
