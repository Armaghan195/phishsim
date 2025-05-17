document.addEventListener("DOMContentLoaded", function() {
  const loadingElement = document.getElementById("loading");
  const safeElement = document.getElementById("safe");
  const dangerElement = document.getElementById("danger");
  const urlInfoElement = document.getElementById("url-info");
  const currentUrlElement = document.getElementById("current-url");
  const detailsContainer = document.getElementById("details-container");
  const riskFactorsList = document.getElementById("risk-factors");
  const checkButton = document.getElementById("check-button");
  const reportButton = document.getElementById("report-button");

  // Get the current tab URL and check it
  function getCurrentTabUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      const url = currentTab.url;
      
      // Display the current URL
      currentUrlElement.textContent = url;
      urlInfoElement.classList.remove("hidden");
      
      // Check the URL for phishing indicators
      checkUrl(url);
    });
  }

  // Check URL for phishing indicators
  function checkUrl(url) {
    // Show loading state
    loadingElement.classList.remove("hidden");
    safeElement.classList.add("hidden");
    dangerElement.classList.add("hidden");
    detailsContainer.classList.add("hidden");
    reportButton.classList.add("hidden");
    
    // Send message to background script to check the URL
    chrome.runtime.sendMessage({ action: "checkUrl", url: url }, function(response) {
      // Hide loading state
      loadingElement.classList.add("hidden");
      
      // Process the response
      if (response.isPhishing) {
        dangerElement.classList.remove("hidden");
        detailsContainer.classList.remove("hidden");
        reportButton.classList.remove("hidden");
        
        // Display risk factors
        riskFactorsList.innerHTML = "";
        response.riskFactors.forEach(function(factor) {
          const li = document.createElement("li");
          li.textContent = factor;
          riskFactorsList.appendChild(li);
        });
      } else {
        safeElement.classList.remove("hidden");
      }
    });
  }

  // Initialize
  getCurrentTabUrl();
  
  // Event listeners
  checkButton.addEventListener("click", getCurrentTabUrl);
  
  reportButton.addEventListener("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const url = tabs[0].url;
      // Open a new tab with a report form (this is a placeholder URL)
      chrome.tabs.create({ url: "https://report.phishsim.example/report?url=" + encodeURIComponent(url) });
    });
  });
});