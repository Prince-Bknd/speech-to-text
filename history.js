const historyList = document.getElementById('historyList');
const clearAllBtn = document.getElementById('clearAll');

function loadHistory() {
    chrome.storage.local.get(['history']).then((data) => {
    const history = data.history || [];
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<p>No history yet.</p>';
        return;
    }
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
        <div class="meta">${item.date} | ${item.duration} | ${item.words} words</div>
        <div class="text">${item.text}</div>
        <button class="download" data-index="${index}">Download</button>
        <button class="delete" data-index="${index}">Delete</button>
        `;
        historyList.appendChild(div);
    });
    });
}

historyList.addEventListener('click', (e) => {
    if (e.target.classList.contains('download')) {
    const index = e.target.dataset.index;
    chrome.storage.local.get(['history']).then((data) => {
        const item = data.history[index];
        const blob = new Blob([item.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${item.date.replace(/[\/\s,:]/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });
    } else if (e.target.classList.contains('delete')) {
    const index = e.target.dataset.index;
    chrome.storage.local.get(['history']).then((data) => {
        data.history.splice(index, 1);
        chrome.storage.local.set({ history: data.history }).then(loadHistory);
    });
    }
});

clearAllBtn.addEventListener('click', () => {
    if (confirm('Delete all history?')) {
    chrome.storage.local.set({ history: [] }).then(loadHistory);
    }
});

loadHistory();