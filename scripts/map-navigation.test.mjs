import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { readConfig, dist } from "./config.mjs";

const config = await readConfig();
const linksSource = await readFile(new URL("map-links.js", dist), "utf8");
const launchSource = await readFile(new URL("map-launch.js", dist), "utf8");

function harness({ userAgent = "iPhone", maxTouchPoints = 5, provider = "naver", mode = "app", visible = true, focused = true, rejectApp = false, href, readyState = "complete" } = {}) {
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
    ...events(), readyState, visibilityState: visible ? "visible" : "hidden", hasFocus: () => focused,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { ...events(), href: "", textContent: "", hidden: true });
      return elements.get(id);
    }
  };
  const appRequests = [], webRequests = [], replacements = [], timers = new Map();
  let currentUrl = href || `https://example.test/invitation/index.html?open-map=${encodeURIComponent(provider)}&map-mode=${mode}#location`;
  const historyEntries = [currentUrl];
  let timerId = 0;
  const window = {
    ...events(), WEDDING_CONFIG: config,
    location: {
      get href() { return currentUrl; },
      set href(value) { appRequests.push(value); if (rejectApp) throw new Error("App navigation blocked"); },
      assign(value) { webRequests.push(value); currentUrl = value; historyEntries.push(value); },
      replace(value) { replacements.push(value); currentUrl = value; historyEntries[historyEntries.length - 1] = value; }
    },
    history: {
      state: null,
      replaceState(state, title, url) { currentUrl = url; historyEntries[historyEntries.length - 1] = url; }
    }
  };
  const context = vm.createContext({
    window, document, navigator: { userAgent, maxTouchPoints }, URL, URLSearchParams, encodeURIComponent,
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(linksSource, context);
  return {
    window, document, appRequests, webRequests, replacements, historyEntries, timers,
    run() { vm.runInContext(launchSource, context); },
    tick() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(callback => callback()); },
    visibility(value) { document.visibilityState = value ? "visible" : "hidden"; document.emit("visibilitychange"); },
    focus(value) { focused = value; window.emit(value ? "focus" : "blur"); },
    click(id) { document.getElementById(id).emit("click"); }
  };
}

test("every web route keeps an invitation entry; Android still opens its app from the original tap", () => {
  for (const [userAgent, maxTouchPoints, platform] of [["iPhone", 5, "ios"], ["Macintosh", 5, "ios"], ["Macintosh", 0, "desktop"], ["Windows", 10, "desktop"], ["Android", 5, "android"]]) {
    const { window } = harness({ userAgent, maxTouchPoints });
    for (const key of ["naver", "kakao"]) {
      const maps = window.WEDDING_MAPS, provider = maps.providers[key], link = maps.link(key);
      if (platform === "ios") {
        assert.equal(link, `index.html?open-map=${key}&map-mode=app#location`);
        assert.equal(new URL(link, "https://example.test/invitation/").pathname, "/invitation/index.html");
      } else if (platform === "desktop") assert.equal(link, maps.entry(key, "web"));
      else {
        assert.ok(link.startsWith("intent://"));
        assert.ok(link.includes(`package=${provider.packageName};`));
        assert.equal(decodeURIComponent(link.match(/S.browser_fallback_url=([^;]+)/)[1]), new URL(maps.entry(key, "web"), window.location.href).href);
      }
      assert.equal(maps.link(key, "web"), `index.html?open-map=${key}&map-mode=web#location`);
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
    assert.deepEqual(h.historyEntries, ["https://example.test/invitation/index.html#location", h.webRequests[0]]);
    assert.deepEqual(h.replacements, []);
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

test("explicit map choices cancel the previous pending automatic navigation", () => {
  for (const id of ["naver-map", "kakao-map", "naver-map-web", "kakao-map-web", "map-confirm", "map-confirm-web", "tmap"]) {
    const h = harness(); h.run(); h.click(id); h.tick();
    assert.deepEqual(h.webRequests, []);
  }
});

test("choosing a map again cannot revive old callbacks in the previous invitation tab", () => {
  const h = harness(); h.run(); const queued = [...h.timers.values()][0];
  h.visibility(false); h.visibility(true); h.click("naver-map");
  queued(); assert.deepEqual(h.webRequests, []);
  h.tick(); assert.equal(h.webRequests.length, 0);
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

test("a cold reload of the Back destination shows the invitation without launching again", () => {
  const h = harness(); h.run(); h.tick();
  const back = harness({ href: h.historyEntries[0] }); back.run(); back.tick();
  assert.deepEqual(back.appRequests, []); assert.deepEqual(back.webRequests, []);
  assert.equal(new URL(back.window.location.href).hash, "#location");
});

test("explicit web mode and Android app-missing fallback never attempt an app again", () => {
  for (const userAgent of ["iPhone", "Android"]) {
    const h = harness({ userAgent, mode: "web" }); h.run(); h.tick();
    assert.deepEqual(h.appRequests, []); assert.equal(h.webRequests.length, 1);
    assert.equal(h.historyEntries.length, 2);
  }
});

test("navigation waits for the invitation load to finish so its history entry is retained", () => {
  const h = harness({ mode: "web", readyState: "interactive" }); h.run();
  h.focus(true); h.tick(); assert.deepEqual(h.webRequests, []);
  h.document.readyState = "complete"; h.window.emit("load");
  assert.deepEqual(h.webRequests, []); h.tick(); assert.equal(h.webRequests.length, 1);
  assert.equal(h.historyEntries[0], "https://example.test/invitation/index.html#location");
});

test("previously deployed connection URLs first load the actual invitation", () => {
  const h = harness({ href: "https://example.test/invitation/map-launch.html?provider=kakao" }); h.run(); h.tick();
  assert.deepEqual(h.replacements, ["https://example.test/invitation/index.html?open-map=kakao&map-mode=app#location"]);
  assert.deepEqual(h.webRequests, []); assert.deepEqual(h.appRequests, []);
});
