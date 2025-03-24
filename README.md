# UKG Calendar Exporter

## What is UKG 2 Calendar?

This is an extension/script that extracts shift information from UKG and returns an uploadable file for most calendar apps. 

## How do I use it?

To use UKG 2 Calendar you need to go to the calendar view of UKG after installed the script/extension, from here there will be instructions to get the calendar file. Press the print icon then hit preview, after the printing dialog disappears it will begin the download, in the prompt that appears there will be links with instructions on how to import to your desired calendar.

## Installing the Unpacked Extension (Chromium-based)

This guide explains how to install the UKG Calendar Exporter extension on Chrome or Edge from its unpacked source code.

### Steps

1. **Download the Source Code:**
   - Download the source code for the extension from [the repository](https://github.com/juliancruzsanchez/ukg2calendar). You can do this by clicking the "Code" button and selecting "Download ZIP".

2. **Extract the ZIP File:**
   - Locate the downloaded ZIP file and extract its contents to a directory you can easily access.

3. **Open the Extensions Page in Your Browser:**
   - **Chrome:** Type `chrome://extensions` in the address bar and press Enter.
   - **Edge:** Type `edge://extensions` in the address bar and press Enter.

4. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top right corner of the extensions page.

5. **Load the Unpacked Extension:**
   - Click the "Load unpacked" button that appears when Developer Mode is enabled.
   - In the file dialog, navigate to the directory where you extracted the extension's source code, go into `chromium/src` and select that folder.

6. **Confirmation:**
   - The UKG Calendar Exporter extension should now be installed and visible on your extensions page.

## Installing and Importing Scripts to Tampermonkey

Tampermonkey is a userscript manager that lets you run custom JavaScript code on websites. This section guides you on installing Tampermonkey and importing scripts.

### Steps

1. **Install Tampermonkey:**
   - Go to the Tampermonkey website: [https://www.tampermonkey.net/](https://www.tampermonkey.net/)
   - Click the "Download" button for your specific browser (Chrome, Edge, Firefox, etc.)
   - Follow the on-screen instructions to install the Tampermonkey extension.

2. **Import a Userscript:**
   - **Method 1: Using a URL:**
     - Copy the userscript file link: [https://raw.githubusercontent.com/juliancruzsanchez/ukg2calendar/refs/heads/main/tampermonkey/ukg2calendar.js](https://raw.githubusercontent.com/juliancruzsanchez/ukg2calendar/refs/heads/main/tampermonkey/ukg2calendar.js)
     - Open Tampermonkey's dashboard (usually by clicking the Tampermonkey icon in your browser).
     - Click the "Utilities" tab to import a new script.
     - Paste the userscript URL into the Import from URL field that appears and press Install.
     - Review the script and click "Install" to add it to Tampermonkey.
   - **Method 2: From a Local File:**
     - Download the source code for the extension from [the repository](https://github.com/juliancruzsanchez/ukg2calendar). You can do this by clicking the "Code" button and selecting "Download ZIP".
     - Locate the file `./tampermonkey/ukg2calendar.js`
     - Open Tampermonkey's dashboard (usually by clicking the Tampermonkey icon in your browser).
     - Click the "Utilities" tab to import a new script.
     - Choose the file by clicking the Import File button that appears.
     - Review the script and click "Install" to add it to Tampermonkey.
