// Function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// Enhanced phishing indicators
const phishingIndicators = {
  // URL structure indicators
  hasIPAddress: function(url) {
    return /^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url);
  },
  hasSuspiciousSubdomain: function(url) {
    const domain = extractDomain(url);
    const parts = domain.split(".");
    const suspiciousKeywords = [
      "secure", "login", "signin", "account", "verify", "banking", "update",
      "confirm", "user", "client", "server", "data", "site", "info", "online"
    ];
    
    // Check if subdomain contains suspicious keywords
    if (parts.length > 2) {
      for (var i = 0; i < suspiciousKeywords.length; i++) {
        if (parts[0].includes(suspiciousKeywords[i])) return true;
      }
    }
    return false;
  },
  hasTooManySubdomains: function(url) {
    const domain = extractDomain(url);
    return domain.split(".").length > 4; // More than 4 parts is suspicious
  },
  hasSuspiciousTLD: function(url) {
    const domain = extractDomain(url);
    const suspiciousTLDs = [
      ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club", ".work", 
      ".date", ".bid", ".stream", ".racing", ".win", ".science", ".party"
    ];
    for (var i = 0; i < suspiciousTLDs.length; i++) {
      if (domain.endsWith(suspiciousTLDs[i])) return true;
    }
    return false;
  },
  
  // URL content indicators
  containsAtSymbol: function(url) {
    return url.includes("@");
  },
  containsDoubleSlash: function(url) {
    return url.replace("https://", "").replace("http://", "").includes("//");
  },
  containsSuspiciousKeywords: function(url) {
    const suspiciousKeywords = [
      "verify", "account", "banking", "secure", "login", "signin", "update", "confirm",
      "paypal", "apple", "microsoft", "amazon", "netflix", "google", "facebook",
      "password", "credential", "wallet", "bitcoin", "crypto", "bank", "credit",
      "debit", "card", "security", "authenticate", "validation", "recover", "support"
    ];
    
    const urlLower = url.toLowerCase();
    for (var i = 0; i < suspiciousKeywords.length; i++) {
      if (urlLower.includes(suspiciousKeywords[i])) return true;
    }
    return false;
  },
  
  // Domain indicators
  hasMisspelledDomain: function(url) {
    const domain = extractDomain(url).toLowerCase();
    const commonDomains = {
      paypal: ["paypa1", "payp4l", "paypai", "paypaI", "paypol", "paypa1l", "paaypal", "paypayl"],
      google: ["g00gle", "googie", "g0ogle", "googl3", "gooogle", "googgle", "g0ogIe", "go0gle"],
      microsoft: ["micr0soft", "rnicrosoft", "microsft", "micros0ft", "microsooft", "mlcrosoft", "mlcr0s0ft"],
      amazon: ["amaz0n", "arnazon", "amazan", "ammazon", "amazzon", "am4zon", "amaz0on", "amason"],
      apple: ["appl3", "appie", "ap9le", "applle", "aapple", "appie", "app1e", "appl3"],
      facebook: ["faceb00k", "faceboook", "faceb0ok", "faceebook", "facebbook", "fac3book", "faceb00ok", "faceb0k"],
      instagram: ["1nstagram", "lnstagram", "instagr4m", "instagran", "instaqram", "instagrarn"],
      twitter: ["tw1tter", "tvvitter", "twltter", "twwitter", "twitt3r", "tw1tt3r"],
      linkedin: ["l1nkedin", "llnkedin", "linkedln", "link3din", "linkediin", "l1nkedln"],
      netflix: ["netfl1x", "netfllx", "netf1ix", "n3tflix", "netflixx", "netfllix"]
    };
    
    for (var original in commonDomains) {
      if (domain.includes(original)) return false; // It's the legitimate domain
      
      var misspellings = commonDomains[original];
      for (var i = 0; i < misspellings.length; i++) {
        if (domain.includes(misspellings[i])) return true;
      }
    }
    return false;
  },
  
  // URL length indicator
  isTooLong: function(url) {
    return url.length > 100;
  },
  
  // Additional indicators
  hasExcessiveHyphens: function(url) {
    return (url.match(/-/g) || []).length > 5;
  },
  hasExcessiveSubDirectories: function(url) {
    const pathParts = new URL(url).pathname.split('/');
    return pathParts.length > 5;
  },
  hasPortNumber: function(url) {
    return /:\d+/.test(new URL(url).host);
  },
  hasHTTPInDomain: function(url) {
    return extractDomain(url).includes('http');
  },
  hasSuspiciousFileExtension: function(url) {
    const suspiciousExtensions = ['.exe', '.zip', '.rar', '.js', '.php', '.html'];
    const urlLower = url.toLowerCase();
    for (var i = 0; i < suspiciousExtensions.length; i++) {
      if (urlLower.endsWith(suspiciousExtensions[i])) return true;
    }
    return false;
  }
};

