// This script runs in the context of web pages
// It can be used to inject warnings directly into the page if needed

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "showWarning") {
    // Create a warning banner at the top of the page
    var warningBanner = document.createElement("div");
    warningBanner.style.position = "fixed";
    warningBanner.style.top = "0";
    warningBanner.style.left = "0";
    warningBanner.style.width = "100%";
    warningBanner.style.backgroundColor = "#c62828";
    warningBanner.style.color = "white";
    warningBanner.style.padding = "15px";
    warningBanner.style.textAlign = "center";
    warningBanner.style.fontSize = "16px";
    warningBanner.style.fontWeight = "bold";
    warningBanner.style.zIndex = "9999";
    warningBanner.style.fontFamily = "Arial, sans-serif";

    var warningText = document.createTextNode(
      "⚠️ Warning: This website has been detected as a potential phishing site. Be careful about entering any personal information."
    );
    warningBanner.appendChild(warningText);

    var dismissButton = document.createElement("button");
    dismissButton.id = "dismiss-phishing-warning";
    dismissButton.style.marginLeft = "15px";
    dismissButton.style.padding = "5px 10px";
    dismissButton.style.background = "white";
    dismissButton.style.color = "#c62828";
    dismissButton.style.border = "none";
    dismissButton.style.borderRadius = "4px";
    dismissButton.style.cursor = "pointer";
    dismissButton.textContent = "Dismiss";

    warningBanner.appendChild(dismissButton);
    document.body.prepend(warningBanner);

    // Add event listener to dismiss button
    document.getElementById("dismiss-phishing-warning").addEventListener("click", function() {
      warningBanner.remove();
    });

    sendResponse({ success: true });
  }
  return true;
});