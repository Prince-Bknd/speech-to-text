let mediaStream = null;
let audioContext = null;
let processor = null;
let rawAudioData = [];
let isTranscribing = false;

// Transcribe every 4 seconds
const TRANSCRIPTION_INTERVAL = 4000; 

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'INIT_CAPTURE') {
    const { streamId, apiKey, language } = message;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: streamId
          }
        },
        video: false
      });

      // Create AudioContext at 16kHz (Optimal for Whisper API)
      audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(mediaStream);
      
      // Use ScriptProcessor to capture raw PCM audio
      processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        // Clone the data because the buffer gets reused by the browser
        rawAudioData.push(new Float32Array(channelData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination); // Required for ScriptProcessor to run

      // Start the transcription interval
      const intervalId = setInterval(async () => {
        if (rawAudioData.length > 0 && !isTranscribing) {
          await transcribeCurrentAudio(apiKey, language);
        }
      }, TRANSCRIPTION_INTERVAL);
      
      processor.intervalId = intervalId;
      
      sendResponse({ success: true });
    } catch (err) {
      console.error('Capture error:', err);
      sendResponse({ success: false, error: err.message });
    }
  } else if (message.type === 'STOP_CAPTURE') {
    // Final transcription
    if (rawAudioData.length > 0 && !isTranscribing) {
      const settings = await chrome.storage.local.get(['apiKey', 'language']);
      await transcribeCurrentAudio(settings.apiKey, settings.language);
    }
    
    if (processor) {
      if (processor.intervalId) clearInterval(processor.intervalId);
      processor.disconnect();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    
    rawAudioData = [];
    isTranscribing = false;
    sendResponse({ success: true });
  }
});

async function transcribeCurrentAudio(apiKey, language) {
  if (rawAudioData.length === 0) return;
  isTranscribing = true;

  try {
    // 1. Combine all raw audio chunks into a single Float32Array
    const totalLength = rawAudioData.reduce((acc, arr) => acc + arr.length, 0);
    const combinedAudio = new Float32Array(totalLength);
    let offset = 0;
    for (const arr of rawAudioData) {
      combinedAudio.set(arr, offset);
      offset += arr.length;
    }
    
    // Clear the buffer immediately to save memory
    rawAudioData = []; 

    // 2. Convert raw PCM to a proper WAV file
    const wavBlob = encodeWAV(combinedAudio, 16000);

    // 3. Send to OpenAI
    const formData = new FormData();
    formData.append('file', wavBlob, 'audio.wav'); // MUST be .wav
    formData.append('model', 'whisper-1');
    if (language && language !== 'auto') {
      formData.append('language', language);
    }
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();

    if (result.text && result.text.trim()) {
      chrome.runtime.sendMessage({
        type: 'TRANSCRIPT_CHUNK',
        text: result.text.trim(),
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Transcription error:', err);
  } finally {
    isTranscribing = false;
  }
}

// --- Helper: Convert Float32 PCM to 16-bit WAV ---
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}