// Function to check URL using local rules
function checkPhishingUrlLocal(url) {
  const results = {
    isPhishing: false,
    riskFactors: []
  };
  
  // Check each indicator
  if (phishingIndicators.hasIPAddress(url)) {
    results.riskFactors.push("URL contains an IP address instead of a domain name");
  }
  
  if (phishingIndicators.hasSuspiciousSubdomain(url)) {
    results.riskFactors.push("Suspicious subdomain detected");
  }
  
  if (phishingIndicators.hasTooManySubdomains(url)) {
    results.riskFactors.push("URL contains an unusual number of subdomains");
  }
  
  if (phishingIndicators.hasSuspiciousTLD(url)) {
    results.riskFactors.push("URL uses a suspicious top-level domain");
  }
  
  if (phishingIndicators.containsAtSymbol(url)) {
    results.riskFactors.push("URL contains @ symbol which can be used to hide the actual destination");
  }
  
  if (phishingIndicators.containsDoubleSlash(url)) {
    results.riskFactors.push("URL contains suspicious double slashes");
  }
  
  if (phishingIndicators.containsSuspiciousKeywords(url)) {
    results.riskFactors.push("URL contains suspicious keywords often used in phishing");
  }
  
  if (phishingIndicators.hasMisspelledDomain(url)) {
    results.riskFactors.push("URL contains a misspelled version of a popular domain");
  }
  
  if (phishingIndicators.isTooLong(url)) {
    results.riskFactors.push("URL is unusually long, which is common in phishing attempts");
  }
  
  if (phishingIndicators.hasExcessiveHyphens(url)) {
    results.riskFactors.push("URL contains an excessive number of hyphens");
  }
  
  if (phishingIndicators.hasExcessiveSubDirectories(url)) {
    results.riskFactors.push("URL contains an excessive number of subdirectories");
  }
  
  if (phishingIndicators.hasPortNumber(url)) {
    results.riskFactors.push("URL contains a non-standard port number");
  }
  
  if (phishingIndicators.hasHTTPInDomain(url)) {
    results.riskFactors.push("URL contains 'http' in the domain name, which is suspicious");
  }
  
  if (phishingIndicators.hasSuspiciousFileExtension(url)) {
    results.riskFactors.push("URL points to a potentially dangerous file type");
  }
  
  // Determine if the URL is likely phishing based on risk factors
  results.isPhishing = results.riskFactors.length >= 2;
  
  return results;
}

// Function to check URL using ML backend
async function checkPhishingUrlML(url) {
  try {
    const response = await fetch('http://localhost:5000/check_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking URL with ML backend:', error);
    // Fall back to local rules if ML backend fails
 return {
  isPhishing: mlResult.isPhishing,
  riskFactors: mlResult.riskFactors,
  phishingProbability: mlResult.phishingProbability,
  topIndicators: mlResult.topIndicators || []
};



  }
}

// Function to check if URL is in safe list
function isInSafeList(url) {
  return new Promise((resolve) => {
    chrome.storage.local.get('safeList', function(data) {
      const safeList = data.safeList || [];
      const domain = extractDomain(url);
      
      // Check if the domain or any parent domain is in the safe list
      const isDomainSafe = safeList.some(function(safeDomain) {
        return domain === safeDomain || domain.endsWith('.' + safeDomain);
      });
      
      resolve(isDomainSafe);
    });
  });
}

// Function to get user settings
function getUserSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get('settings', function(data) {
      const defaultSettings = {
        useMachineLearning: true,
        detectionSensitivity: 'medium',
        showNotifications: true,
        autoBlockPhishing: false,
        safeNotifications: true
      };
      
      resolve(data.settings || defaultSettings);
    });
  });
}

