chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "download") {
    const jsonStr = JSON.stringify(message.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const reader = new FileReader();

    reader.onload = function () {
      chrome.downloads.download({
        url: reader.result, // data URL
        filename: "events-log.json"
      });
    };

    reader.readAsDataURL(blob);
    sendResponse({ status: "download started" });
  }
});
