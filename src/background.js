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
