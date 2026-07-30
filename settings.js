// DOM Elements
const presetSelect = document.getElementById('presetSelect');
const apiFormatSelect = document.getElementById('apiFormat');
const baseUrlInput = document.getElementById('baseUrl');
const apiKeyInput = document.getElementById('apiKey');
const apiKeyRequiredSpan = document.getElementById('apiKeyRequired');
const modelNameInput = document.getElementById('modelName');
const modelSuggestions = document.getElementById('modelSuggestions');
const langSelect = document.getElementById('language');
const darkModeInput = document.getElementById('darkMode');
const settingsForm = document.getElementById('settingsForm');
const status = document.getElementById('status');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const eyeOpen = toggleApiKeyBtn.querySelector('.eye-open');
const eyeClosed = toggleApiKeyBtn.querySelector('.eye-closed');
const copyApiKeyBtn = document.getElementById('copyApiKey');

const presets = {
  openai: { 
    format: 'openai', 
    url: 'https://api.openai.com/v1', 
    model: 'gpt-4o-mini',
    recommendedModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
  },
  groq: { 
    format: 'openai', 
    url: 'https://api.groq.com/openai/v1', 
    model: 'llama-3.1-70b-versatile',
    recommendedModels: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it']
  },
  deepseek: { 
    format: 'openai', 
    url: 'https://api.deepseek.com/v1', 
    model: 'deepseek-chat',
    recommendedModels: ['deepseek-chat', 'deepseek-coder']
  },
  mistral: { 
    format: 'openai', 
    url: 'https://api.mistral.ai/v1', 
    model: 'mistral-small-latest',
    recommendedModels: ['mistral-small-latest', 'mistral-large-latest', 'open-mistral-nemo']
  },
  together: { 
    format: 'openai', 
    url: 'https://api.together.xyz/v1', 
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    recommendedModels: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo']
  },
  ollama: { 
    format: 'openai', 
    url: 'http://localhost:11434/v1', 
    model: 'llama3',
    recommendedModels: ['llama3', 'llama3.1', 'mistral', 'gemma2', 'qwen2']
  },
  anthropic: { 
    format: 'anthropic', 
    url: 'https://api.anthropic.com', 
    model: 'claude-3-haiku-20240307',
    recommendedModels: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20240620', 'claude-3-opus-20240229']
  },
  google: { 
    format: 'google', 
    url: 'https://generativelanguage.googleapis.com/v1beta/models', 
    model: 'gemini-1.5-flash',
    recommendedModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']
  }
};

function updateModelSuggestions(models) {
  modelSuggestions.innerHTML = '';
  if (models && models.length > 0) {
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      modelSuggestions.appendChild(option);
    });
  }
}

function updateRequiredFields(presetValue) {
  if (presetValue === 'ollama') {
    apiKeyInput.removeAttribute('required');
    apiKeyRequiredSpan.style.display = 'none';
    apiKeyInput.placeholder = 'Leave empty for local';
  } else {
    apiKeyInput.setAttribute('required', 'true');
    apiKeyRequiredSpan.style.display = 'inline';
    apiKeyInput.placeholder = 'sk-...';
  }
}

presetSelect.addEventListener('change', () => {
  const selectedPreset = presetSelect.value;
  const p = presets[selectedPreset];
  
  if (p) {
    apiFormatSelect.value = p.format;
    baseUrlInput.value = p.url;
    modelNameInput.value = p.model;
    updateModelSuggestions(p.recommendedModels);
  } else {
    updateModelSuggestions([]);
  }
  
  updateRequiredFields(selectedPreset);
});

chrome.storage.local.get(['preset', 'apiFormat', 'baseUrl', 'apiKey', 'modelName', 'language', 'darkMode']).then((data) => {
  if (data.preset && presets[data.preset]) {
    presetSelect.value = data.preset;
    updateModelSuggestions(presets[data.preset].recommendedModels);
  }
  
  if (data.apiFormat) apiFormatSelect.value = data.apiFormat;
  if (data.baseUrl) baseUrlInput.value = data.baseUrl;
  if (data.apiKey) apiKeyInput.value = data.apiKey;
  if (data.modelName) modelNameInput.value = data.modelName;
  if (data.language) langSelect.value = data.language;
  
  updateRequiredFields(presetSelect.value);

  if (data.darkMode) {
    darkModeInput.checked = true;
    document.body.classList.add('dark');
  }
});

darkModeInput.addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});

copyApiKeyBtn.addEventListener('click', async () => {
  const keyToCopy = apiKeyInput.value.trim();
  
  if (!keyToCopy) {
    // Optional: Shake animation or tooltip could go here, but silent fail is fine for empty
    return; 
  }

  try {
    await navigator.clipboard.writeText(keyToCopy);
    
    // Show success state
    iconCopy.style.display = 'none';
    iconCheck.style.display = 'block';
    copyApiKeyBtn.classList.add('cop969'); // Green color
    copyApiKeyBtn.title = 'Copied!';

    // Revert back to copy icon after 2 seconds
    setTimeout(() => {
      iconCopy.style.display = 'block';
      iconCheck.style.display = 'none';
      copyApiKeyBtn.classList.remove('copied');
      copyApiKeyBtn.title = 'Copy to clipboard';
    }, 2000);
    
  } catch (err) {
    console.error('Failed to copy:', err);
  }
});

toggleApiKeyBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  
  apiKeyInput.type = isPassword ? 'text' : 'password';
  
  if (isPassword) {
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
  } else {
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
  }
  
  apiKeyInput.focus();
});

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (!settingsForm.checkValidity()) {
    settingsForm.reportValidity();
    return;
  }

  const cleanBaseUrl = baseUrlInput.value.trim().replace(/\/$/, '');

  chrome.storage.local.set({
    preset: presetSelect.value,
    apiFormat: apiFormatSelect.value,
    baseUrl: cleanBaseUrl,
    apiKey: apiKeyInput.value.trim(),
    modelName: modelNameInput.value.trim(),
    language: langSelect.value,
    darkMode: darkModeInput.checked
  }).then(() => {
    status.textContent = 'Settings saved successfully!';
    status.classList.add('visible');
    
    // Hide success message after 2.5 seconds
    setTimeout(() => {
      status.classList.remove('visible');
    }, 2500);
  }).catch((err) => {
    console.error('Failed to save settings:', err);
    status.textContent = 'Failed to save settings.';
    status.style.color = '#ef4444';
    status.classList.add('visible');
  });
});