// YouTube Focus Mode Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('focusToggle');
  const statusText = document.getElementById('statusText');
  const statusCard = document.getElementById('statusCard');

  // Load current state
  chrome.storage.sync.get(['focusModeEnabled'], (result) => {
    const enabled = result.focusModeEnabled || false;
    toggle.checked = enabled;
    updateStatus(enabled);
  });

  // Handle toggle change
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ focusModeEnabled: enabled }, () => {
      updateStatus(enabled);
      // Notify content script to update
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes('youtube.com')) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });

  function updateStatus(enabled) {
    statusText.textContent = enabled ? 'Focus Mode is Enabled' : 'Focus Mode is Disabled';
    if (enabled) {
      statusCard.classList.add('enabled');
    } else {
      statusCard.classList.remove('enabled');
    }
  }
});
