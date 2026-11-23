require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const React = require("react");

const STORAGE_KEY = "aitcAccessToken";
const authOrigin = "https://auth.example.test";
const webOrigin = "https://web.example.test";
const siteOrigin = "http://localhost:5173";

function createStorage(values = {}) {
  const items = new Map(Object.entries(values));
  return {
    getItem(key) { return items.get(key) ?? null; },
    setItem(key, value) { items.set(key, value); },
    removeItem(key) { items.delete(key); },
    clear() { items.clear(); },
  };
}

function setupAuth(t, { savedToken, legacyToken, responseStatus = 200 } = {}) {
  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_AUTH_BASE_URL: `${authOrigin}/`,
    NEXT_PUBLIC_API_BASE_URL: `${webOrigin}/`,
  };
  t.after(() => { process.env = originalEnv; });

  const { useDiscordAuth } = require("../lib/discord-auth.ts");
  const localStorage = createStorage(savedToken ? { [STORAGE_KEY]: savedToken } : {});
  const sessionStorage = createStorage(legacyToken ? { [STORAGE_KEY]: legacyToken } : {});
  const listeners = new Map();
  const popup = { closed: false, close() { this.closed = true; } };
  let loginUrl;
  const window = {
    location: { origin: siteOrigin },
    open(url) { loginUrl = url; return popup; },
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    setInterval() { return 1; },
    clearInterval() {},
    setTimeout() { return 2; },
    clearTimeout() {},
  };
  for (const [key, value] of Object.entries({ window, localStorage, sessionStorage })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    });
  }

  const fetch = t.mock.method(globalThis, "fetch", async (url) => ({
    status: responseStatus,
    ok: responseStatus === 200,
    json: async () => url.endsWith("/auth/me") ? { username: "member" } : { items: [] },
  }));

  let currentStates;
  let currentEffects;
  t.mock.method(React, "useState", (initial) => {
    const state = { value: initial };
    currentStates.push(state);
    return [initial, (value) => { state.value = value; }];
  });
  t.mock.method(React, "useRef", (initial) => ({ current: initial }));
  t.mock.method(React, "useEffect", (effect) => { currentEffects.push(effect); });
  t.mock.method(React, "useCallback", (callback) => callback);

  function mount() {
    const states = [];
    const effects = [];
    currentStates = states;
    currentEffects = effects;
    const auth = useDiscordAuth();
    const cleanups = effects.map((effect) => effect());
    return {
      ...auth,
      get status() { return states[0].value; },
      get accessToken() { return states[1].value; },
      get profile() { return states[2].value; },
      get profileStatus() { return states[3].value; },
      unmount() { cleanups.forEach((cleanup) => cleanup?.()); },
    };
  }

  function dispatch(type, event) {
    for (const listener of listeners.get(type) ?? []) listener(event);
  }

  function finishLogin(accessToken = "test.jwt.signature") {
    dispatch("message", {
      origin: authOrigin,
      source: popup,
      data: {
        type: "AITC_AUTH_SUCCESS",
        attempt: loginUrl.searchParams.get("attempt"),
        accessToken,
      },
    });
  }

  return {
    mount, fetch, localStorage, sessionStorage, dispatch, finishLogin, popup, listeners,
    get loginUrl() { return loginUrl; },
  };
}

const settleRequests = () => new Promise((resolve) => setImmediate(resolve));

