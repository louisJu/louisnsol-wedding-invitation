import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { readConfig, dist } from "./config.mjs";

const config = await readConfig();
const linksSource = await readFile(new URL("map-links.js", dist), "utf8");
const launchSource = await readFile(new URL("map-launch.js", dist), "utf8");

function harness({ userAgent = "iPhone", maxTouchPoints = 5, provider = "naver", visible = true, focused = true, rejectApp = false } = {}) {
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
  const elements = new Map();
  const document = {
    ...events(), visibilityState: visible ? "visible" : "hidden", hasFocus: () => focused,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { ...events(), href: "", textContent: "", hidden: true });
      return elements.get(id);
    }
  };
  const appRequests = [], webRequests = [], timers = new Map();
  let timerId = 0;
  const window = {
    ...events(), WEDDING_CONFIG: config,
    location: {
      search: `?provider=${encodeURIComponent(provider)}`,
      set href(value) { appRequests.push(value); if (rejectApp) throw new Error("App navigation blocked"); },
      replace(value) { webRequests.push(value); }
    }
  };
  const context = vm.createContext({
    window, document, navigator: { userAgent, maxTouchPoints }, URLSearchParams, encodeURIComponent,
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(linksSource, context);
  return {
    window, document, appRequests, webRequests, timers,
    run() { vm.runInContext(launchSource, context); },
    tick() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(callback => callback()); },
    visibility(value) { document.visibilityState = value ? "visible" : "hidden"; document.emit("visibilitychange"); },
    focus(value) { focused = value; window.emit(value ? "focus" : "blur"); },
    click(id) { document.getElementById(id).emit("click"); }
  };
}

test("iPhone and iPad use a relative connection page; desktop uses web; Android encodes web fallback", () => {
  for (const [userAgent, maxTouchPoints, platform] of [["iPhone", 5, "ios"], ["Macintosh", 5, "ios"], ["Macintosh", 0, "desktop"], ["Windows", 10, "desktop"], ["Android", 5, "android"]]) {
    const { window } = harness({ userAgent, maxTouchPoints });
    for (const key of ["naver", "kakao"]) {
      const maps = window.WEDDING_MAPS, provider = maps.providers[key], link = maps.link(key);
      if (platform === "ios") {
        assert.equal(link, `map-launch.html?provider=${key}`);
        assert.equal(new URL(link, "https://example.test/invitation/").pathname, "/invitation/map-launch.html");
      } else if (platform === "desktop") assert.equal(link, provider.webUrl);
      else {
        assert.ok(link.startsWith("intent://"));
        assert.ok(link.includes(`package=${provider.packageName};`));
        assert.equal(decodeURIComponent(link.match(/S.browser_fallback_url=([^;]+)/)[1]), provider.webUrl);
      }
    }
    const naver = new URL(window.WEDDING_MAPS.providers.naver.appUrl);
    assert.equal(naver.searchParams.get("name"), config.venue.name);
    assert.equal(naver.searchParams.get("appname"), config.siteUrl);
    assert.equal(naver.searchParams.get("lat"), String(config.venue.latitude));
    assert.equal(naver.searchParams.get("lng"), String(config.venue.longitude));
  }
});

for (const provider of ["naver", "kakao"]) {
  test(`${provider}: unhandled app launch automatically opens the configured web map once`, () => {
    const h = harness({ provider }); h.run();
    assert.deepEqual(h.appRequests, [h.window.WEDDING_MAPS.providers[provider].appUrl]);
    assert.deepEqual(h.webRequests, []);
    h.tick(); h.tick();
    assert.deepEqual(h.webRequests, [h.window.WEDDING_MAPS.providers[provider].webUrl]);
  });
}

test("switching to an app cancels fallback permanently, including when returning", () => {
  const h = harness(); h.run();
  const queued = [...h.timers.values()][0];
  h.focus(false); h.visibility(false); h.tick();
  h.visibility(true); h.focus(true); queued(); h.tick();
  assert.equal(h.appRequests.length, 1);
  assert.deepEqual(h.webRequests, []);
});

test("an app prompt pauses fallback and resumes it when dismissed without opening the app", () => {
  const h = harness(); h.run();
  h.focus(false); h.tick(); assert.deepEqual(h.webRequests, []);
  h.focus(true); h.tick(); assert.equal(h.webRequests.length, 1);
});

test("a background tab waits for visible focus before attempting navigation", () => {
  const h = harness({ visible: false, focused: false }); h.run(); h.tick();
  assert.deepEqual(h.appRequests, []);
  h.visibility(true); assert.deepEqual(h.appRequests, []);
  h.focus(true); assert.equal(h.appRequests.length, 1);
});

test("page exit and back-forward-cache restoration never trigger a delayed web redirect", () => {
  const h = harness(); h.run();
  h.window.emit("pagehide"); h.window.emit("pageshow", { persisted: true });
  h.focus(true); h.visibility(true); h.tick();
  assert.deepEqual(h.webRequests, []);
  assert.equal(h.appRequests.length, 1);
});

test("manual web/back choices cancel pending automatic navigation", () => {
  for (const id of ["map-launch-web", "map-launch-back"]) {
    const h = harness(); h.run(); h.click(id); h.tick();
    assert.deepEqual(h.webRequests, []);
  }
});

test("an explicit app retry can enable fallback after returning; stale callbacks stay cancelled", () => {
  const h = harness(); h.run(); const queued = [...h.timers.values()][0];
  h.visibility(false); h.visibility(true); h.click("map-launch-app");
  queued(); assert.deepEqual(h.webRequests, []);
  h.tick(); assert.equal(h.webRequests.length, 1);
});

test("unknown providers and URL injection cannot redirect the connection page", () => {
  for (const provider of ["", "__proto__", "https://example.org", "naver&url=https://example.org"]) {
    const h = harness({ provider }); h.run(); h.tick();
    assert.deepEqual(h.appRequests, []); assert.deepEqual(h.webRequests, []);
  }
});

test("synchronously blocked app navigation falls back to web without a second timer redirect", () => {
  const h = harness({ rejectApp: true }); h.run(); h.tick();
  assert.equal(h.webRequests.length, 1);
});

test("opening the connection page on desktop goes directly to web", () => {
  const h = harness({ userAgent: "Macintosh", maxTouchPoints: 0 }); h.run(); h.tick();
  assert.deepEqual(h.appRequests, []); assert.equal(h.webRequests.length, 1);
});
