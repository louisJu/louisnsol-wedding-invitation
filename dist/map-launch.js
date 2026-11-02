(() => {
  "use strict";
  const maps = window.WEDDING_MAPS;
  if (!maps) return;
  const url = new URL(window.location.href);
  // Previously deployed intermediate URLs now lead to a real invitation.
  // Never auto-launch a custom app scheme without a fresh visitor tap.
  if (url.pathname.endsWith("/map-launch.html")) {
    const key = url.searchParams.get("provider");
    const destination = ["naver", "kakao"].includes(key)
      ? maps.entry(key, "web") : "index.html#location";
    window.location.replace(new URL(destination, url).href);
    return;
  }

  const status = document.getElementById("map-navigation-status");
  const buttons = [["naver-map", "naver"], ["kakao-map", "kakao"], ["map-confirm", "kakao"]];
  let indicatorTimer;
  let generation = 0;
  const cancel = () => {
    clearTimeout(indicatorTimer);
    generation += 1;
    if (status) status.hidden = true;
  };
  const showLoading = () => {
    cancel();
    if (status) status.hidden = false;
    const current = generation;
    // Release the indicator if the browser cancels a navigation. Never use a
    // timeout to guess app installation or trigger another external redirect.
    indicatorTimer = setTimeout(() => { if (current === generation) cancel(); }, 8000);
  };
  const closeMapDialog = () => {
    const dialog = document.getElementById("map-dialog");
    if (dialog?.open) dialog.close();
    if (!document.querySelector("dialog[open]")) document.body.style.overflow = "";
  };
  const refreshLinks = () => {
    buttons.forEach(([id, key]) => {
      const link = document.getElementById(id);
      if (!link) return;
      link.href = maps.link(key);
      link.target = "_self";
    });
    const tmap = document.getElementById("tmap");
    if (tmap) tmap.target = "_self";
  };
  const openWeb = (key) => {
    cancel();
    closeMapDialog();
    // Append a real history entry. Back restores this same invitation.
    window.location.assign(maps.providers[key].webUrl);
  };
  refreshLinks();
  buttons.forEach(([id]) => {
    document.getElementById(id)?.addEventListener("click", (event) => {
      // Modified clicks keep the browser's usual behavior and start no timer.
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      cancel();
      refreshLinks();
      closeMapDialog();
      showLoading();
      // Follow the native HTTPS link or Android Intent immediately. A spinner
      // accompanies the real navigation without an artificial waiting screen.
    });
  });
  document.getElementById("tmap")?.addEventListener("click", cancel);
  document.getElementById("map-preview")?.addEventListener("click", cancel);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") cancel();
  });
  window.addEventListener("pagehide", () => { cancel(); closeMapDialog(); });
  window.addEventListener("pageshow", () => {
    cancel(); closeMapDialog(); refreshLinks();
  });

  // Old cached links may still contain a launch request. Consume it once and
  // use web navigation only; fresh buttons above always retain user activation.
  const legacyKey = url.searchParams.get("open-map");
  if (!["naver", "kakao"].includes(legacyKey)) return;
  url.searchParams.delete("open-map");
  url.searchParams.delete("map-mode");
  url.hash = "location";
  try { window.history.replaceState(window.history.state, "", url.href); }
  catch { window.location.replace(url.href); return; }
  let legacyPending = true;
  let loaded = document.readyState === "complete";
  const legacyStart = () => {
    if (!legacyPending || !loaded || document.visibilityState === "hidden" || !document.hasFocus()) return;
    legacyPending = false;
    openWeb(legacyKey);
  };
  [...buttons.map(([id]) => id), "tmap", "map-preview"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => { legacyPending = false; });
  });
  window.addEventListener("pagehide", () => { legacyPending = false; });
  window.addEventListener("pageshow", (event) => { if (event.persisted) legacyPending = false; });
  window.addEventListener("focus", legacyStart);
  document.addEventListener("visibilitychange", legacyStart);
  if (!loaded) window.addEventListener("load", () => setTimeout(() => { loaded = true; legacyStart(); }, 0), { once: true });
  legacyStart();
})();
