function setSetting(setting, val) {
    let set = {}
    set[setting] = val;

    if (chrome) {
        chrome.storage.sync.set(set)
        console.log(`Set ${setting} to ${val}`)
    } else {
        browser.storage.sync.set(set)
        console.log(`Set ${setting} to ${val}`)
    }
}

function getSetting(setting) {
    return new Promise((res, rej) => {
        if (chrome) {
            chrome.storage.sync.get(setting).then(response => { res(response[setting]) })
        } else {
            browser.storage.sync.get(setting).then(response => { res(response[setting]) })
        }
    })
}

function settingToggleHandler(setting) {
    window.document.getElementById(setting).addEventListener("click", (e) => {
        setSetting(setting, e.target.checked)
    })
}

function defaultAddressHandler() {
    const textField = window.document.getElementById("defaultAddress")
    const button = window.document.getElementById("defaultAddressSave")
    button.style.display = 'hidden'
    textField.addEventListener("input", () => {
        button.style.display = 'block'
    })

    button.addEventListener("click", () => {
        setSetting("defaultAddress", textField.value)
        button.innerText = "Saved!"
        setTimeout(() => button.style.display = 'hidden', 1000)
    })
}

function createSavedAddressElement(location) {
    const savedAddressDiv = document.createElement("div");
    savedAddressDiv.classList.add("saved-address");

    // Create the div for the text content
    const savedAddressTextDiv = document.createElement("div");
    savedAddressTextDiv.classList.add("saved-address-text");

    const ukgEntryDiv = document.createElement("div");
    ukgEntryDiv.classList.add("ukgEntry");
    ukgEntryDiv.textContent = location.ukgEntry;

    const mapsAddressDiv = document.createElement("div");
    mapsAddressDiv.classList.add("mapsAddress");
    mapsAddressDiv.textContent = location.mapsAddress;

    // Append the ukgEntry and mapsAddress to the saved-address-text div
    savedAddressTextDiv.appendChild(ukgEntryDiv);
    savedAddressTextDiv.appendChild(mapsAddressDiv);

    // Append the saved-address-text div to the main saved-address div
    savedAddressDiv.appendChild(savedAddressTextDiv);


    // Create a div for the icons
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("saved-address-actions");
    actionsDiv.id = "saved-address-actions";

    // Create a span for the edit icon (pencil)
    const editSpan = document.createElement("span");
    editSpan.classList.add("edit-icon");
    editSpan.textContent = "✏️";
    editSpan.addEventListener("click", () => {

    })

    // Create a span for the delete icon (trash can)
    const deleteSpan = document.createElement("span");
    deleteSpan.classList.add("delete-icon");
    deleteSpan.textContent = "🗑️";
    deleteSpan.addEventListener("click", () => {

    })

    // Append the icons to the actionsDiv
    actionsDiv.appendChild(editSpan);
    actionsDiv.appendChild(deleteSpan);
    savedAddressDiv.appendChild(actionsDiv);

    return savedAddressDiv;
}

async function displaySettings() {
    /** Busy Status */
    window.document.getElementById("busy").checked = await getSetting("busy");

    /** Reminders */
    window.document.getElementById("reminders").checked = await getSetting("reminders");

    /** Default Address */
    window.document.getElementById("defaultAddress").value = await getSetting("defaultAddress")

    /** Saved Addresses */
    const savedAddressesContainer = document.getElementById("savedAddresses");
    const transferLocations = await getSetting("transferLocations");

    if (transferLocations && Array.isArray(transferLocations)) {
        transferLocations.forEach(location => {
            console.log(location)
            const savedAddressElement = createSavedAddressElement(location);
            savedAddressesContainer.appendChild(savedAddressElement);
        });
    }
}

window.addEventListener("load", () => {
    settingToggleHandler("busy")
    settingToggleHandler("reminders")
    displaySettings();
    defaultAddressHandler()
})