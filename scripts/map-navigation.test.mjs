import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { readConfig, dist } from "./config.mjs";

const config = await readConfig();
const linksSource = await readFile(new URL("map-links.js", dist), "utf8");
const launchSource = await readFile(new URL("map-launch.js", dist), "utf8");
const html = await readFile(new URL("index.html", dist), "utf8");
const invitation = "https://example.test/invitation/index.html#location";

// Model lifecycle/timers and native link requests, not installed apps or Safari UI.
function harness({ userAgent = "iPhone", maxTouchPoints = 5, visible = true, focused = true, href = invitation, readyState = "complete" } = {}) {
  const events = () => {
    const listeners = new Map();
    return {
      addEventListener(name, callback) {
        const list = listeners.get(name) || [];
        list.push(callback);
        listeners.set(name, list);
      },
      emit(name, event = {}) { for (const callback of listeners.get(name) || []) callback(event); }
    };
  };
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id, {
    ...events(), href: "", target: "_blank", textContent: "", hidden: true, open: false,
    close() { this.open = false; }
  }]));
  const document = {
    ...events(), readyState, visibilityState: visible ? "visible" : "hidden", hasFocus: () => focused,
    body: { style: { overflow: "" } },
    getElementById: (id) => elements.get(id) || null,
    querySelector: () => [...elements.values()].find(element => element.open) || null
  };
  const scriptedAppRequests = [], webRequests = [], nativeRequests = [], replacements = [], timers = new Map();
  let currentUrl = href;
  const historyEntries = [currentUrl];
  let timerId = 0;
  const window = {
    ...events(), WEDDING_CONFIG: config,
    location: {
      get href() { return currentUrl; },
      set href(value) { scriptedAppRequests.push(value); },
      assign(value) { webRequests.push(value); currentUrl = value; historyEntries.push(value); },
      replace(value) { replacements.push(value); currentUrl = value; historyEntries[historyEntries.length - 1] = value; }
    },
    history: {
      state: null,
      replaceState(state, title, url) { currentUrl = url; historyEntries[historyEntries.length - 1] = url; }
    }
  };
  const context = vm.createContext({
    window, document, navigator: { userAgent, maxTouchPoints }, URL, encodeURIComponent,
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(linksSource, context);
  return {
    window, document, scriptedAppRequests, webRequests, nativeRequests, replacements, historyEntries, timers,
    run() { vm.runInContext(launchSource, context); },
    tick() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(callback => callback()); },
    visibility(value) { document.visibilityState = value ? "visible" : "hidden"; document.emit("visibilitychange"); },
    focus(value) { focused = value; window.emit(value ? "focus" : "blur"); },
    restore() { currentUrl = invitation; window.emit("pageshow", { persisted: true }); },
    click(id, options = {}) {
      const link = document.getElementById(id);
      const event = { button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
      link.emit("click", event);
      if (!event.defaultPrevented && link.href) nativeRequests.push(link.href);
      return event;
    }
  };
}

test("iOS uses HTTPS without probing installed apps; Android Intent includes a web fallback", () => {
  for (const [userAgent, maxTouchPoints, platform] of [["iPhone", 5, "ios"], ["Macintosh", 5, "ios"], ["Macintosh", 0, "desktop"], ["Windows", 10, "desktop"], ["Android", 5, "android"]]) {
    const h = harness({ userAgent, maxTouchPoints }); h.run();
    const maps = h.window.WEDDING_MAPS;
    for (const key of ["naver", "kakao"]) {
      const provider = maps.providers[key], link = maps.link(key);
      if (platform !== "android") assert.equal(link, provider.webUrl);
      else {
        assert.ok(link.startsWith("intent://"));
        assert.ok(link.includes(`package=${provider.packageName};`));
        assert.equal(decodeURIComponent(link.match(/S.browser_fallback_url=([^;]+)/)[1]), provider.webUrl);
      }
      assert.equal(maps.link(key, "web"), provider.webUrl);
      assert.equal(h.document.getElementById(`${key}-map`).target, "_self");
    }
    const naver = new URL(maps.providers.naver.appUrl);
    assert.equal(naver.searchParams.get("name"), config.venue.name);
    assert.equal(naver.searchParams.get("appname"), config.siteUrl);
    assert.equal(naver.searchParams.get("lat"), String(config.venue.latitude));
    assert.equal(naver.searchParams.get("lng"), String(config.venue.longitude));
    assert.equal(h.document.getElementById("map-confirm").href, maps.link("kakao"));
  }
});

test("loading, focusing and restoring an ordinary invitation never launch maps automatically", () => {
  const h = harness(); h.run(); h.focus(false); h.focus(true);
  h.visibility(false); h.visibility(true); h.restore(); h.tick();
  assert.deepEqual(h.scriptedAppRequests, []);
  assert.deepEqual(h.nativeRequests, []);
  assert.deepEqual(h.webRequests, []);
});

for (const [id, key] of [["naver-map", "naver"], ["kakao-map", "kakao"], ["map-confirm", "kakao"]]) {
  test(`${id}: repeated iOS clicks go straight to HTTPS with loading feedback and no app error route`, () => {
    const h = harness(); h.run();
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const event = h.click(id);
      assert.equal(event.defaultPrevented, false);
      assert.equal(h.nativeRequests.at(-1), h.window.WEDDING_MAPS.providers[key].webUrl);
      assert.equal(h.document.getElementById("map-navigation-status").hidden, false);
      h.window.emit("pagehide"); h.restore(); h.focus(true); h.tick();
      assert.equal(h.nativeRequests.length, attempt);
      assert.equal(h.document.getElementById("map-navigation-status").hidden, true);
    }
    assert.deepEqual(h.webRequests, []);
    assert.deepEqual(h.replacements, []);
    assert.deepEqual(h.scriptedAppRequests, []);
  });
}

