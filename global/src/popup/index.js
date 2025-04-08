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
        button.text("Saved!");
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
    ukgEntryDiv.text(location.ukgEntry);

    const addressDiv = document.createElem("div");
    addressDiv.attr("class", "address");
    addressDiv.text(location.address);

    const addressEditInput = document.createElem("input");
    addressEditInput.attr("class", "addressEdit")
    addressEditInput.attr("placeholder", "Enter address...")
    addressEditInput.value = location.address;

    // Append the ukgEntry and address to the saved-address-text div
    savedAddressTextDiv.append(ukgEntryDiv);
    savedAddressTextDiv.append(addressDiv);
    savedAddressTextDiv.append(addressEditInput);

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
    editSpan.attr("class", "icon edit-icon");
    editSpan.text("✏️");
    editSpan.on("click", () => {
        savedAddressDiv.attr("class", "saved-address editing")
    })

    // Create a span for the delete icon (trash can)
    const deleteSpan = document.createElem("span");
    deleteSpan.attr("class", "icon delete-icon");
    deleteSpan.text("🗑️");

    // TODO: Get delete code working : deleting first works but second doesn't haven't tried 3+ yet
    deleteSpan.on("click", () => {
        getSetting("transferLocations").then(_tL => {
            alert("Work in progress, reinstall extension to delete.")
            if (false) {
                let tL = _tL || []
                console.log(tL)
                const index = tL.indexOf(tL.find(x => x.ukgEntry == location.ukgEntry))
                tL = tL.splice(index, 1)
                console.log(tL)
                setSetting("transferLocations", tL)
                savedAddressDiv.remove()
            }
        })
    })

    // Create a span for the save icon (floppy)
    const saveSpan = document.createElem("span");
    saveSpan.attr("class", "icon save-icon");
    saveSpan.text("💾");

    saveSpan.on("click", () => {
        getSetting("transferLocations").then(_tL => {
            let tL = _tL || []
            const index = tL.indexOf(tL.find(x => x.ukgEntry == location.ukgEntry))
            tL[index] = { ukgEntry: location.ukgEntry, address: addressEditInput.value }
            setSetting("transferLocations", tL)
            savedAddressDiv.attr("class", "saved-address")
            addressDiv.text(addressEditInput.value)
        })
    })

    // Append the icons to the actionsDiv
    actionsDiv.append(editSpan);
    actionsDiv.append(deleteSpan);
    actionsDiv.append(saveSpan)
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
        if (transferLocations.length == 0) {
            let placeholder = document.createElem("div")
            placeholder.attr("class", "address-placeholder")
            placeholder.html("No Addresses Saved!")
            savedAddressesContainer.append(placeholder)
        } else {
            transferLocations.forEach(location => {
                console.log(location)
                const savedAddressElement = createSavedAddressElement(location);
                savedAddressesContainer.append(savedAddressElement);
            });
        }
    }
}

window.on("load", () => {
    settingToggleHandler("busy")
    settingToggleHandler("reminders")
    displaySettings();
    defaultAddressHandler()
})