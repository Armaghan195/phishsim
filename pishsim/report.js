document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('url-input');
  const isPhishingYes = document.getElementById('is-phishing-yes');
  const isPhishingNo = document.getElementById('is-phishing-no');
  const reportType = document.getElementById('report-type');
  const feedback = document.getElementById('feedback');
  const submitBtn = document.getElementById('submit-report');
  const successMessage = document.getElementById('success-message');
  
  // Navigation tabs
  document.getElementById('tab-home').addEventListener('click', function() {
    chrome.action.openPopup();
  });
  
  document.getElementById('tab-safelist').addEventListener('click', function() {
    chrome.tabs.create({ url: 'safelist.html' });
  });
  
  document.getElementById('tab-settings').addEventListener('click', function() {
    chrome.tabs.create({ url: 'settings.html' });
  });
  
  // Pre-fill URL if available
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0 && tabs[0].url) {
      urlInput.value = tabs[0].url;
    }
  });
  
  // Submit report
  submitBtn.addEventListener('click', function() {
    const url = urlInput.value.trim();
    
    if (!url) {
      alert('Please enter a URL');
      return;
    }
    
    if (!url.startsWith('http')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    const reportData = {
      url: url,
      is_phishing: isPhishingYes.checked,
      report_type: reportType.value,
      feedback: feedback.value
    };
    
    chrome.runtime.sendMessage({ 
      action: 'reportUrl', 
      data: reportData 
    }, function(response) {
      if (response.success) {
        // Show success message
        successMessage.style.display = 'block';
        
        // Clear form
        urlInput.value = '';
        isPhishingNo.checked = true;
        reportType.value = 'false-positive';
        feedback.value = '';
        
        // Hide success message after 5 seconds
        setTimeout(function() {
          successMessage.style.display = 'none';
        }, 5000);
      } else {
        alert('Error submitting report: ' + response.message);
      }
    });
  });
});