// Main function to check URL
async function checkUrl(url) {
  // First check if URL is in safe list
  const isSafe = await isInSafeList(url);
  if (isSafe) {
    return {
      isPhishing: false,
      riskFactors: [],
      message: "This website is in your safe list",
      phishingProbability: 0
    };
  }
  
  // Get user settings
  const settings = await getUserSettings();
  
  // Check with ML backend if enabled
  if (settings.useMachineLearning) {
    try {
      const mlResult = await checkPhishingUrlML(url);
      
      // Adjust based on sensitivity setting
      let threshold = 0.5; // Default medium
      if (settings.detectionSensitivity === 'low') {
        threshold = 0.7;
      } else if (settings.detectionSensitivity === 'high') {
        threshold = 0.3;
      }
      
      return {
  isPhishing: mlResult.isPhishing,
  riskFactors: mlResult.riskFactors,
  phishingProbability: mlResult.phishingProbability,
  topIndicators: mlResult.topIndicators || []
};

    } catch (error) {
      console.error('Error with ML check:', error);
      // Fall back to local rules
      const localResult = checkPhishingUrlLocal(url);
      return {
        ...localResult,
        phishingProbability: localResult.isPhishing ? 0.8 : 0.2,
        message: "Using local detection rules (ML backend unavailable)"
      };
    }
  } else {
    // Use local rules only
    const localResult = checkPhishingUrlLocal(url);
    
    // Adjust based on sensitivity setting
    if (settings.detectionSensitivity === 'low' && localResult.riskFactors.length < 3) {
      localResult.isPhishing = false;
    } else if (settings.detectionSensitivity === 'high' && localResult.riskFactors.length >= 1) {
      localResult.isPhishing = true;
    }
    
    return {
      ...localResult,
      phishingProbability: localResult.riskFactors.length / 15, // Simple probability based on number of risk factors
      message: "Using local detection rules"
    };
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "checkUrl") {
    checkUrl(request.url).then(function(results) {
      sendResponse(results);
    });
    return true; // Required for async response
  } else if (request.action === "addToSafeList") {
    chrome.storage.local.get('safeList', function(data) {
      const safeList = data.safeList || [];
      const domain = extractDomain(request.url);
      
      if (!safeList.includes(domain)) {
        safeList.push(domain);
        chrome.storage.local.set({ safeList: safeList }, function() {
          sendResponse({ success: true, message: "Added to safe list" });
        });
      } else {
        sendResponse({ success: false, message: "Already in safe list" });
      }
    });
    return true;
  } else if (request.action === "removeFromSafeList") {
    chrome.storage.local.get('safeList', function(data) {
      const safeList = data.safeList || [];
      const domain = request.domain;
      
      const newSafeList = safeList.filter(function(item) {
        return item !== domain;
      });
      
      chrome.storage.local.set({ safeList: newSafeList }, function() {
        sendResponse({ success: true, message: "Removed from safe list" });
      });
    });
    return true;
  } else if (request.action === "getSafeList") {
    chrome.storage.local.get('safeList', function(data) {
      sendResponse({ safeList: data.safeList || [] });
    });
    return true;
  } else if (request.action === "reportUrl") {
    // Send report to backend
    fetch('http://localhost:5000/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, message: data.message });
    })
    .catch(error => {
      console.error('Error reporting URL:', error);
      sendResponse({ success: false, message: "Error reporting URL" });
    });
    return true;
  } else if (request.action === "saveSettings") {
    chrome.storage.local.set({ settings: request.settings }, function() {
      sendResponse({ success: true, message: "Settings saved" });
    });
    return true;
  } else if (request.action === "getSettings") {
    chrome.storage.local.get('settings', function(data) {
      const defaultSettings = {
        useMachineLearning: true,
        detectionSensitivity: 'medium',
        showNotifications: true,
        autoBlockPhishing: false,
        safeNotifications: true
      };
      
      sendResponse({ settings: data.settings || defaultSettings });
    });
    return true;
  }
});

// Check URL when a tab is updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Only run when the page is fully loaded
  if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
    getUserSettings().then(function(settings) {
      checkUrl(tab.url).then(function(results) {
        // Store the results for the popup to access
        chrome.storage.local.set({ [tab.url]: results });
        
        // If it's a phishing site
        if (results.isPhishing) {
          // Show a notification
          chrome.action.setBadgeText({ text: "!", tabId: tabId });
          chrome.action.setBadgeBackgroundColor({ color: "#c62828", tabId: tabId });
          
          // Show warning notification if enabled
          if (settings.showNotifications) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "images/icon128.png",
              title: "Phishing Alert!",
              message: "The site you're visiting may be a phishing attempt. Click for details."
            });
          }
          
          // Send message to content script to show warning
          chrome.tabs.sendMessage(tabId, { 
            action: "showWarning",
            autoBlock: settings.autoBlockPhishing
          });
        } else {
          // Clear any warning badge
          chrome.action.setBadgeText({ text: "", tabId: tabId });
          
          // Show safe notification if enabled
          if (settings.safeNotifications && settings.showNotifications) {
            chrome.tabs.sendMessage(tabId, { 
              action: "showSafeNotification"
            });
          }
        }
      });
    });
  }
});

// Listen for notification clicks
chrome.notifications.onClicked.addListener(function(notificationId) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      // Open the popup
      chrome.action.openPopup();
    }
  });
});


