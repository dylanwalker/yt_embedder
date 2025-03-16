function saveConfiguration() {
  const urlPattern = document.getElementById("urlPattern").value;
  const xpath = document.getElementById("xpath").value;
  const textExtractor = document.getElementById("textExtractor").value;

  chrome.storage.sync.get("configurations", data => {
    const configurations = data.configurations || {};
    configurations[urlPattern] = { xpath, textExtractor };
    chrome.storage.sync.set({ configurations }, () => {
      alert("Configuration saved!");
      loadConfigurations();
    });
  });
}

function loadConfigurations() {
  chrome.storage.sync.get("configurations", data => {
    const configurations = data.configurations || {};
    const container = document.getElementById("configurations");
    container.innerHTML = "";

    for (const [urlPattern, config] of Object.entries(configurations)) {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${urlPattern}</strong>
        <p>XPath: ${config.xpath}</p>
        <p>Text Extractor: <pre>${config.textExtractor}</pre></p>
        <button data-url-pattern="${urlPattern}">Delete</button>
      `;
      div.querySelector("button").addEventListener("click", deleteConfiguration);
      container.appendChild(div);
    }
  });
}

function deleteConfiguration(event) {
  const urlPattern = event.target.dataset.urlPattern;
  chrome.storage.sync.get("configurations", data => {
    const configurations = data.configurations || {};
    delete configurations[urlPattern];
    chrome.storage.sync.set({ configurations }, loadConfigurations);
  });
}

function updateMatchCount(response) {
  const count = response.count;
  document.getElementById("matchCount").textContent = `Found ${count} matching elements`;
}

function setDefaultUrlPattern() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = new URL(tabs[0].url);
    const defaultPattern = `*://${url.hostname}/*`;
    document.getElementById("urlPattern").value = defaultPattern;

    // Check for matches when the popup is opened
    chrome.tabs.sendMessage(tabs[0].id, { action: "checkMatches" }, updateMatchCount);
  });
}

// Function to update the status image
function updateStatusImage() {
  chrome.storage.sync.get("scriptEnabled", data => {
    const isEnabled = data.scriptEnabled !== false; // Default to true if not set
    const statusImage = document.getElementById("statusImage");
    console.log(`Updating status image. Script enabled: ${isEnabled}`);
    if (statusImage) {
      if (isEnabled) {
        statusImage.src = "icons/yt_embedder_enabled128.png";
        console.log("Image set to enabled");
      } else {
        statusImage.src = "icons/yt_embedder_disabled128.png";
        console.log("Image set to disabled");
      }
    } else {
      console.error("Status image element not found");
    }
  });
}

// Function to save the toggle state
function saveToggleState() {
  const isEnabled = document.getElementById("toggleScript").checked;
  console.log(`Saving toggle state. Script enabled: ${isEnabled}`);
  chrome.storage.sync.set({ scriptEnabled: isEnabled }, updateStatusImage);
}

// Function to load the toggle state
function loadToggleState() {
  chrome.storage.sync.get("scriptEnabled", data => {
    const isEnabled = data.scriptEnabled !== false; // Default to true if not set
    console.log(`Loading toggle state. Script enabled: ${isEnabled}`);
    document.getElementById("toggleScript").checked = isEnabled;
    updateStatusImage();
  });
}

document.getElementById("save").addEventListener("click", saveConfiguration);
document.getElementById("toggleScript").addEventListener("change", saveToggleState);

document.addEventListener('DOMContentLoaded', () => {
  setDefaultUrlPattern();
  loadConfigurations();
  loadToggleState();
});
