console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request); // Log received messages

  if (request.action === "searchYouTube") {
    const query = request.query;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    console.log(`Fetching URL: ${searchUrl}`);

    fetch(searchUrl)
      .then(response => response.text())
      .then(data => {
        console.log(`Received data: ${data.length} characters`); // Avoid large output
        const videoIdMatch = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        console.log(`Extracted video ID: ${videoId}`);
        const videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        sendResponse(videoUrl);
      })
      .catch(error => {
        console.error("Error searching YouTube:", error);
        sendResponse(null);
      });

    return true;  // Will respond asynchronously
  } else {
    console.log("Unknown action:", request.action);
  }
});

function updateIcon() {
  chrome.storage.sync.get("scriptEnabled", data => {
    const isEnabled = data.scriptEnabled !== false; // Default to true if not set
    const iconPath = isEnabled ? {
      "16": "icons/yt_embedder_enabled16.png",
      "48": "icons/yt_embedder_enabled48.png",
      "128": "icons/yt_embedder_enabled128.png"
    } : {
      "16": "icons/yt_embedder_disabled16.png",
      "48": "icons/yt_embedder_disabled48.png",
      "128": "icons/yt_embedder_disabled128.png"
    };
    chrome.browserAction.setIcon({ path: iconPath });
  });
}

// Update the icon when the extension is loaded
chrome.runtime.onStartup.addListener(updateIcon);
chrome.runtime.onInstalled.addListener(updateIcon);

// Update the icon when the scriptEnabled state changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.scriptEnabled) {
    updateIcon();
  }
});
