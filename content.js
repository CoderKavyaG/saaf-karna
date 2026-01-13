// ============================================================================
// YOUTUBE SHORTS BLOCKER - CONTENT SCRIPT v6.0
// ============================================================================

console.log('[SHORTS BLOCKER] Content script loaded');

// Get enabled state
let isEnabled = true;

chrome.storage.sync.get('shortsBlockerEnabled', (result) => {
  isEnabled = result.shortsBlockerEnabled !== false;
  console.log('[SHORTS BLOCKER] Enabled state:', isEnabled);
});

// ============================================================================
// MAIN BLOCKING FUNCTION - REMOVE UI ELEMENTS
// ============================================================================
function blockAllShorts() {
  if (!isEnabled) return;

  let blockedCount = 0;

  // ====== 1. REMOVE SIDEBAR SHORTS BUTTON ======
  document.querySelectorAll('ytd-guide-entry-renderer').forEach((entry) => {
    if (!entry.hasAttribute('data-blocked')) {
      const text = entry.textContent.trim();
      const link = entry.querySelector('a');
      const href = link ? link.href : '';
      
      // Check if this is the Shorts button
      if (text === 'Shorts' || href.includes('/shorts')) {
        console.log('[SHORTS BLOCKER] REMOVING sidebar Shorts button');
        entry.setAttribute('data-blocked', 'true');
        entry.remove();
        blockedCount++;
      }
    }
  });

  // ====== 2. BLOCK CLICKS ON ANY /shorts LINK ======
  document.querySelectorAll('a[href*="/shorts"]').forEach((link) => {
    if (!link.hasAttribute('data-blocked')) {
      link.setAttribute('data-blocked', 'true');
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[SHORTS BLOCKER] BLOCKED /shorts link click');
        return false;
      }, true);
    }
  });

  // ====== 3. REMOVE SHORTS SHELF FROM FEED ======
  
  // Type 1: Rich shelf with is-shorts
  document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts="true"]').forEach((shelf) => {
    if (!shelf.hasAttribute('data-blocked')) {
      console.log('[SHORTS BLOCKER] REMOVING Shorts shelf');
      shelf.setAttribute('data-blocked', 'true');
      shelf.remove();
      blockedCount++;
    }
  });

  // Type 2: Reel shelf
  document.querySelectorAll('ytd-reel-shelf-renderer').forEach((shelf) => {
    if (!shelf.hasAttribute('data-blocked')) {
      console.log('[SHORTS BLOCKER] REMOVING reel shelf');
      shelf.setAttribute('data-blocked', 'true');
      shelf.remove();
      blockedCount++;
    }
  });

  // Type 3: Any section with "Shorts" heading
  document.querySelectorAll('h2, h3').forEach((heading) => {
    if (heading.textContent.trim() === 'Shorts') {
      const section = heading.closest('ytd-rich-shelf-renderer, ytd-horizontal-list-renderer, [role="region"]');
      if (section && !section.hasAttribute('data-blocked')) {
        console.log('[SHORTS BLOCKER] REMOVING Shorts section');
        section.setAttribute('data-blocked', 'true');
        section.remove();
        blockedCount++;
      }
    }
  });

  if (blockedCount > 0) {
    console.log(`[SHORTS BLOCKER] Removed ${blockedCount} Shorts UI elements`);
  }
}

// ============================================================================
// MUTATION OBSERVER
// ============================================================================
function setupObserver() {
  let debounceTimer;

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      blockAllShorts();
    }, 100);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  console.log('[SHORTS BLOCKER] Mutation observer activated');
}

// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  console.log('[SHORTS BLOCKER] Initializing content script');
  
  blockAllShorts();
  setupObserver();
  
  // Aggressive checking for first 10 seconds
  let checkCount = 0;
  const interval = setInterval(() => {
    blockAllShorts();
    checkCount++;
    if (checkCount >= 20) {
      clearInterval(interval);
      setInterval(blockAllShorts, 2000);
    }
  }, 500);

  console.log('[SHORTS BLOCKER] Content script initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also run immediately
setTimeout(init, 50);

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortsBlockerEnabled) {
    isEnabled = changes.shortsBlockerEnabled.newValue !== false;
    console.log('[SHORTS BLOCKER] Settings changed - enabled:', isEnabled);
    if (isEnabled) {
      blockAllShorts();
    }
  }
});

console.log('[SHORTS BLOCKER] Content script ready');


