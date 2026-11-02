(() => {
  "use strict";
  const maps = window.WEDDING_MAPS;
  if (!maps) return;
  const url = new URL(window.location.href);
  // Keep previously deployed connection links usable, but load the actual
  // invitation before navigating away so Back always has a real page to show.
  if (url.pathname.endsWith("/map-launch.html")) {
    const legacyKey = url.searchParams.get("provider");
    const destination = ["naver", "kakao"].includes(legacyKey)
      ? maps.entry(legacyKey, "app") : "index.html#location";
    window.location.replace(new URL(destination, url).href);
    return;
  }
  const key = url.searchParams.get("open-map");
  // Only configured providers are accepted, never arbitrary query URLs.
  if (!["naver", "kakao"].includes(key)) return;
  const webOnly = url.searchParams.get("map-mode") === "web";
  const status = document.getElementById("map-navigation-status");
  const provider = maps.providers[key];
  // Consume the request before leaving. A full reload after Back must not
  // launch again, even when the browser does not restore the page from memory.
  url.searchParams.delete("open-map");
  url.searchParams.delete("map-mode");
  url.hash = "location";
  try { window.history.replaceState(window.history.state, "", url.href); }
  catch { window.location.replace(url.href); return; }
  let timer;
  let generation = 0;
  let started = false;
  let pending = false;
  let ready = document.readyState === "complete";
  const clearFallback = () => { clearTimeout(timer); generation += 1; };
  const cancel = () => {
    clearFallback();
    pending = false;
    status.hidden = true;
  };
  const openWeb = () => {
    cancel();
    status.textContent = "웹 지도로 이동합니다.";
    status.hidden = false;
    // Keep the rendered invitation in this tab's history for Back navigation.
    window.location.assign(provider.webUrl);
  };
  const scheduleFallback = () => {
    clearFallback();
    const current = generation;
    timer = setTimeout(() => {
      if (current !== generation || !pending || document.visibilityState === "hidden" || !document.hasFocus()) return;
      openWeb();
    }, 2000);
  };
  const beginAttempt = () => {
    started = true;
    pending = true;
    status.textContent = "앱이 열리지 않으면 잠시 후 웹 지도로 이동합니다.";
    status.hidden = false;
    scheduleFallback();
  };
  const start = () => {
    // A background tab must wait until the visitor opens it.
    if (!ready || started || document.visibilityState === "hidden" || !document.hasFocus()) return;
    if (webOnly || (!maps.isIOS && !maps.isAndroid)) { started = true; openWeb(); return; }
    beginAttempt();
    try { window.location.href = provider.appUrl; } catch { openWeb(); }
  };
  // Native app prompts may temporarily blur the page. Pause until focus returns.
  window.addEventListener("blur", clearFallback);
  window.addEventListener("focus", () => {
    if (!started) start();
    else if (pending && document.visibilityState !== "hidden") scheduleFallback();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") cancel();
    else start();
  });
  window.addEventListener("pagehide", () => { started = true; cancel(); });
  window.addEventListener("pageshow", (event) => { if (event.persisted) { started = true; cancel(); } });
  // A new explicit choice starts in its own tab; cancel this pending attempt.
  ["naver-map", "kakao-map", "tmap", "naver-map-web", "kakao-map-web", "map-confirm", "map-confirm-web"]
    .forEach((id) => document.getElementById(id).addEventListener("click", cancel));
  // Leave the initial load before navigation; early redirects may replace the
  // initial history entry instead of keeping it available to the Back button.
  if (!ready) window.addEventListener("load", () => setTimeout(() => { ready = true; start(); }, 0), { once: true });
  start();
})();
