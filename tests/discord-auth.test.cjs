require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const React = require("react");

test("Discord login trusts the Auth API origin and sends data requests to the Web API", async (t) => {
  const authOrigin = "https://auth.example.test";
  const webOrigin = "https://web.example.test";
  const siteOrigin = "http://localhost:5173";
  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_AUTH_BASE_URL: `${authOrigin}/`,
    NEXT_PUBLIC_API_BASE_URL: `${webOrigin}/`,
  };
  t.after(() => { process.env = originalEnv; });

  const { useDiscordAuth } = require("../lib/discord-auth.ts");
  const { fetchMembersOnlyMembers } = require("../lib/members-only-api.ts");
  t.mock.method(React, "useState", (initial) => [initial, () => {}]);
  t.mock.method(React, "useRef", (initial) => ({ current: initial }));
  t.mock.method(React, "useEffect", () => {});
  t.mock.method(React, "useCallback", (callback) => callback);

  const popup = { closed: false, close() { this.closed = true; } };
  let loginUrl;
  let receiveMessage;
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const storage = new Map();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { origin: siteOrigin },
      open(url) { loginUrl = url; return popup; },
      addEventListener(_, listener) { receiveMessage = listener; },
      removeEventListener() {},
      setInterval() { return 1; },
      clearInterval() {},
      setTimeout() { return 2; },
      clearTimeout() {},
    },
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: { setItem(key, value) { storage.set(key, value); } },
  });
  t.after(() => {
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
    else delete globalThis.window;
    if (storageDescriptor) Object.defineProperty(globalThis, "sessionStorage", storageDescriptor);
    else delete globalThis.sessionStorage;
  });

  const fetch = t.mock.method(globalThis, "fetch", async (url) => ({
    ok: true,
    json: async () => url.endsWith("/auth/me") ? { username: "member" } : { items: [] },
  }));

  useDiscordAuth().startAuthentication();
  assert.equal(loginUrl.origin, authOrigin);
  assert.equal(loginUrl.pathname, "/auth/discord/login");
  assert.equal(loginUrl.searchParams.get("return_origin"), siteOrigin);
  const attempt = loginUrl.searchParams.get("attempt");
  assert.ok(attempt);
  const data = { type: "AITC_AUTH_SUCCESS", attempt, accessToken: "test.jwt.signature" };

  receiveMessage({ origin: webOrigin, source: popup, data });
  assert.equal(storage.size, 0);
  assert.equal(fetch.mock.callCount(), 0);

  receiveMessage({ origin: authOrigin, source: popup, data });
  assert.equal(storage.get("aitcAccessToken"), data.accessToken);
  await fetchMembersOnlyMembers(data.accessToken, new AbortController().signal);

  const requests = fetch.mock.calls.map(({ arguments: [url, options] }) => (
    [url, options.headers.Authorization]
  ));
  assert.deepEqual(requests, [
    [`${webOrigin}/auth/me`, `Bearer ${data.accessToken}`],
    [`${webOrigin}/members-only/members`, `Bearer ${data.accessToken}`],
  ]);
});
