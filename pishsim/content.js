// This script runs in the context of web pages
// It can be used to inject warnings directly into the page if needed

// Create and inject CSS for notifications
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .pishsim-warning-banner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: #c62828;
      color: white;
      padding: 15px;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      z-index: 9999;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .pishsim-warning-banner button {
      margin-left: 15px;
      padding: 5px 10px;
      background: white;
      color: #c62828;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .pishsim-safe-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      z-index: 9999;
      animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-in 4s forwards;
    }
    
    .pishsim-safe-notification::before {
      content: "✓";
      font-size: 18px;
      margin-right: 10px;
    }
    
    .pishsim-block-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(198, 40, 40, 0.9);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
    }
    
    .pishsim-block-overlay h1 {
      font-size: 28px;
      margin-bottom: 20px;
    }
    
    .pishsim-block-overlay p {
      font-size: 16px;
      max-width: 600px;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .pishsim-block-overlay button {
      padding: 10px 20px;
      background-color: white;
      color: #c62828;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin: 0 10px;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Show warning banner for phishing sites
function showWarningBanner(autoBlock) {
  // Inject styles if not already done
  injectStyles();
  
  // Create warning banner
  const warningBanner = document.createElement('div');
  warningBanner.className = 'pishsim-warning-banner';
  
  const warningText = document.createTextNode(
    '⚠️ Warning: This website has been detected as a potential phishing site. Be careful about entering any personal information.'
  );
  warningBanner.appendChild(warningText);
  
  const dismissButton = document.createElement('button');
  dismissButton.textContent = 'Dismiss';
  dismissButton.addEventListener('click', function() {
    warningBanner.remove();
  });
  
  warningBanner.appendChild(dismissButton);
  document.body.prepend(warningBanner);
  
  // If auto-block is enabled, show the block overlay
  if (autoBlock) {
    showBlockOverlay();
  }
  
  return { success: true };
}

// Show block overlay for phishing sites
function showBlockOverlay() {
  // Create block overlay
  const blockOverlay = document.createElement('div');
  blockOverlay.className = 'pishsim-block-overlay';
  
  const heading = document.createElement('h1');
  heading.textContent = '⚠️ Phishing Site Detected';
  
  const description = document.createElement('p');
  description.textContent = 'PISHSIM has detected that this website is likely a phishing attempt designed to steal your personal information. For your safety, access has been blocked.';
  
  const continueButton = document.createElement('button');
  continueButton.textContent = 'Continue Anyway';
  continueButton.addEventListener('click', function() {
    blockOverlay.remove();
  });
  
  const backButton = document.createElement('button');
  backButton.textContent = 'Go Back';
  backButton.addEventListener('click', function() {
    history.back();
  });
  
  blockOverlay.appendChild(heading);
  blockOverlay.appendChild(description);
  blockOverlay.appendChild(continueButton);
  blockOverlay.appendChild(backButton);
  
  document.body.appendChild(blockOverlay);
}

// Show safe site notification
function showSafeNotification() {
  // Inject styles if not already done
  injectStyles();
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'pishsim-safe-notification';
  notification.textContent = 'This website appears to be safe';
  
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(function() {
    if (notification.parentNode === document.body) {
      document.body.removeChild(notification);
    }
  }, 5000);
  
  return { success: true };
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'showWarning') {
    sendResponse(showWarningBanner(request.autoBlock));
  } else if (request.action === 'showSafeNotification') {
    sendResponse(showSafeNotification());
  }
  return true;
});