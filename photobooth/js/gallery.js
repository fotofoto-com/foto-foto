// FOTO FOTO — gallery.js
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  let items = [], tt;
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2800); };

  async function load() {
    try { items = (await FotoStore.all()).sort((a, b) => b.created - a.created); }
    catch (e) { items = []; toast('Penyimpanan browser tidak tersedia.'); }
    render();
  }

  function render() {
    const g = $('#grid'); g.innerHTML = '';
    $('#empty').hidden = items.length > 0;
    $('#count').textContent = items.length + ' foto';
    items.forEach(it => {
      const card = document.createElement('article'); card.className = 'g-item';
      const img = document.createElement('img'); img.alt = 'Foto tersimpan'; img.loading = 'lazy';
      img.src = URL.createObjectURL(it.thumb || it.blob);
      img.onclick = () => view(it);
      const d = document.createElement('small');
      d.textContent = new Date(it.created).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      const act = document.createElement('div'); act.className = 'g-act';
      const mk = (t, cls, fn) => { const b = document.createElement('button'); b.className = 'chip ' + (cls || ''); b.textContent = t; b.onclick = fn; return b; };
      act.append(mk('Lihat', '', () => view(it)), mk('Unduh', '', () => download(it)), mk('Hapus', 'del', () => remove(it)));
      card.append(img, d, act); g.append(card);
    });
  }

  function view(it) {
    const u = URL.createObjectURL(it.blob), v = $('#viewer');
    $('#viewImg').src = u; v.showModal(); v.onclose = () => URL.revokeObjectURL(u);
  }
  function download(it) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(it.blob);
    a.download = 'fotofoto-' + it.created + '.jpg'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function ask() {
    const d = $('#confirm'); d.showModal();
    return new Promise(r => { d.onclose = () => r(d.returnValue === 'yes'); });
  }
  async function remove(it) {
    if (!(await ask())) return;
    await FotoStore.remove(it.id); toast('Foto dihapus.'); load();
  }
  $('#viewer').addEventListener('click', e => { if (e.target.id === 'viewer') e.target.close(); });
  load();
})();
