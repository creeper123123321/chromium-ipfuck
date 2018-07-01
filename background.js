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


async function generateIp() {
    g = (await browser.storage.local.get(["behaviour", "range_from", "range_to", "list"]));
    if (g.behaviour === "range") {
        let ip = [];

        let range_from = g.range_from;
        let range_to = g.range_to;

        for (i = 0; i < 4; i++) {
            ip[i] = Math.floor(Math.random() * (range_to[i] - range_from[i] + 1) + range_from[i]);
        }
        return ip.join(".");
    }
    else {
        list = g.list;
        return list[Math.floor(Math.random() * list.length)].join(".");
    }
}

async function handleBeforeSendHeaders(data) {
    g = (await browser.storage.local.get(["headers", "sync", "whitelist", "enabled"]));
    if (!g.enabled) {
        return {};
    }
    let whitelist = g.whitelist;
    for (let r in whitelist) {
        if (data.url.match(whitelist[r])) {
            console.log("whitelisted");
            return {};
        }
    }
    value = await generateIp();
    headers = g.headers;
    for (let h in headers) {
        if (!g.sync) {
            value = await generateIp();
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