test("Discord login trusts the Auth API origin and persists the JWT in localStorage", async (t) => {
  const env = setupAuth(t);
  const { fetchMembersOnlyMembers } = require("../lib/members-only-api.ts");
  const tab = env.mount();
  tab.startAuthentication();
  const { loginUrl } = env;
  assert.equal(loginUrl.origin, authOrigin);
  assert.equal(loginUrl.pathname, "/auth/discord/login");
  assert.equal(loginUrl.searchParams.get("return_origin"), siteOrigin);
  const attempt = loginUrl.searchParams.get("attempt");
  assert.ok(attempt);
  const data = { type: "AITC_AUTH_SUCCESS", attempt, accessToken: "test.jwt.signature" };

  for (const event of [
    { origin: webOrigin, source: env.popup, data },
    { origin: authOrigin, source: {}, data },
    { origin: authOrigin, source: env.popup, data: { ...data, attempt: "other-attempt" } },
  ]) env.dispatch("message", event);
  assert.equal(env.localStorage.getItem(STORAGE_KEY), null);
  assert.equal(env.fetch.mock.callCount(), 0);

  env.sessionStorage.setItem(STORAGE_KEY, "obsolete-token");
  env.finishLogin(data.accessToken);
  assert.equal(tab.status, "authenticated");
  assert.equal(env.localStorage.getItem(STORAGE_KEY), data.accessToken);
  assert.equal(env.sessionStorage.getItem(STORAGE_KEY), null);
  await fetchMembersOnlyMembers(data.accessToken, new AbortController().signal);

  const requests = env.fetch.mock.calls.map(({ arguments: [url, options] }) => (
    [url, options.headers.Authorization]
  ));
  assert.deepEqual(requests, [
    [`${webOrigin}/auth/me`, `Bearer ${data.accessToken}`],
    [`${webOrigin}/members-only/members`, `Bearer ${data.accessToken}`],
  ]);
});

test("a fresh tab restores the same saved JWT after the previous tab is closed", async (t) => {
  const env = setupAuth(t);
  const firstTab = env.mount();
  assert.equal(firstTab.status, "unauthenticated");
  firstTab.startAuthentication();
  env.finishLogin();
  firstTab.unmount();
  env.sessionStorage.clear();

  const reopenedTab = env.mount();
  await settleRequests();
  assert.equal(reopenedTab.status, "authenticated");
  assert.equal(reopenedTab.accessToken, "test.jwt.signature");
  assert.equal(reopenedTab.profile.username, "member");
  assert.equal(env.localStorage.getItem(STORAGE_KEY), "test.jwt.signature");
  assert.equal(env.fetch.mock.calls.at(-1).arguments[1].headers.Authorization, "Bearer test.jwt.signature");
});

test("a legacy session JWT is migrated unchanged and removed from sessionStorage", (t) => {
  const payload = Buffer.from(JSON.stringify({ iat: 1000, exp: 4600 })).toString("base64url");
  const token = `header.${payload}.signature`;
  const env = setupAuth(t, { legacyToken: token });
  const tab = env.mount();
  assert.equal(tab.accessToken, token);
  assert.equal(env.localStorage.getItem(STORAGE_KEY), token);
  assert.equal(env.sessionStorage.getItem(STORAGE_KEY), null);
  assert.equal(env.fetch.mock.calls[0].arguments[1].headers.Authorization, `Bearer ${token}`);
});

test("the localStorage JWT takes priority over an older session JWT", (t) => {
  const env = setupAuth(t, { savedToken: "current-token", legacyToken: "old-token" });
  const tab = env.mount();
  assert.equal(tab.accessToken, "current-token");
  assert.equal(env.localStorage.getItem(STORAGE_KEY), "current-token");
  assert.equal(env.sessionStorage.getItem(STORAGE_KEY), null);
});

for (const responseStatus of [401, 403]) {
  test(`a restored JWT rejected with ${responseStatus} is deleted and requires login`, async (t) => {
    const env = setupAuth(t, { savedToken: "expired-token", responseStatus });
    const tab = env.mount();
    await settleRequests();
    assert.equal(tab.status, "unauthenticated");
    assert.equal(tab.accessToken, null);
    assert.equal(tab.profile, null);
    assert.equal(env.localStorage.getItem(STORAGE_KEY), null);
  });
}

test("logout clears both stores and the storage event logs out other open tabs", async (t) => {
  const env = setupAuth(t, { savedToken: "saved-token" });
  const firstTab = env.mount();
  const secondTab = env.mount();
  await settleRequests();
  env.sessionStorage.setItem(STORAGE_KEY, "legacy-token");

  firstTab.logout();
  assert.equal(firstTab.status, "unauthenticated");
  assert.equal(env.localStorage.getItem(STORAGE_KEY), null);
  assert.equal(env.sessionStorage.getItem(STORAGE_KEY), null);
  env.dispatch("storage", { storageArea: env.localStorage, key: STORAGE_KEY, newValue: null });
  assert.equal(secondTab.status, "unauthenticated");
  assert.equal(secondTab.accessToken, null);
  assert.equal(secondTab.profile, null);
  assert.equal(secondTab.profileStatus, "idle");
});

