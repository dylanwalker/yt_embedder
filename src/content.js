chrome.storage.sync.get("scriptEnabled", data => {
    if (data.scriptEnabled === false) {
        console.log("YouTube Embdder is disabled. Exiting.");
        return; // Exit if the script is disabled
    }

    console.log("YouTube Embedder is enabled. Loading...");

    // Simple cache object
    const youtubeSearchCache = {};

    // Store overlays by search term.
    const overlays = {};

    // Store the currently visible overlay and its element
    let currentOverlay = null;
    let currentElement = null;

    function createOverlay() {
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.border = "1px solid #ccc";
        overlay.style.backgroundColor = "white";
        overlay.style.padding = "10px";
        overlay.style.zIndex = 1000;
        overlay.style.display = "none";
        overlay.innerHTML = "Loading...";
        document.body.appendChild(overlay);
        return overlay;
    }

    function updateOverlay(overlay, videoUrl) {
        if (overlay) {
            if (videoUrl) {
                console.log(`Updating overlay to videoUrl = ${videoUrl}`)
                overlay.innerHTML = `<iframe width="560" height="315" id="${videoUrl}" src="${videoUrl}?enablejsapi=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                overlay.videoUrl = videoUrl;
            } else {
                overlay.innerHTML = "No video found.";
            }
        }
    }

    function pauseVideo(overlay) {
        console.log("Attempting to pause the video.")
        const this_overlay = document.getElementById(overlay.videoUrl);
        // If the user clicks away before the video has loaded, the overlay could be null; if not, try to pause it.
        if (this_overlay) { 
            this_overlay.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');
        }
    }

    function displayOverlay(element, overlay) {
        // If the overlay is already being displayed for the current element, do nothing.
        if (currentOverlay === overlay && currentElement === element && overlay.innerHTML !== "Loading...") {
            console.log("Overlay already loaded for this element. Skipping reload.");
            return;
        }

        // Hide any existing overlay
        hideCurrentOverlay();

        const rect = element.getBoundingClientRect();
        overlay.style.top = `${rect.bottom + window.scrollY + 10}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.display = "block";

        // Update the currentOverlay variable.
        currentOverlay = overlay;
        currentElement = element; // Store the element that triggered this overlay

        // Add event listener to hide the overlay when clicking outside
        document.addEventListener('click', function (event) {
            if (!overlay.contains(event.target) && event.target !== element) {
                hideCurrentOverlay(); // Hide and pause the video
            }
        }, { once: true }); // Remove the listener after it is executed
    }

    function hideCurrentOverlay() {
        if (currentOverlay) {
            pauseVideo(currentOverlay); // PAUSE THE VIDEO
            currentOverlay.style.display = "none";
            currentOverlay = null; // Reset the currentOverlay variable.
            currentElement = null; // Also clear the related element
        }
    }

    function embedVideos(element, searchText) {
        console.log(`embedVideos called. Searching for: ${searchText}`);

        // Check if an overlay already exists for this search term
        if (overlays[searchText]) {
            console.log(`Reusing existing overlay for ${searchText}`);
            const overlay = overlays[searchText];
            displayOverlay(element, overlay); // Just display the existing overlay
            return;
        }

        // Create the overlay immediately
        const overlay = createOverlay();
        overlays[searchText] = overlay; // Store the overlay

        // Display overlay and automatically hide other overlays
        displayOverlay(element, overlay);
        // Check if the search query is already cached
        if (youtubeSearchCache[searchText]) {
            console.log(`Cache hit for ${searchText}: ${youtubeSearchCache[searchText]}`);
            updateOverlay(overlay, youtubeSearchCache[searchText]);
            return;
        }

        chrome.runtime.sendMessage({ action: "searchYouTube", query: searchText }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
                updateOverlay(overlay, null);
                return;
            }

            console.log(`Received video URL: ${response}`);
            if (response) {
                // Store the result in the cache
                youtubeSearchCache[searchText] = response;
                updateOverlay(overlay, response);
            } else {
                console.log("No video URL received");
                updateOverlay(overlay, null);
            }
        });
    }

    function checkMatches(xpath) {
        const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        console.log(`Found ${elements.snapshotLength} matching elements for XPath: ${xpath}`);
        return elements.snapshotLength;
    }

    function addEventListeners(xpath, textExtractor) {
        const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < elements.snapshotLength; i++) {
            const element = elements.snapshotItem(i);
            if (!element.dataset.hoverListenerAdded) {
                element.dataset.hoverListenerAdded = 'true';
                console.log(`Adding mouseover event listener to ${element}.`)
                element.addEventListener("mouseover", () => {
                    const searchText = textExtractor(element);
                    console.log(`Mouse over: ${searchText}`);
                    embedVideos(element, searchText);
                });
            }
        }
    }

    function observeDOM(xpath, textExtractor) {
        // Add event listeners to existing elements
        addEventListeners(xpath, textExtractor);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                console.log("ObserverDOM detected a new mutation.")
                addEventListeners(xpath, textExtractor);
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }

    chrome.storage.sync.get("configurations", data => {
        console.log("Getting configuration.")
        const configurations = data.configurations || {};
        for (const [urlPattern, config] of Object.entries(configurations)) {
            const regex = new RegExp(urlPattern.replace(/\*/g, ".*"));
            if (regex.test(window.location.href)) {
                console.log(`Loaded page matches an existing configuration.`)
                const xpath = config.xpath;
                try {
                    const textExtractor = new Function("element", config.textExtractor);
                    observeDOM(xpath, textExtractor);
                } catch (error) {
                    console.error("Invalid textExtractor function:", error);
                }
                break;
            }
        }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "checkMatches") {
            chrome.storage.sync.get("configurations", data => {
                const configurations = data.configurations || {};
                let matchCount = 0;
                for (const [urlPattern, config] of Object.entries(configurations)) {
                    const regex = new RegExp(urlPattern.replace(/\*/g, ".*"));
                    if (regex.test(window.location.href)) {
                        const xpath = config.xpath;
                        matchCount = checkMatches(xpath);
                        break;
                    }
                }
                sendResponse({ count: matchCount });
            });
            return true; // Will respond asynchronously
        }
    });

    // Listen for messages from iframes
    window.addEventListener('message', function (event) {
        if (event.data.action === 'pauseVideo') {
            // Get the iframe element
            var iframe = event.target;

            // Create a click event
            var clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            // Dispatch the click event to the iframe's content
            iframe.dispatchEvent(clickEvent);
        }
    });
});
