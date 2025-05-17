// Function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// List of common phishing indicators
const phishingIndicators = {
  // URL structure indicators
  hasIPAddress: function(url) {
    return /^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url);
  },
  hasSuspiciousSubdomain: function(url) {
    const domain = extractDomain(url);
    const parts = domain.split(".");
    const suspiciousKeywords = ["secure", "login", "signin", "account", "verify", "banking", "update"];
    
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
    const suspiciousTLDs = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz"];
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
      "paypal", "apple", "microsoft", "amazon", "netflix", "google", "facebook"
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
      paypal: ["paypa1", "payp4l", "paypai", "paypaI", "paypol"],
      google: ["g00gle", "googie", "g0ogle", "googl3"],
      microsoft: ["micr0soft", "rnicrosoft", "microsft"],
      amazon: ["amaz0n", "arnazon", "amazan"],
      apple: ["appl3", "appie", "ap9le"],
      facebook: ["faceb00k", "faceboook", "faceb0ok"]
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
  }
};

// Function to check URL for phishing indicators
function checkPhishingUrl(url) {
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
  
  // Determine if the URL is likely phishing based on risk factors
  results.isPhishing = results.riskFactors.length >= 2;
  
  return results;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "checkUrl") {
    const results = checkPhishingUrl(request.url);
    sendResponse(results);
  }
  return true; // Required for async response
});

// Check URL when a tab is updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Only run when the page is fully loaded
  if (changeInfo.status === "complete" && tab.url) {
    const results = checkPhishingUrl(tab.url);
    
    // If it's a phishing site, show a warning
    if (results.isPhishing) {
      // Store the results for the popup to access
      chrome.storage.local.set({ [tab.url]: results });
      
      // Show a notification
      chrome.action.setBadgeText({ text: "!", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#c62828", tabId: tabId });
      
      // Send message to content script to show warning
      chrome.tabs.sendMessage(tabId, { action: "showWarning" });
    } else {
      // Clear any warning badge
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  }
});