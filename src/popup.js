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
  
  document.getElementById("save").addEventListener("click", saveConfiguration);
  
  document.addEventListener('DOMContentLoaded', () => {
    setDefaultUrlPattern();
    loadConfigurations();
  });
  