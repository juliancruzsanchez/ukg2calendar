  // background.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSetting") {
      chrome.storage.sync.get(request.setting, (result) => {
        sendResponse({ value: result[request.setting] });
      });
      return true;  // Indicate that sendResponse will be called asynchronously
    }
  });

  