document.addEventListener('DOMContentLoaded', function() {
  const loadingElement = document.getElementById('loading');
  const safeElement = document.getElementById('safe');
  const dangerElement = document.getElementById('danger');
  const urlInfoElement = document.getElementById('url-info');
  const currentUrlElement = document.getElementById('current-url');
  const detailsContainer = document.getElementById('details-container');
  const riskFactorsList = document.getElementById('risk-factors');
  const checkButton = document.getElementById('check-button');
  const reportButton = document.getElementById('report-button');
  const probabilityContainer = document.getElementById('probability-container');
  const probabilityFill = document.getElementById('probability-fill');
  const topIndicatorsContainer = document.getElementById('top-indicators');
  const indicatorsList = document.getElementById('indicators-list');
  const addToSafeListBtn = document.getElementById('add-to-safe-list');
  
  // Navigation buttons
  document.getElementById('nav-safelist').addEventListener('click', function() {
    chrome.tabs.create({ url: 'safelist.html' });
  });
  
  document.getElementById('nav-settings').addEventListener('click', function() {
    chrome.tabs.create({ url: 'settings.html' });
  });
  
  document.getElementById('nav-report').addEventListener('click', function() {
    chrome.tabs.create({ url: 'report.html' });
  });
  
  // Get the current tab URL and check it
  function getCurrentTabUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      const url = currentTab.url;
      
      // Display the current URL
      currentUrlElement.textContent = url;
      urlInfoElement.classList.remove('hidden');
      
      // Check the URL for phishing indicators
      checkUrl(url);
    });
  }
  
  // Check URL for phishing indicators
  function checkUrl(url) {
    // Show loading state
    loadingElement.classList.remove('hidden');
    safeElement.classList.add('hidden');
    dangerElement.classList.add('hidden');
    detailsContainer.classList.add('hidden');
    reportButton.classList.add('hidden');
    probabilityContainer.classList.add('hidden');
    topIndicatorsContainer.classList.add('hidden');
    
    // Send message to background script to check the URL
    chrome.runtime.sendMessage({ action: 'checkUrl', url: url }, function(response) {
      // Hide loading state
      loadingElement.classList.add('hidden');
      
      // Process the response
      if (response.isPhishing) {
        dangerElement.classList.remove('hidden');
        detailsContainer.classList.remove('hidden');
        reportButton.classList.remove('hidden');
        
        // Display risk factors
        riskFactorsList.innerHTML = '';
        response.riskFactors.forEach(function(factor) {
          const li = document.createElement('li');
          li.textContent = factor;
          riskFactorsList.appendChild(li);
        });
        
        // Show probability meter
        probabilityContainer.classList.remove('hidden');
        const probability = response.phishingProbability * 100;
        probabilityFill.style.width = probability + '%';
        
        // Show top indicators if available
        if (response.topIndicators && response.topIndicators.length > 0) {
          topIndicatorsContainer.classList.remove('hidden');
          indicatorsList.innerHTML = '';
          
          response.topIndicators.forEach(function(indicator) {
            const indicatorItem = document.createElement('div');
            indicatorItem.className = 'indicator-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'indicator-name';
            nameSpan.textContent = formatFeatureName(indicator.feature);
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'indicator-value';
            valueSpan.textContent = (indicator.importance * 100).toFixed(1) + '%';
            
            indicatorItem.appendChild(nameSpan);
            indicatorItem.appendChild(valueSpan);
            
            indicatorsList.appendChild(indicatorItem);
          });
        }
      } else {
        safeElement.classList.remove('hidden');
        
        // Show probability meter for safe sites too
        if (response.phishingProbability !== undefined) {
          probabilityContainer.classList.remove('hidden');
          const probability = response.phishingProbability * 100;
          probabilityFill.style.width = probability + '%';
        }
      }
    });
  }
  
  // Format feature names for display
  function formatFeatureName(feature) {
    if (feature.startsWith('domain_tfidf_')) {
      return 'Domain Pattern';
    }
    
    // Convert snake_case to Title Case with spaces
    return feature
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(str) { return str.toUpperCase(); });
  }
  
  // Add current domain to safe list
  function addToSafeList() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const url = tabs[0].url;
      
      chrome.runtime.sendMessage({ 
        action: 'addToSafeList', 
        url: url 
      }, function(response) {
        if (response.success) {
          // Update UI to show site is now safe
          dangerElement.classList.add('hidden');
          safeElement.classList.remove('hidden');
          detailsContainer.classList.add('hidden');
          reportButton.classList.add('hidden');
          
          // Disable the add to safe list button
          addToSafeListBtn.textContent = 'Added to Safe List';
          addToSafeListBtn.disabled = true;
          addToSafeListBtn.style.opacity = '0.5';
          addToSafeListBtn.style.cursor = 'default';
        } else {
          alert(response.message);
        }
      });
    });
  }
  
  // Initialize
  getCurrentTabUrl();
  
  // Event listeners
  checkButton.addEventListener('click', getCurrentTabUrl);
  
  reportButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'report.html' });
  });
  
  addToSafeListBtn.addEventListener('click', addToSafeList);
});