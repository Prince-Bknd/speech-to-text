// sidepanel.js
let isRecording = false;
let startTime = null;
let timerInterval = null;
let currentText = '';

const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');
const btnCopy = document.getElementById('btnCopy');
const btnSummarize = document.getElementById('btnSummarize'); 
const btnExport = document.getElementById('btnExport');
const btnHistory = document.getElementById('btnHistory');
const transcriptArea = document.getElementById('transcriptArea');
const summaryArea = document.getElementById('summaryArea');
const wordCountEl = document.getElementById('wordCount');
const durationEl = document.getElementById('duration');
const searchInput = document.getElementById('searchInput');

// Apply dark mode & load previous session
chrome.storage.local.get(['currentTranscript', 'darkMode']).then((data) => {
  if (data.darkMode) document.body.classList.add('dark');
  if (data.currentTranscript) {
    currentText = data.currentTranscript;
    updateTranscriptUI();
  }
});

btnSummarize.addEventListener('click', async () => {
  if (!currentText || currentText.trim().length < 50) {
    alert('Not enough text to summarize. Please transcribe a bit more first!');
    return;
  }
  
  summaryArea.style.display = 'block';
  summaryArea.innerHTML = '<span class="summary-loading">🤖 Generating short summary...</span>';
  
  const settings = await chrome.storage.local.get(['apiKey']);
  const apiKey = settings.apiKey || "..";
  
  if (!apiKey) {
    summaryArea.innerHTML = '<span style="color:red;">❌ API Key not found. Please add it in Settings.</span>';
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", 
        messages: [
          { 
            role: "system", 
            content: "Provide a very short, concise, 1 to 2 sentence summary of this transcript. Just state the core message or main takeaway. Do not use bullet points. Keep it under 10-40 words." 
          },
          { 
            role: "user", 
            content: currentText 
          }
        ],
        max_tokens: 100 
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;
    
    summaryArea.innerHTML = `<strong>💡 Quick Summary:</strong><br>${summary}`;
    
  } catch (err) {
    console.error('Summarization error:', err);
    summaryArea.innerHTML = `<span style="color:red;">❌ Failed to summarize.</span>`;
  }
});

btnStart.addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({ type: 'START_TRANSCRIPTION' });
  if (response.success) {
    isRecording = true;
    btnStart.disabled = true;
    btnStop.disabled = false;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    alert('Error: ' + response.error);
  }
});

btnStop.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'STOP_TRANSCRIPTION' });
  isRecording = false;
  btnStart.disabled = false;
  btnStop.disabled = true;
  clearInterval(timerInterval);
  saveToHistory();
});

btnClear.addEventListener('click', () => {
  if (confirm('Clear current transcript?')) {
    currentText = '';
    updateTranscriptUI();
    chrome.storage.local.set({ currentTranscript: '' });
  }
});

btnCopy.addEventListener('click', () => {
  navigator.clipboard.writeText(currentText);
  btnCopy.textContent = 'Copied!';
  setTimeout(() => btnCopy.textContent = 'Copy', 1500);
});

btnExport.addEventListener('click', () => {
  const blob = new Blob([currentText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcript_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

btnHistory.addEventListener('click', () => {
  chrome.tabs.create({ url: 'history.html' });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'UPDATE_TRANSCRIPT') {
    currentText += (currentText ? ' ' : '') + message.text;
    updateTranscriptUI();
    chrome.storage.local.set({ currentTranscript: currentText });
  }
});

function updateTranscriptUI() {
  if (!currentText) {
    transcriptArea.innerHTML = '<p class="placeholder">Transcript will appear here...</p>';
  } else {
    transcriptArea.innerText = currentText;
    transcriptArea.scrollTop = transcriptArea.scrollHeight;
  }
  const words = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  wordCountEl.textContent = `${words} words`;
}

function updateTimer() {
  const elapsed = Date.now() - startTime;
  const h = Math.floor(elapsed / 3600000);
  const m = Math.floor((elapsed % 3600000) / 60000);
  const s = Math.floor((elapsed % 60000) / 1000);
  durationEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function saveToHistory() {
  if (!currentText.trim()) return;
  chrome.storage.local.get(['history']).then((data) => {
    const history = data.history || [];
    const words = currentText.trim().split(/\s+/).length;
    const elapsed = startTime ? Date.now() - startTime : 0;
    
    history.unshift({
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      duration: formatTime(elapsed),
      words: words,
      text: currentText
    });
    
    chrome.storage.local.set({ history: history, currentTranscript: '' });
    currentText = '';
    updateTranscriptUI();
  });
}

function formatTime(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  if (!query) { updateTranscriptUI(); return; }
  const regex = new RegExp(`(${query})`, 'gi');
  const highlighted = currentText.replace(regex, '<mark>$1</mark>');
  transcriptArea.innerHTML = highlighted;
});