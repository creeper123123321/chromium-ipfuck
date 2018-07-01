const possibleHeaders = ["X-Forwarded-For", "Client-Ip", "Via", "X-Real-IP"];

function parseIp(base) {
    let ip = Array();
    ip[0] = parseInt(document.getElementById(base + "a").value);
    ip[1] = parseInt(document.getElementById(base + "b").value);
    ip[2] = parseInt(document.getElementById(base + "c").value);
    ip[3] = parseInt(document.getElementById(base + "d").value);
    console.log("read: " + ip);
    return ip;
}

function fillIp(ip, base) {
    document.getElementById(base + "a").value = ip[0];
    document.getElementById(base + "b").value = ip[1];
    document.getElementById(base + "c").value = ip[2];
    document.getElementById(base + "d").value = ip[3];
}

async function fillSettingsForm() {
    document.getElementById("enabled").checked = (await browser.storage.local.get("enabled")).enabled;
    await checkFormEnabled();

    for (let header in possibleHeaders) {
        document.getElementById("header-" + possibleHeaders[header]).checked =
            (await browser.storage.local.get("headers")).headers.indexOf(possibleHeaders[header]) >= 0;
    }

    if ((await browser.storage.local.get("behaviour")).behaviour === "range") {
        document.getElementById("b-rad-range").checked = true;
    } else {
        document.getElementById("b-rad-list").checked = true;
    }

    fillIp((await (browser.storage.local.get("range_from"))).range_from, "ip-range-from-");
    fillIp((await browser.storage.local.get("range_to")).range_to, "ip-range-to-");

    document.getElementById("ip-list").value = "";
    let list = (await browser.storage.local.get("list")).list;
    for (let ip in list) {
        document.getElementById("ip-list").value += list[ip].join(".") + "\n";
    }
    document.getElementById("whitelist").value = (await browser.storage.local.get("whitelist")).whitelist.join("\n");

    document.getElementById("behaviour-sync-ips").checked = (await browser.storage.local.get("sync")).sync
}

function submitSettings() {
    let headers = [];
    possibleHeaders.forEach(h => {
        if (document.getElementById("header-" + h).checked) {
            console.log(h + ': ENABLED');
            headers.push(h);
        }
    });
    browser.storage.local.set({
        headers: headers,
        enabled: document.getElementById("enabled").checked,
        behaviour: document.getElementById("b-rad-range").checked ? "range" : "list",
        range_from: parseIp("ip-range-from-"),
        range_to: parseIp("ip-range-to-"),
        list: document.getElementById("ip-list").value.trim()
            .split("\n")
            .map(it => it.trim().split('.'))
            .filter(it => it.length === 4),
        sync: document.getElementById("behaviour-sync-ips").checked,
        whitelist: document.getElementById("whitelist").value.trim().split("\n")
    }).then(() => {
        document.getElementById("status").innerHTML = "saved.";
    });

    return false;
}

async function checkFormEnabled() {
    let d = document.getElementById("enabled");
    let fieldsets = document.getElementsByTagName("fieldset");
    for (let f in fieldsets) {
        fieldsets[f].disabled = !d.checked;
    }
    await browser.storage.local.set({
        enabled: d.checked
    })
}

document.getElementById("enabled").onclick = checkFormEnabled;
document.getElementById("form").onsubmit = submitSettings;
document.getElementById("reset-config").onclick = async function () {
    await browser.storage.local.set({
        enabled: false,
        behaviour: "range",
        range_from: [0, 0, 0, 0],
        range_to: [255, 255, 255, 255],
        list: [[0, 0, 0, 0]],
        sync: true,
        whitelist: ["http://ignore_this_domain\\.tld/.*"]
    });
    await fillSettingsForm();
    await checkFormEnabled();
};

fillSettingsForm();