test("clearing localStorage logs out open tabs, while unrelated storage events are ignored", (t) => {
  const env = setupAuth(t, { savedToken: "saved-token" });
  const tab = env.mount();
  for (const event of [
    { storageArea: env.sessionStorage, key: STORAGE_KEY, newValue: null },
    { storageArea: env.localStorage, key: "unrelated-key", newValue: null },
    { storageArea: env.localStorage, key: STORAGE_KEY, newValue: "another-token" },
  ]) env.dispatch("storage", event);
  assert.equal(tab.status, "authenticated");

  env.localStorage.clear();
  env.dispatch("storage", { storageArea: env.localStorage, key: null, newValue: null });
  assert.equal(tab.status, "unauthenticated");
});

test("remote logout cancels a pending login popup and an in-flight profile request", async (t) => {
  const env = setupAuth(t, { savedToken: "saved-token" });
  let rejectRequest;
  env.fetch.mock.mockImplementation(() => new Promise((_, reject) => { rejectRequest = reject; }));
  const tab = env.mount();
  const { signal } = env.fetch.mock.calls[0].arguments[1];
  env.localStorage.removeItem(STORAGE_KEY);
  env.dispatch("storage", { storageArea: env.localStorage, key: STORAGE_KEY, newValue: null });
  assert.equal(signal.aborted, true);
  rejectRequest(new TypeError("Network unavailable"));
  await settleRequests();
  assert.equal(tab.profile, null);
  assert.equal(tab.profileStatus, "idle");

  tab.startAuthentication();
  assert.equal(tab.status, "authenticating");
  env.dispatch("storage", { storageArea: env.localStorage, key: STORAGE_KEY, newValue: null });
  assert.equal(tab.status, "unauthenticated");
  assert.equal(env.popup.closed, true);
  env.finishLogin();
  assert.equal(env.localStorage.getItem(STORAGE_KEY), null);
});

test("unmount removes storage listeners and aborts pending requests", (t) => {
  const env = setupAuth(t, { savedToken: "saved-token" });
  const tab = env.mount();
  const { signal } = env.fetch.mock.calls[0].arguments[1];
  assert.equal(env.listeners.get("storage").size, 1);
  tab.unmount();
  assert.equal(env.listeners.get("storage").size, 0);
  assert.equal(signal.aborted, true);
});

test("a failed migration leaves the legacy JWT available for retry", (t) => {
  const env = setupAuth(t, { legacyToken: "legacy-token" });
  t.mock.method(env.localStorage, "setItem", () => { throw new Error("Storage full"); });
  const tab = env.mount();
  assert.equal(tab.status, "error");
  assert.equal(tab.accessToken, null);
  assert.equal(env.sessionStorage.getItem(STORAGE_KEY), "legacy-token");
  assert.equal(env.fetch.mock.callCount(), 0);
});

test("unavailable legacy storage does not prevent restoring a localStorage JWT", (t) => {
  const env = setupAuth(t, { savedToken: "saved-token" });
  for (const method of ["getItem", "removeItem"]) {
    t.mock.method(env.sessionStorage, method, () => { throw new Error("Storage blocked"); });
  }
  const tab = env.mount();
  assert.equal(tab.status, "authenticated");
  assert.equal(tab.accessToken, "saved-token");
});

test("a failed login write reports an error without authenticating", (t) => {
  const env = setupAuth(t);
  const tab = env.mount();
  t.mock.method(env.localStorage, "setItem", () => { throw new Error("Storage full"); });
  tab.startAuthentication();
  env.finishLogin();
  assert.equal(tab.status, "error");
  assert.equal(tab.accessToken, null);
  assert.equal(env.fetch.mock.callCount(), 0);
});

test("an unreadable localStorage reports an error and logout still clears legacy state", (t) => {
  const env = setupAuth(t, { legacyToken: "legacy-token" });
  for (const method of ["getItem", "removeItem"]) {
    t.mock.method(env.localStorage, method, () => { throw new Error("Storage blocked"); });
  }
  const tab = env.mount();
  assert.equal(tab.status, "error");
  assert.equal(env.fetch.mock.callCount(), 0);
  tab.logout();
  assert.equal(tab.status, "unauthenticated");
  assert.equal(tab.accessToken, null);
  assert.equal(env.sessionStorage.getItem(STORAGE_KEY), null);
});
