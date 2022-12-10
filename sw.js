const OFFLINE_CACHE = "offline-4";
const DATA_CACHE = "data";
const FILES = [
  "/index.html",
  "/app.webmanifest",
  "/icon.svg",
  "/main.css",
  "/register-sw.js",
  "/sw.js"
];
let _log;
function log(...args) {
  _log('[SW]', args)
}
function prettyLog(first, ...args) {
  args.unshift('[SW] ' + first);
  _log(args)
}
if (self.BroadcastChannel) {
  const LOG_CHANNEL = new BroadcastChannel('sw-logs');
  let debugModeVal = null;
  let queue = [];
  LOG_CHANNEL.onmessage = function(_debugModeVal) {
    debugModeVal = _debugModeVal;
    let i=-1;
    while (true) {
      i++;
      let q = queue[i];
      if ([undefined, null].includes(q)) {
        break;
      }
      _log(q)
    }
    queue = null;
  };
  LOG_CHANNEL.postMessage('sw-ready')
  _log = function(args) {
    if (debugModeVal === "on") {
      LOG_CHANNEL.postMessage(args);
    }
    else if (debugModeVal === null) {
      if (!queue) {
        LOG_CHANNEL.postMessage(args);
      }
      queue.push(args);
    }
  };
}
else {
  _log = function() {};
}

self.addEventListener("install", function(evt) {
  log("Registered");
  evt.waitUntil((async function() {
    const cache = await caches.open(OFFLINE_CACHE);
    log("Caching files");
    await cache.addAll(FILES);
  })());
});

self.addEventListener("fetch", function(evt) {
  evt.respondWith((async function() {
    try {
      const preload = await evt.preloadResponse;
      if (preload) {
        return preload;
      }
      return (await fetch(evt.request));
    }
    catch (err) {
      log("Fetch failed, returning cache");
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(OFFLINE_URL);
      return cachedResponse;
    }
  })());
});