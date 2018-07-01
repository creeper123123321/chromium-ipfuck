const filter = ["<all_urls>"];


/*
var enabled = false;
var headers = [];
var behaviour = "range"; // range|list
var sync = false;
var range_from = [0,0,0,0];
var range_to = [255,255,255,255];
var list = [[0,0,0,0], [1,1,1,1]];
var whitelist = [];*/

function generateIp(behaviour, range_from, range_to, list) {
    if (behaviour === "range") {
        let ip = [];

        for (let i = 0; i < 4; i++) {
            ip[i] = Math.floor(Math.random() * (range_to[i] - range_from[i] + 1) + range_from[i]);
        }
        return ip.join(".");
    }
    else {
        return list[Math.floor(Math.random() * list.length)].join(".");
    }
}

async function handleBeforeSendHeaders(data) {
    g = await browser.storage.local.get(["headers", "sync", "whitelist", "enabled", "behaviour", "range_from", "range_to", "list"]);
    if (!g.enabled) {
        return {};
    }
    let whitelist = g.whitelist;
    for (let r in whitelist) {
        if (data.url.match(whitelist[r])) {
            return {};
        }
    }
    let value;
    let headers = g.headers;
    for (let h in headers) {
        if (!g.sync || value === undefined) {
            value = generateIp(g.behaviour, g.range_from, g.range_to, g.list);
        }
        data.requestHeaders.push({
            "name": headers[h],
            "value": value
        });
    }
    return {requestHeaders: data.requestHeaders};
}

browser.webRequest.onBeforeSendHeaders.addListener(
    handleBeforeSendHeaders,
    {urls: filter},
    ["blocking", "requestHeaders"]
);