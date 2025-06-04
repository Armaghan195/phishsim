document.addEventListener('DOMContentLoaded', function() {
  const useMLToggle = document.getElementById('use-ml');
  const sensitivityLow = document.getElementById('sensitivity-low');
  const sensitivityMedium = document.getElementById('sensitivity-medium');
  const sensitivityHigh = document.getElementById('sensitivity-high');
  const showNotificationsToggle = document.getElementById('show-notifications');
  const safeNotificationsToggle = document.getElementById('safe-notifications');
  const autoBlockToggle = document.getElementById('auto-block');
  const saveBtn = document.getElementById('save-settings');
  const successMessage = document.getElementById('success-message');
  
  // Navigation tabs
  document.getElementById('tab-home').addEventListener('click', function() {
    chrome.action.openPopup();
  });
  
  document.getElementById('tab-safelist').addEventListener('click', function() {
    chrome.tabs.create({ url: 'safelist.html' });
  });
  
  document.getElementById('tab-report').addEventListener('click', function() {
    chrome.tabs.create({ url: 'report.html' });
  });
  
  // Load current settings
  function loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, function(response) {
      const settings = response.settings;
      
      useMLToggle.checked = settings.useMachineLearning;
      
      if (settings.detectionSensitivity === 'low') {
        sensitivityLow.checked = true;
      } else if (settings.detectionSensitivity === 'medium') {
        sensitivityMedium.checked = true;
      } else if (settings.detectionSensitivity === 'high') {
        sensitivityHigh.checked = true;
      }
      
      showNotificationsToggle.checked = settings.showNotifications;
      safeNotificationsToggle.checked = settings.safeNotifications;
      autoBlockToggle.checked = settings.autoBlockPhishing;
    });
  }
  
  // Save settings
  saveBtn.addEventListener('click', function() {
    let sensitivity = 'medium';
    if (sensitivityLow.checked) sensitivity = 'low';
    if (sensitivityHigh.checked) sensitivity = 'high';
    
    const settings = {
      useMachineLearning: useMLToggle.checked,
      detectionSensitivity: sensitivity,
      showNotifications: showNotificationsToggle.checked,
      safeNotifications: safeNotificationsToggle.checked,
      autoBlockPhishing: autoBlockToggle.checked
    };
    
    chrome.runtime.sendMessage({ 
      action: 'saveSettings', 
      settings: settings 
    }, function(response) {
      if (response.success) {
        // Show success message
        successMessage.style.display = 'block';
        
        // Hide success message after 3 seconds
        setTimeout(function() {
          successMessage.style.display = 'none';
        }, 3000);
      } else {
        alert('Error saving settings: ' + response.message);
      }
    });
  });
  
  // Initial load
  loadSettings();
});