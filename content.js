// YouTube Focus Mode Content Script

// Keywords for distracting content (focused on core distractions)
const distractingKeywords = ['vlog', 'comedy', 'roast', 'entertainment', 'daily life', 'challenge', 'dance', 'review', 'unboxing', 'haul', 'gaming', 'gameplay', 'stream', 'live', 'celebrity', 'gossip', 'drama', 'news', 'politics', 'sports'];

// Keywords for educational content (overrides distracting)
const educationalKeywords = ['tutorial', 'course', 'lecture', 'programming', 'coding', 'tech', 'computer science', 'engineering', 'math'];

// Function to check if focus mode is enabled
function isFocusModeEnabled() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['focusModeEnabled'], (result) => {
      resolve(result.focusModeEnabled || false);
    });
  });
}

// Function to hide Shorts sections
function hideShorts() {
  // Hide Shorts shelf on homepage
  const shortsShelves = document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts]');
  shortsShelves.forEach(shelf => shelf.style.display = 'none');

  // Disable Shorts in sidebar (more robust selectors)
  const sidebarShorts = document.querySelectorAll('ytd-guide-entry-renderer a[href="/shorts"], ytd-guide-entry-renderer [title="Shorts"], ytd-guide-entry-renderer');
  sidebarShorts.forEach(item => {
    if (item.textContent.includes('Shorts') || item.querySelector('a[href="/shorts"]')) {
      item.style.pointerEvents = 'none';
      item.style.opacity = '0.5';
      item.style.cursor = 'not-allowed';
    }
  });

  // Hide Shorts in search results
  const searchShorts = document.querySelectorAll('ytd-video-renderer a[href*="/shorts/"]');
  searchShorts.forEach(video => video.closest('ytd-video-renderer').style.display = 'none');

  // Hide Shorts on channel pages
  const channelShorts = document.querySelectorAll('ytd-grid-video-renderer a[href*="/shorts/"]');
  channelShorts.forEach(video => video.closest('ytd-grid-video-renderer').style.display = 'none');

  // Hide Shorts tab on channel pages
  const shortsTabs = document.querySelectorAll('tp-yt-paper-tab[aria-label*="Shorts"], tp-yt-paper-tab');
  shortsTabs.forEach(tab => {
    if (tab.textContent.includes('Shorts')) {
      tab.style.display = 'none';
    }
  });
}

// Function to filter distracting videos (disable instead of hide)
function filterVideos() {
  // Select all video renderers
  const videos = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');

  videos.forEach(video => {
    const titleElement = video.querySelector('#video-title, .ytd-video-meta-block #title');
    if (titleElement) {
      const title = titleElement.textContent.toLowerCase();

      // Check for educational keywords first
      const hasEducational = educationalKeywords.some(keyword => title.includes(keyword.toLowerCase()));

      if (!hasEducational) {
        // If not educational, check for distracting keywords
        const hasDistracting = distractingKeywords.some(keyword => title.includes(keyword.toLowerCase()));
        if (hasDistracting) {
          // Disable clicking by adding overlay and preventing pointer events
          video.style.position = 'relative';
          video.style.pointerEvents = 'none';
          video.style.opacity = '0.5';

          // Add a semi-transparent overlay to indicate disabled
          let overlay = video.querySelector('.focus-mode-overlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'focus-mode-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            overlay.style.zIndex = '10';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.color = 'white';
            overlay.style.fontSize = '14px';
            overlay.style.fontWeight = 'bold';
            overlay.textContent = 'FOCUS MODE: Disabled';
            video.appendChild(overlay);
          }
        } else {
          // Re-enable if previously disabled but now allowed
          video.style.pointerEvents = '';
          video.style.opacity = '';
          const overlay = video.querySelector('.focus-mode-overlay');
          if (overlay) overlay.remove();
        }
      }
    }
  });
}

// Main function to apply filters
async function applyFilters() {
  const enabled = await isFocusModeEnabled();
  if (!enabled) return;

  hideShorts();
  filterVideos();
}

// Set up MutationObserver to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    applyFilters();
  });
});

// Start observing when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    applyFilters();
  });
} else {
  observer.observe(document.body, { childList: true, subtree: true });
  applyFilters();
}

// Listen for storage changes to update immediately
chrome.storage.onChanged.addListener((changes) => {
  if (changes.focusModeEnabled) {
    location.reload(); // Simple way to reapply filters
  }
});
