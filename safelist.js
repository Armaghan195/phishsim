document.addEventListener('DOMContentLoaded', function() {
  const domainInput = document.getElementById('domain-input');
  const addDomainBtn = document.getElementById('add-domain-btn');
  const safeListContainer = document.getElementById('safe-list');
  const emptyListMessage = document.getElementById('empty-list-message');
  
  // Navigation tabs
  document.getElementById('tab-home').addEventListener('click', function() {
    chrome.action.openPopup();
  });
  
  document.getElementById('tab-settings').addEventListener('click', function() {
    chrome.tabs.create({ url: 'settings.html' });
  });
  
  document.getElementById('tab-report').addEventListener('click', function() {
    chrome.tabs.create({ url: 'report.html' });
  });
  
  // Load safe list
  function loadSafeList() {
    chrome.runtime.sendMessage({ action: 'getSafeList' }, function(response) {
      const safeList = response.safeList;
      
      // Clear current list
      safeListContainer.innerHTML = '';
      
      if (safeList.length === 0) {
        safeListContainer.appendChild(emptyListMessage);
      } else {
        // Hide empty message
        if (emptyListMessage.parentNode === safeListContainer) {
          safeListContainer.removeChild(emptyListMessage);
        }
        
        // Add each domain to the list
        safeList.forEach(function(domain) {
          addDomainToList(domain);
        });
      }
    });
  }
  
  // Add domain to the visual list
  function addDomainToList(domain) {
    const listItem = document.createElement('div');
    listItem.className = 'safe-list-item';
    
    const domainSpan = document.createElement('span');
    domainSpan.className = 'domain';
    domainSpan.textContent = domain;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function() {
      removeDomain(domain);
    });
    
    listItem.appendChild(domainSpan);
    listItem.appendChild(removeBtn);
    
    safeListContainer.appendChild(listItem);
  }
  
  // Add domain to safe list
  function addDomain() {
    const domain = domainInput.value.trim().toLowerCase();
    
    if (!domain) {
      alert('Please enter a domain');
      return;
    }
    
    // Simple domain validation
    if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(domain)) {
      alert('Please enter a valid domain (e.g., example.com)');
      return;
    }
    
    chrome.runtime.sendMessage({ 
      action: 'addToSafeList', 
      url: 'https://' + domain 
    }, function(response) {
      if (response.success) {
        domainInput.value = '';
        loadSafeList();
      } else {
        alert(response.message);
      }
    });
  }
  
  // Remove domain from safe list
  function removeDomain(domain) {
    if (confirm('Are you sure you want to remove ' + domain + ' from your safe list?')) {
      chrome.runtime.sendMessage({ 
        action: 'removeFromSafeList', 
        domain: domain 
      }, function(response) {
        if (response.success) {
          loadSafeList();
        } else {
          alert(response.message);
        }
      });
    }
  }
  
  // Event listeners
  addDomainBtn.addEventListener('click', addDomain);
  
  domainInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addDomain();
    }
  });
  
  // Initial load
  loadSafeList();
});