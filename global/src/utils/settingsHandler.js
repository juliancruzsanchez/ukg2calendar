
function getSetting(setting) {
    return new Promise((res) => {
        chrome.runtime.sendMessage({ action: "getSetting", setting: setting }, (response) => {
            res(response.value);
        });
    });
}

function setSetting(setting, value) {
    return new Promise((res) => {
        chrome.runtime.sendMessage({ action: "setSetting", setting: setting, value: value }, (response) => {
            res(response.value);
        });
    });
}

const settings = {
    get: getSetting,
    set: setSetting
}

async function setDefaultSettings() {
    try {
        if (await getSetting("busy") === undefined) {
            await setSetting("busy", false);
        }

        if (await getSetting("transferLocations") === undefined) {
            await setSetting("transferLocations", []);
        }

        if (await getSetting("defaultAddress") === undefined) {
            await setSetting("defaultAddress", "");
        }

        if (await getSetting("reminders") === undefined) {
            await setSetting("reminders", true);
        }

    } catch (error) {
        console.error("An error occurred while setting defaults:", error);
    }
}

// Call the async function to execute
setDefaultSettings();

window.settings = settings
