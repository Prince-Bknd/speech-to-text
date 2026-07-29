const apiKeyInput = document.getElementById('apiKey');
const langSelect = document.getElementById('language');
const darkModeInput = document.getElementById('darkMode');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// Load saved settings when the page opens
chrome.storage.local.get(['apiKey', 'language', 'darkMode']).then((data) => {
  if (data.apiKey) apiKeyInput.value = data.apiKey;
  if (data.language) langSelect.value = data.language;
  if (data.darkMode) darkModeInput.checked = true;
});

// Save settings when the button is clicked
saveBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    apiKey: apiKeyInput.value,
    language: langSelect.value,
    darkMode: darkModeInput.checked
  }).then(() => {
    status.textContent = 'Settings saved successfully!';
    setTimeout(() => status.textContent = '', 2000);
  });
});


// const langSelect = document.getElementById('language');
// const darkModeInput = document.getElementById('darkMode');
// const saveBtn = document.getElementById('saveBtn');
// const status = document.getElementById('status');

// // Hardcoded API key
// const HARDCODED_API_KEY = "..";

// // Load saved settings when the page opens
// chrome.storage.local.get(['apiKey', 'language', 'darkMode']).then((data) => {
//   if (data.language) langSelect.value = data.language;
//   if (data.darkMode) darkModeInput.checked = true;
  
//   // Always use the hardcoded API key
//   chrome.storage.local.set({ apiKey: HARDCODED_API_KEY });
// });

// // Save settings when the button is clicked
// saveBtn.addEventListener('click', () => {
//   chrome.storage.local.set({
//     apiKey: HARDCODED_API_KEY,
//     language: langSelect.value,
//     darkMode: darkModeInput.checked
//   }).then(() => {
//     status.textContent = 'Settings saved successfully!';
//     setTimeout(() => status.textContent = '', 2000);
//   });
// });