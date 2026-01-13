// YouTube Shorts Blocker Popup Script

console.log('[SHORTS BLOCKER] Popup script loaded');

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('focusToggle');
  const statusText = document.getElementById('statusText');
  const statusCard = document.getElementById('statusCard');

  // Load current state - default to ENABLED
  chrome.storage.sync.get(['shortsBlockerEnabled'], (result) => {
    // Default: enabled (true)
    const enabled = result.shortsBlockerEnabled !== false;
    toggle.checked = enabled;
    updateStatus(enabled);
    console.log('[SHORTS BLOCKER] Popup loaded - enabled:', enabled);
  });

  // Handle toggle change
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ shortsBlockerEnabled: enabled }, () => {
      updateStatus(enabled);
      console.log('[SHORTS BLOCKER] Toggle changed to:', enabled);
    });
  });

  function updateStatus(enabled) {
    if (enabled) {
      statusText.textContent = 'Shorts Blocker is ACTIVE';
      statusCard.classList.add('enabled');
      statusCard.classList.remove('disabled');
    } else {
      statusText.textContent = 'Shorts Blocker is DISABLED';
      statusCard.classList.remove('enabled');
      statusCard.classList.add('disabled');
    }
  }
});

