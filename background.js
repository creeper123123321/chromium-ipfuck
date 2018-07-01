var filter = ["<all_urls>"];

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
    if ((await browser.storage.local.get("behaviour")).behaviour === "range") {
        let ip = [];

        let range_from = (await browser.storage.local.get("range_from")).range_from;
        let range_to = (await browser.storage.local.get("range_to")).range_to;

        for (i = 0; i < 4; i++) {
            ip[i] = Math.floor(Math.random() * (range_to[i] - range_from[i] + 1) + range_from[i]);
        }
        return ip.join(".");
    }
    else {
        list = (await browser.storage.local.get("list")).list;
        return list[Math.floor(Math.random() * list.length)].join(".");
    }
}

async function handleBeforeSendHeaders(data) {
    if (!(await browser.storage.local.get("enabled")).enabled) {
        return {};
    }
    let whitelist = (await browser.storage.local.get("whitelist")).whitelist;
    for (let r in whitelist) {
        if (data.url.match(whitelist[r])) {
            console.log("whitelisted");
            return {};
        }
    }
    value = await generateIp();
    headers = (await browser.storage.local.get("headers")).headers;
    for (let h in headers) {
        if (!(await browser.storage.local.get("sync")).sync) {
            value = await generateIp();
        }
        data.requestHeaders.push({
            "name": headers[h],
            "value": value
        });
    }
    return {requestHeaders: data.requestHeaders};
}

if (!browser) browser = chrome;

browser.webRequest.onBeforeSendHeaders.addListener(
    handleBeforeSendHeaders,
    {urls: filter},
    ["blocking", "requestHeaders"]
);