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
    window.document.getElementById(setting).on("click", (e) => {
        setSetting(setting, e.target.checked)
    })
}

function defaultAddressHandler() {
    const textField = $("#defaultAddress")
    const button = $("#defaultAddressSave")
    button.style.display = 'hidden'
    textField.on("input", () => {
        button.style.display = 'block'
    })

    button.on("click", () => {
        setSetting("defaultAddress", textField.value)
        button.text = "Saved!"
        setTimeout(() => button.style.display = 'hidden', 1000)
    })
}

function createSavedAddressElement(location) {
    const savedAddressDiv = document.createElem("div");
    savedAddressDiv.attr("class", "saved-address");

    // Create the div for the text content
    const savedAddressTextDiv = document.createElem("div");
    savedAddressTextDiv.attr("class", "saved-address-text");

    const ukgEntryDiv = document.createElem("div");
    ukgEntryDiv.attr("class", "ukgEntry");
    ukgEntryDiv.textContent = location.ukgEntry;

    const mapsAddressDiv = document.createElem("div");
    mapsAddressDiv.attr("class", "mapsAddress");
    mapsAddressDiv.textContent = location.mapsAddress;

    const mapsAddressEditDiv = document.createElem("input");
    mapsAddressEditDiv.attr("class", "addressEdit")
    mapsAddressEditDiv.attr("placeholder", "Enter address...")
    mapsAddressEditDiv.value = location.mapsAddress;

    // Append the ukgEntry and mapsAddress to the saved-address-text div
    savedAddressTextDiv.append(ukgEntryDiv);
    savedAddressTextDiv.append(mapsAddressDiv);
    savedAddressTextDiv.append(mapsAddressEditDiv);

    // Append the saved-address-text div to the main saved-address div
    savedAddressDiv.append(savedAddressTextDiv);

    /**
     * -- BUTTONS --
     */

    // TODO: Add save icon


    // Create a div for the icons
    const actionsDiv = document.createElem("div");
    actionsDiv.attr("class", "saved-address-actions");
    actionsDiv.id = "saved-address-actions";

    // Create a span for the edit icon (pencil)
    const editSpan = document.createElem("span");
    editSpan.attr("class", "edit-icon");
    editSpan.textContent = "✏️";
    editSpan.on("click", () => {
        savedAddressDiv.attr("class", "saved-address editing")
    })

    // Create a span for the delete icon (trash can)
    const deleteSpan = document.createElem("span");
    deleteSpan.attr("class", "delete-icon");
    deleteSpan.textContent = "🗑️";

    // TODO: Add delete code
    deleteSpan.on("click", () => {

    })

    // Append the icons to the actionsDiv
    actionsDiv.append(editSpan);
    actionsDiv.append(deleteSpan);
    savedAddressDiv.append(actionsDiv);

    return savedAddressDiv;
}

async function displaySettings() {
    /** Busy Status */
    $("#busy").checked = await getSetting("busy");

    /** Reminders */
    $("#reminders").checked = await getSetting("reminders");

    /** Default Address */
    $("#defaultAddress").value = await getSetting("defaultAddress") || ""

    /** Saved Addresses */
    const savedAddressesContainer = $("#savedAddresses");
    const transferLocations = await getSetting("transferLocations");

    if (transferLocations && Array.isArray(transferLocations)) {
        transferLocations.forEach(location => {
            console.log(location)
            const savedAddressElement = createSavedAddressElement(location);
            savedAddressesContainer.append(savedAddressElement);
        });
    }
}

window.on("load", () => {
    settingToggleHandler("busy")
    settingToggleHandler("reminders")
    displaySettings();
    defaultAddressHandler()
})