(() => {
  "use strict";
  const maps = window.WEDDING_MAPS;
  const key = new URLSearchParams(window.location.search).get("provider");
  const status = document.getElementById("map-launch-status");
  // Only known providers are accepted; never redirect to a URL from the query.
  if (!maps || !["naver", "kakao"].includes(key)) {
    status.textContent = "청첩장에서 지도 버튼을 다시 눌러 주세요.";
    return;
  }
  const provider = maps.providers[key];
  const appLink = document.getElementById("map-launch-app");
  const webLink = document.getElementById("map-launch-web");
  document.getElementById("map-launch-title").textContent = `${provider.name} 연결`;
  document.getElementById("map-launch-actions").hidden = false;
  appLink.href = maps.isAndroid ? maps.link(key) : provider.appUrl;
  webLink.href = provider.webUrl;
  let timer;
  let generation = 0;
  let started = false;
  let pending = false;
  const clearFallback = () => { clearTimeout(timer); generation += 1; };
  const cancel = () => {
    clearFallback();
    pending = false;
    if (started) status.textContent = "앱이 열리지 않았다면 웹 지도로 확인해 주세요.";
  };
  const openWeb = () => {
    cancel();
    status.textContent = "웹 지도로 이동합니다.";
    // This replaces only the connection tab, never the original invitation.
    window.location.replace(provider.webUrl);
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
    scheduleFallback();
  };
  const start = () => {
    // A background tab must wait until the visitor opens it.
    if (started || document.visibilityState === "hidden" || !document.hasFocus()) return;
    if (!maps.isIOS && !maps.isAndroid) { started = true; openWeb(); return; }
    beginAttempt();
    try { window.location.href = appLink.href; } catch { openWeb(); }
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
  // Retry stays a normal app link so it carries the visitor's tap directly.
  appLink.addEventListener("click", beginAttempt);
  webLink.addEventListener("click", cancel);
  document.getElementById("map-launch-back").addEventListener("click", cancel);
  start();
})();
