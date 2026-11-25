// FOTO FOTO — camera.js (MediaDevices API)
(function () {
  'use strict';
  const Cam = {
    stream: null, video: null,
    async start(video, deviceId) {
      if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('INSECURE');
      this.stop();
      const v = { width: { ideal: 1280 }, height: { ideal: 960 } };
      if (deviceId) v.deviceId = { exact: deviceId }; else v.facingMode = 'user';
      this.stream = await navigator.mediaDevices.getUserMedia({ video: v, audio: false });
      this.video = video; video.srcObject = this.stream;
      await video.play();
      return this.stream;
    },
    stop() {
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
      if (this.video) this.video.srcObject = null;
    },
    async devices() {
      const d = await navigator.mediaDevices.enumerateDevices();
      return d.filter(x => x.kind === 'videoinput');
    },
    settings() { const t = this.stream && this.stream.getVideoTracks()[0]; return t ? t.getSettings() : {}; },
    // ambil frame video sebagai canvas (mirror sesuai tampilan preview)
    grab(mirror, maxW) {
      const v = this.video, s = Math.min(1, (maxW || 1280) / v.videoWidth);
      const c = document.createElement('canvas');
      c.width = Math.round(v.videoWidth * s); c.height = Math.round(v.videoHeight * s);
      const x = c.getContext('2d');
      if (mirror) { x.translate(c.width, 0); x.scale(-1, 1); }
      x.drawImage(v, 0, 0, c.width, c.height);
      return c;
    }
  };
  window.FotoCamera = Cam;
})();
