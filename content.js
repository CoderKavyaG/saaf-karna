// YouTube Focus Mode Content Script

// Keywords for distracting content (focused on core distractions)
const distractingKeywords = ['vlog', 'comedy', 'roast', 'entertainment', 'daily life', 'challenge', 'dance', 'review', 'unboxing', 'haul', 'gaming', 'gameplay', 'stream', 'live', 'celebrity', 'gossip', 'drama', 'news', 'politics', 'sports', 'game', 'food', 'trailer', 'movie', 'reaction'];

// Keywords for educational content (overrides distracting)
const educationalKeywords = ['tutorial', 'course', 'lecture', 'programming', 'coding', 'tech', 'computer science', 'engineering', 'math', 'leetcode', 'productive', 'silicon valley'];

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

  // Hide Shorts in sidebar (more robust selectors for all modes)
  const sidebarShorts = document.querySelectorAll('ytd-guide-entry-renderer a[href="/shorts"], ytd-guide-entry-renderer [title="Shorts"], ytd-guide-entry-renderer, a[href="/shorts"], [href="/shorts"], ytd-guide-entry-renderer *');
  sidebarShorts.forEach(item => {
    if (item.textContent && item.textContent.trim().toLowerCase().includes('shorts') || item.href && item.href.includes('/shorts') || item.querySelector('a[href="/shorts"]')) {
      item.style.display = 'none';
    }
  });

  // Hide any element with text "Shorts"
  const allShorts = document.querySelectorAll('*');
  allShorts.forEach(item => {
    if (item.textContent && item.textContent.trim().toLowerCase().includes('shorts') && item.tagName !== 'SCRIPT' && item.tagName !== 'STYLE') {
      item.style.display = 'none';
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
    if (tab.textContent && tab.textContent.toLowerCase().includes('shorts')) {
      tab.style.display = 'none';
    }
  });
}

// Function to filter distracting videos (hide completely)
function filterVideos() {
  // Select all video renderers
  const videos = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');

  videos.forEach(video => {
    const titleElement = video.querySelector('#video-title, .ytd-video-meta-block #title, h3 a, h3');
    if (titleElement) {
      const title = titleElement.textContent.toLowerCase();

      // Check for educational keywords first
      const hasEducational = educationalKeywords.some(keyword => title.includes(keyword.toLowerCase()));

      if (!hasEducational) {
        // If not educational, check for distracting keywords
        const hasDistracting = distractingKeywords.some(keyword => title.includes(keyword.toLowerCase()));
        if (hasDistracting) {
          // Hide the video completely
          video.style.display = 'none';
        } else {
          // Show if previously hidden but now allowed
          video.style.display = '';
        }
      } else {
        // Show if educational
        video.style.display = '';
      }
    }
  });
}

// Function to block Shorts URL access
function blockShortsURL() {
  if (window.location.pathname.startsWith('/shorts')) {
    // Redirect to YouTube home or show a message
    document.body.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100vh; font-size:24px; color:red;">Focus Mode: Shorts are blocked!</div>';
    setTimeout(() => {
      window.location.href = 'https://www.youtube.com';
    }, 2000);
  }
}

// Main function to apply filters
async function applyFilters() {
  const enabled = await isFocusModeEnabled();
  if (!enabled) return;

  blockShortsURL();
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