test("an app switch or tab change clears loading and never triggers a second navigation on return", () => {
  const h = harness(); h.run(); h.click("naver-map");
  const stale = [...h.timers.values()][0];
  h.focus(false); h.visibility(false); h.visibility(true); h.focus(true); stale(); h.tick();
  assert.equal(h.document.getElementById("map-navigation-status").hidden, true);
  assert.deepEqual(h.webRequests, []);
  h.click("naver-map");
  assert.equal(h.nativeRequests.length, 2);
  assert.equal(h.document.getElementById("map-navigation-status").hidden, false);
});

test("a stale indicator timeout cannot interrupt a newer map choice", () => {
  const h = harness(); h.run(); h.click("naver-map");
  const stale = [...h.timers.values()][0];
  h.click("kakao-map"); stale();
  assert.equal(h.document.getElementById("map-navigation-status").hidden, false);
  assert.equal(h.nativeRequests.at(-1), h.window.WEDDING_MAPS.providers.kakao.webUrl);
  assert.deepEqual(h.webRequests, []);
});

test("cancelled navigation cannot leave an endless loading indicator or trigger a redirect", () => {
  const h = harness(); h.run(); h.click("naver-map"); h.tick();
  assert.equal(h.document.getElementById("map-navigation-status").hidden, true);
  h.focus(false); h.focus(true); h.tick();
  assert.deepEqual(h.webRequests, []);
  assert.deepEqual(h.scriptedAppRequests, []);
});

test("page exit and cached restoration clear the dialog and scroll lock before the next click", () => {
  const h = harness(); h.run(); h.click("kakao-map");
  h.document.getElementById("map-dialog").open = true;
  h.document.body.style.overflow = "hidden";
  h.window.emit("pagehide"); h.restore(); h.focus(true); h.tick();
  assert.equal(h.document.getElementById("map-dialog").open, false);
  assert.equal(h.document.body.style.overflow, "");
  assert.deepEqual(h.webRequests, []);
  h.click("map-confirm"); assert.equal(h.nativeRequests.length, 2);
});

test("map confirmation closes the dialog synchronously without cancelling native navigation", () => {
  const h = harness(); h.run();
  h.document.getElementById("map-dialog").open = true;
  h.document.body.style.overflow = "hidden";
  const event = h.click("map-confirm");
  assert.equal(event.defaultPrevented, false);
  assert.equal(h.document.getElementById("map-dialog").open, false);
  assert.equal(h.document.body.style.overflow, "");
});

test("opening a preview or choosing TMAP clears stale loading feedback", () => {
  for (const id of ["map-preview", "tmap"]) {
    const h = harness(); h.run(); h.click("naver-map"); h.click(id); h.tick();
    assert.deepEqual(h.webRequests, []);
  }
});

