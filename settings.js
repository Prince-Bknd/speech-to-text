const aiProviderSelect = document.getElementById('aiProvider');
const apiKeyInput = document.getElementById('apiKey');
const keyHint = document.getElementById('keyHint');
const langSelect = document.getElementById('language');
const darkModeInput = document.getElementById('darkMode');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// Update placeholder based on selected AI
function updateKeyHint() {
  const provider = aiProviderSelect.value;
  if (provider === 'openai') keyHint.textContent = 'OpenAI keys start with sk-';
  if (provider === 'anthropic') keyHint.textContent = 'Anthropic keys start with sk-ant-';
  if (provider === 'google') keyHint.textContent = 'Google keys start with AIza';
}

aiProviderSelect.addEventListener('change', updateKeyHint);

// Load saved settings
chrome.storage.local.get(['aiProvider', 'apiKey', 'language', 'darkMode']).then((data) => {
  if (data.aiProvider) aiProviderSelect.value = data.aiProvider;
  if (data.apiKey) apiKeyInput.value = data.apiKey;
  if (data.language) langSelect.value = data.language;
  if (data.darkMode) darkModeInput.checked = true;
  updateKeyHint();
});

// Save settings
saveBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    aiProvider: aiProviderSelect.value,
    apiKey: apiKeyInput.value,
    language: langSelect.value,
    darkMode: darkModeInput.checked
  }).then(() => {
    status.textContent = 'Settings saved successfully!';
    setTimeout(() => status.textContent = '', 2000);
  });
});