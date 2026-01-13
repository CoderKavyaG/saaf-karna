// ============================================================================
// YOUTUBE SHORTS BLOCKER - BACKGROUND SERVICE WORKER
// ============================================================================

console.log('[SHORTS BLOCKER] Background service worker loaded');

// Listen for navigation to /shorts
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = new URL(details.url);
  
  if (url.pathname.startsWith('/shorts')) {
    console.log('[SHORTS BLOCKER] Detected navigation to /shorts - REDIRECTING');
    
    // Redirect to home
    chrome.tabs.update(details.tabId, {
      url: 'https://www.youtube.com'
    });
  }
}, {
  url: [{ hostEquals: 'www.youtube.com' }]
});

// Also listen for committed navigation
chrome.webNavigation.onCommitted.addListener((details) => {
  const url = new URL(details.url);
  
  if (url.pathname.startsWith('/shorts')) {
    console.log('[SHORTS BLOCKER] URL already committed to /shorts - REDIRECTING');
    
    chrome.tabs.update(details.tabId, {
      url: 'https://www.youtube.com'
    });
  }
}, {
  url: [{ hostEquals: 'www.youtube.com' }]
});

console.log('[SHORTS BLOCKER] Background worker ready to intercept /shorts navigation');