test("modified or already handled clicks do not arm automatic navigation", () => {
  for (const options of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
    const h = harness(); h.run(); h.click("naver-map", options); h.tick();
    assert.deepEqual(h.webRequests, []); assert.equal(h.timers.size, 0);
  }
});

test("Android and desktop rely on native navigation without a competing scripted redirect", () => {
  for (const userAgent of ["Android", "Windows"]) {
    const h = harness({ userAgent }); h.run(); h.click("naver-map"); h.tick();
    assert.equal(h.nativeRequests.length, 1);
    assert.deepEqual(h.scriptedAppRequests, []); assert.deepEqual(h.webRequests, []);
  }
});

test("manual web guidance and links are removed, without leaving required elements in the controller", () => {
  assert.doesNotMatch(html, /map-web-options|map-confirm-web|naver-map-web|kakao-map-web/);
  const h = harness(); assert.doesNotThrow(() => h.run());
});

test("legacy launch URLs use web once, remove launch parameters, and never auto-launch an app", () => {
  for (const key of ["naver", "kakao"]) {
    const h = harness({ href: `https://example.test/invitation/index.html?open-map=${key}&map-mode=app#location` }); h.run(); h.tick();
    assert.deepEqual(h.scriptedAppRequests, []);
    assert.deepEqual(h.webRequests, [h.window.WEDDING_MAPS.providers[key].webUrl]);
    assert.equal(h.historyEntries[0], invitation);
    h.window.emit("pagehide"); h.restore(); h.focus(true); h.tick();
    assert.equal(h.webRequests.length, 1);
    const cold = harness({ href: h.historyEntries[0] }); cold.run(); cold.tick();
    assert.deepEqual(cold.webRequests, []);
    cold.click(`${key}-map`); cold.tick(); assert.equal(cold.webRequests.length, 0); assert.equal(cold.nativeRequests.length, 1);
  }
});

test("legacy web navigation waits for initial load and visible focus to preserve invitation history", () => {
  const h = harness({ href: "https://example.test/invitation/index.html?open-map=kakao#location", visible: false, focused: false, readyState: "interactive" }); h.run();
  h.tick(); assert.deepEqual(h.webRequests, []);
  h.document.readyState = "complete"; h.window.emit("load"); h.tick();
  assert.deepEqual(h.webRequests, []);
  h.visibility(true); h.focus(true); assert.equal(h.webRequests.length, 1);
  assert.equal(h.historyEntries[0], invitation);
});

test("old connection page URLs redirect to the invitation in web-only mode", () => {
  const h = harness({ href: "https://example.test/invitation/map-launch.html?provider=kakao" }); h.run();
  assert.deepEqual(h.replacements, ["https://example.test/invitation/index.html?open-map=kakao&map-mode=web#location"]);
  assert.deepEqual(h.scriptedAppRequests, []); assert.deepEqual(h.webRequests, []);
});

test("a fresh map choice before initial load cancels an old launch URL", () => {
  for (const id of ["tmap", "map-preview"]) {
    const h = harness({ href: "https://example.test/invitation/index.html?open-map=naver#location", readyState: "interactive" }); h.run();
    h.click(id); h.document.readyState = "complete"; h.window.emit("load"); h.tick();
    assert.deepEqual(h.webRequests, []);
  }
});

test("unknown providers and query injection cannot trigger an automatic redirect", () => {
  for (const key of ["", "__proto__", "https://example.org", "naver&url=https://example.org"]) {
    const h = harness({ href: `https://example.test/invitation/index.html?open-map=${encodeURIComponent(key)}#location` }); h.run(); h.tick();
    assert.deepEqual(h.scriptedAppRequests, []); assert.deepEqual(h.webRequests, []); assert.deepEqual(h.replacements, []);
  }
});


test("loading feedback has neutral copy, a decorative spinner and reduced-motion support", async () => {
  const css = await readFile(new URL("styles.css", dist), "utf8");
  assert.match(html, /class="map-loading-spinner" aria-hidden="true"/);
  assert.match(html, /지도를 불러오고 있어요/);
  assert.doesNotMatch(html + launchSource, /앱이 열리지 않으면|앱이 없다면/);
  assert.match(css, /prefers-reduced-motion: reduce[^}]+map-loading-spinner[^}]+animation: none/);
});
