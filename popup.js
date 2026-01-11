// YouTube Focus Mode Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('focusToggle');
  const statusText = document.getElementById('status');

  // Load current state
  chrome.storage.sync.get(['focusModeEnabled'], (result) => {
    const enabled = result.focusModeEnabled || false;
    toggle.checked = enabled;
    statusText.textContent = `Focus Mode: ${enabled ? 'ON' : 'OFF'}`;
  });

  // Handle toggle change
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ focusModeEnabled: enabled }, () => {
      statusText.textContent = `Focus Mode: ${enabled ? 'ON' : 'OFF'}`;
      // Notify content script to update
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes('youtube.com')) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});
