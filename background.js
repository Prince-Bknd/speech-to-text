const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// Hardcoded API key as fallback
const HARDCODED_API_KEY = "Remove Hardcore API key";

async function setupOffscreenDocument(streamId, apiKey, language) {
  const existingContexts = await chrome.runtime.getContexts({
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
  });

  if (existingContexts.length > 0) {
    chrome.runtime.sendMessage({ type: 'INIT_CAPTURE', streamId, apiKey, language });
    return;
  }

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['USER_MEDIA'],
    justification: 'Capture tab audio for transcription'
  });

  setTimeout(() => {
    chrome.runtime.sendMessage({ type: 'INIT_CAPTURE', streamId, apiKey, language });
  }, 500);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TRANSCRIPTION') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) throw new Error('No active tab found');
        
        const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
        const settings = await chrome.storage.local.get(['apiKey', 'language']);
        
        // Use hardcoded key or from storage
        const apiKey = settings.apiKey || HARDCODED_API_KEY;
        
        if (!apiKey) {
          sendResponse({ success: false, error: 'API Key not set. Please add it in Settings.' });
          return;
        }

        await setupOffscreenDocument(streamId, apiKey, settings.language || 'en');
        sendResponse({ success: true });
      } catch (err) {
        console.error('Start error:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; 
  } 
  
  else if (message.type === 'STOP_TRANSCRIPTION') {
    (async () => {
      const existingContexts = await chrome.runtime.getContexts({
        documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
      });
      if (existingContexts.length > 0) {
        chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' });
      }
      sendResponse({ success: true });
    })();
    return true;
  }

  else if (message.type === 'TRANSCRIPT_CHUNK') {
    chrome.runtime.sendMessage({ 
      type: 'UPDATE_TRANSCRIPT', 
      text: message.text, 
      timestamp: message.timestamp 
    });
    
    chrome.storage.local.get(['currentTranscript']).then((data) => {
      const current = data.currentTranscript || '';
      const updated = current + (current ? ' ' : '') + message.text;
      chrome.storage.local.set({ currentTranscript: updated });
    });
  }
});

// const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// async function setupOffscreenDocument(streamId, apiKey, language) {
//   const existingContexts = await chrome.runtime.getContexts({
//     documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
//   });

//   if (existingContexts.length > 0) {
//     chrome.runtime.sendMessage({ type: 'INIT_CAPTURE', streamId, apiKey, language });
//     return;
//   }

//   await chrome.offscreen.createDocument({
//     url: OFFSCREEN_DOCUMENT_PATH,
//     reasons: ['USER_MEDIA'],
//     justification: 'Capture tab audio for transcription'
//   });

//   setTimeout(() => {
//     chrome.runtime.sendMessage({ type: 'INIT_CAPTURE', streamId, apiKey, language });
//   }, 500);
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === 'START_TRANSCRIPTION') {
//     (async () => {
//       try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         if (!tab) throw new Error('No active tab found');
        
//         const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
//         const settings = await chrome.storage.local.get(['apiKey', 'language']);
        
//         if (!settings.apiKey) {
//           sendResponse({ success: false, error: 'API Key not set. Please add it in Settings.' });
//           return;
//         }

//         await setupOffscreenDocument(streamId, settings.apiKey, settings.language || 'en');
//         // Hardcoded API key (fallback if not in storage)
//         // const HARDCODED_API_KEY = "...";

//         // const settings = await chrome.storage.local.get(['apiKey', 'language']);

//         // // Use hardcoded key if not in storage
//         // const apiKey = settings.apiKey || HARDCODED_API_KEY;

//         // if (!apiKey) {
//         //   sendResponse({ success: false, error: 'API Key not set. Please add it in Settings.' });
//         //   return;
//         // }

//         // await setupOffscreenDocument(streamId, apiKey, settings.language || 'en');
//         sendResponse({ success: true });
//       } catch (err) {
//         sendResponse({ success: false, error: err.message });
//       }
//     })();
//     return true; 
//   } 
  
//   else if (message.type === 'STOP_TRANSCRIPTION') {
//     (async () => {
//       const existingContexts = await chrome.runtime.getContexts({
//         documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
//       });
//       if (existingContexts.length > 0) {
//         chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' });
//       }
//       sendResponse({ success: true });
//     })();
//     return true;
//   }

//   else if (message.type === 'TRANSCRIPT_CHUNK') {
//     // Forward to side panel
//     chrome.runtime.sendMessage({ 
//       type: 'UPDATE_TRANSCRIPT', 
//       text: message.text, 
//       timestamp: message.timestamp 
//     });
    
//     // Auto-save to local storage
//     chrome.storage.local.get(['currentTranscript']).then((data) => {
//       const current = data.currentTranscript || '';
//       const updated = current + (current ? ' ' : '') + message.text;
//       chrome.storage.local.set({ currentTranscript: updated });
//     });
//   }
// });