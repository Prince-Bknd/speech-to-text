// popup.js
document.getElementById('openPanel').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.sidePanel.open({ tabId: tab.id });
  window.close();
});

document.getElementById('goSetting').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});