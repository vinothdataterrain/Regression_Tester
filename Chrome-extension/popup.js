function injectContentScript(tabId, callback) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["content.js"]
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Script injection failed:", chrome.runtime.lastError.message);
        updateStatus("Failed to inject script", "red");
      } else {
        console.log("Content script injected");
        if (callback) callback();
      }
    }
  );
}

function sendToContent(action, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      updateStatus("No active tab", "red");
      return;
    }

    const tabId = tabs[0].id;
    
    // First try to send message
    chrome.tabs.sendMessage(tabId, { action }, (response) => {
      if (chrome.runtime.lastError) {
        // console.warn("No content script in this tab, injecting...", chrome.runtime.lastError.message);
        
        // If content script not available, inject it first
        injectContentScript(tabId, () => {
          // Wait a bit for script to initialize, then try again
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Still failed after injection:", chrome.runtime.lastError.message);
                updateStatus("Failed to communicate with content script", "red");
                return;
              }
              if (callback) callback(response);
            });
          }, 100);
        });
        return;
      }
      if (callback) callback(response);
    });
  });
}

function updateStatus(text, color = "green") {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = "Status: " + text;
    statusEl.style.color = color;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("start")?.addEventListener("click", () => {
    sendToContent("startRecording", (res) => {
      console.log("Start response:", res);
      updateStatus("Recording...", "green");
    });
  });

  document.getElementById("stop")?.addEventListener("click", () => {
    sendToContent("stopRecording", (res) => {
      console.log("Stop response:", res);
      updateStatus("Stopped", "red");
    });
  });

  document.getElementById("download")?.addEventListener("click", () => {
    sendToContent("getEvents", (response) => {
      console.log("Download response:", response);
      
      // Fix for the undefined slice error
      if (!response || !Array.isArray(response) || response.length === 0) {
        updateStatus("No events to download", "orange");
        return;
      }
      
      chrome.runtime.sendMessage({ action: "download", data: response }, (result) => {
        if (chrome.runtime.lastError) {
          console.error("Download failed:", chrome.runtime.lastError.message);
          updateStatus("Download failed", "red");
        } else {
          updateStatus("Downloaded", "blue");
        }
      });
    });
  });

  document.getElementById("clear")?.addEventListener("click", () => {
    sendToContent("clearEvents", (res) => {
      console.log("Clear response:", res);
      updateStatus("Cleared logs", "orange");
    });
  });
});