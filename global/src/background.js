// background.js

chrome.runtime.onStartup.addListener(() => {
  console.log(`onStartup()`);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSetting") {
    console.log("getSetting:", request.setting)
    chrome.storage.sync.get(request.setting, (result) => {
      sendResponse({ value: result[request.setting] });
    });
    return true;  // Indicate that sendResponse will be called asynchronously
  } else if (request.action === 'setSetting') {
    setSetting(request.setting, request.value);
    sendResponse({ value: 'ok' });
    return true;
  }
});

function setSetting(setting, val) {
  let set = {};
  set[setting] = val;
  chrome.storage.sync.set(set).then(() => {
    console.log(`Set ${setting} to ${val}`);
  });
} 