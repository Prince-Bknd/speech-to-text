const presetSelect = document.getElementById('presetSelect');
const apiFormatSelect = document.getElementById('apiFormat');
const baseUrlInput = document.getElementById('baseUrl');
const apiKeyInput = document.getElementById('apiKey');
const modelNameInput = document.getElementById('modelName');
const langSelect = document.getElementById('language');
const darkModeInput = document.getElementById('darkMode');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// Preset configurations for popular AIs
const presets = {
  openai: { format: 'openai', url: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  groq: { format: 'openai', url: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile' },
  deepseek: { format: 'openai', url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  mistral: { format: 'openai', url: 'https://api.mistral.ai/v1', model: 'mistral-small-latest' },
  together: { format: 'openai', url: 'https://api.together.xyz/v1', model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' },
  ollama: { format: 'openai', url: 'http://localhost:11434/v1', model: 'llama3' },
  anthropic: { format: 'anthropic', url: 'https://api.anthropic.com', model: 'claude-3-haiku-20240307' },
  google: { format: 'google', url: 'https://generativelanguage.googleapis.com/v1beta/models', model: 'gemini-1.5-flash' }
};

// Auto-fill fields when a preset is selected
presetSelect.addEventListener('change', () => {
  const p = presets[presetSelect.value];
  if (p) {
    apiFormatSelect.value = p.format;
    baseUrlInput.value = p.url;
    modelNameInput.value = p.model;
  }
});

// Load saved settings
chrome.storage.local.get(['apiFormat', 'baseUrl', 'apiKey', 'modelName', 'language', 'darkMode']).then((data) => {
  if (data.apiFormat) apiFormatSelect.value = data.apiFormat;
  if (data.baseUrl) baseUrlInput.value = data.baseUrl;
  if (data.apiKey) apiKeyInput.value = data.apiKey;
  if (data.modelName) modelNameInput.value = data.modelName;
  if (data.language) langSelect.value = data.language;
  if (data.darkMode) darkModeInput.checked = true;
});

// Save settings
saveBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    apiFormat: apiFormatSelect.value,
    baseUrl: baseUrlInput.value.replace(/\/$/, ''), // Remove trailing slash
    apiKey: apiKeyInput.value,
    modelName: modelNameInput.value,
    language: langSelect.value,
    darkMode: darkModeInput.checked
  }).then(() => {
    status.textContent = 'Settings saved successfully!';
    setTimeout(() => status.textContent = '', 2000);
  });
});