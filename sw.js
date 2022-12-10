const OFFLINE_CACHE = "offline-1";
const DATA_CACHE = "data";
const FILES = [
    "/index.html",
    "/app.webmanifest",
    "/icon.svg",
    "/main.css",
    "/register-sw.js",
    "/sw.js"
];

function log(str) {
    if (!localStorage.debug) {
        localStorage.debug = "off";
    }
    if (localStorage.debug === "on") {
        if (!localStorage.logs) {
            localStorage.logs = "[]";
        }
        let list = JSON.parse(localStorage.logs);
        list.push(str)
        localStorage.logs = JSON.stringify(list);
    }
}

self.addEventListener("install", evt => {
    log("Registered");
    evt.waitUntil((async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        log("Caching files");
        await cache.addAll(FILES);
    })());
});

self.addEventListener("fetch", evt => {
    evt.respondWith((async () => {
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