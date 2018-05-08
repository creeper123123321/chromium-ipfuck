// todo 'can't access dead object' in firefox
function parseIp(base) {
    var ip = Array();
    ip[0] = parseInt(document.getElementById(base+"a").value);
    ip[1] = parseInt(document.getElementById(base+"b").value);
    ip[2] = parseInt(document.getElementById(base+"c").value);
    ip[3] = parseInt(document.getElementById(base+"d").value);
    console.log("read: "+ip);
    return ip;
}

function fillIp(ip, base) {
    document.getElementById(base+"a").value = ip[0];
    document.getElementById(base+"b").value = ip[1];
    document.getElementById(base+"c").value = ip[2];
    document.getElementById(base+"d").value = ip[3];
}

function fillSettingsForm() {
    var bg = chrome.extension.getBackgroundPage();
    
    document.getElementById("enabled").checked = bg.enabled;
    checkFormEnabled();
    
    bg.possibleHeaders.forEach(x => {
        if (bg.headers.indexOf(x) >= 0) {
            document.getElementById("header-"+x).checked = 1;
        }
    })
    
    if (bg.behaviour === "range") {
        document.getElementById("b-rad-range").checked = 1;
    } else {
        document.getElementById("b-rad-list").checked = 1;
    }
    
    fillIp(bg.range_from, "ip-range-from-");
    fillIp(bg.range_to, "ip-range-to-");
    
    document.getElementById("ip-list").value = "";
    for (ip in bg.list) {
        document.getElementById("ip-list").value += bg.list[ip].join(".")+"\n";
    }
    document.getElementById("whitelist").value = bg.whitelist.join("\n");
    
    document.getElementById("behaviour-sync-ips").checked = bg.sync;
}

function submitSettings() {
    var bg = chrome.extension.getBackgroundPage();
    bg.headers = [];
    bg.possibleHeaders.forEach(h => {
        if (document.getElementById("header-"+h).checked) {
            console.log(h+': ENABLED');
            bg.headers.push(h);
        }
    })
    
    bg.enabled = document.getElementById("enabled").checked;
    
    if (document.getElementById("b-rad-range").checked) {
        bg.behaviour = "range";
    } else {
        bg.behaviour = "list";
    }
    bg.range_from = parseIp("ip-range-from-");
    bg.range_to = parseIp("ip-range-to-");
    
    bg.list = document.getElementById("ip-list").value.trim()
        .split("\n")
        .map(it => it.trim().split('.'))
        .filter(it.length === 4);
    
    bg.sync = document.getElementById("behaviour-sync-ips").checked;
    
    bg.whitelist = document.getElementById("whitelist").value.trim().split("\n");

    bg.saveSettings();
    bg.applySettings();
    bg.reload();
    document.getElementById("status").innerHTML = "saved.";
    return false;
}

function checkFormEnabled() {
    var bg = chrome.extension.getBackgroundPage();
    var d = document.getElementById("enabled");
    var fieldsets = document.getElementsByTagName("fieldset");
    for (f in fieldsets) {
        fieldsets[f].disabled = !d.checked;
    }
    bg.enabled = d.checked;
}

document.getElementById("enabled").onclick = checkFormEnabled;
document.getElementById("form").onsubmit = submitSettings;
document.getElementById("reset-config").onclick = function() {
    var bg = chrome.extension.getBackgroundPage();
    bg.loadDefaultSettings();
    fillSettingsForm();
    checkFormEnabled();
};

fillSettingsForm();
checkFormEnabled();

