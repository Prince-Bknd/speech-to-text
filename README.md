# 🎙️ Live Tab Transcriber

**Live Tab Transcriber** is a powerful, privacy-focused Chrome Extension that captures audio directly from your active browser tab and converts it into accurate, real-time text. Unlike standard speech-to-text tools that rely on your microphone, this extension captures the tab's internal audio, ensuring crystal-clear transcription without background noise.

It also features a **Dynamic AI Summarizer**, allowing you to instantly generate concise summaries using OpenAI, Anthropic (Claude), Google (Gemini), Groq, or even your local Ollama instance.

---

## ✨ Key Features

###  Core Transcription
* **Tab Audio Capture:** Records audio directly from the browser tab (YouTube, Udemy, Zoom, Spotify, etc.) instead of the microphone.
* **Real-Time Processing:** Streams audio in optimized WAV chunks for near-instant transcription via OpenAI Whisper.
* **High Accuracy:** Leverages OpenAI's industry-leading Whisper API for precise speech-to-text, even with accents or background music.
* **Multi-Language Support:** Transcribe in English, Hindi, Spanish, French, German, Japanese, and more.

### 🤖 Dynamic AI Summarization
* **Universal AI Router:** Don't just stick to OpenAI! Choose your favorite LLM for summarization.
* **Supported Providers:** OpenAI (GPT-4o-mini), Anthropic (Claude), Google (Gemini), Groq, DeepSeek, Mistral, Together AI, and local Ollama.
* **Concise Feedback:** Generates a punchy, 1-2 sentence "TL;DR" summary of your transcript instantly.

### 🛠️ Productivity Tools
* **Live Side Panel:** Watch the transcript build in real-time without leaving your current tab.
* **Smart Search:** Instantly highlight and find specific words or phrases within the transcript.
* **Export & Copy:** Copy text to your clipboard or export the full transcript as a `.txt` file.
* **Local History:** Automatically saves sessions locally. Access your past transcripts even after restarting the browser.

### 🔒 Privacy & Performance
* **100% Local Storage:** Transcript history and settings are stored in `chrome.storage.local`. No external databases.
* **No Telemetry:** Zero tracking, zero analytics.
* **Optimized Audio Engine:** Uses `AudioWorklet` and raw WAV encoding to prevent browser memory leaks and API format errors.

---

##  Prerequisites

Before using the extension, you will need:
1. **Google Chrome** (or any Chromium-based browser like Edge/Brave).
2. **OpenAI API Key** (Required for the core Whisper audio transcription).
3. **Optional: LLM API Keys** (Required only if you want to use the AI Summarize feature with providers other than OpenAI).

---

## 🚀 Installation Guide

Since this is an unpacked extension, follow these steps to install it:

1. **Download/Clone** this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** ON (top right corner).
4. Click the **Load unpacked** button.
5. Select the root folder of this project (`live-tab-transcriber/`).
6. The extension icon will appear in your Chrome toolbar!

---

## 🛠️ Configuration & Setup

### 1. Setting up Transcription (Required)
1. Click the extension icon and select **Settings**.
2. Paste your **OpenAI API Key** (starts with `sk-...`).
3. Select your preferred **Language** for transcription.
4. Click **Save Settings**.

### 2. Setting up AI Summarization (Optional but Recommended)
In the **Settings** page, you can configure the AI used for the "Summarise" button:
* **Quick Preset:** Use the dropdown to auto-fill settings for popular AIs (Groq, DeepSeek, Mistral, Ollama, etc.).
* **Custom AI:** If you use a custom endpoint (like a local LM Studio server), select "Custom", enter your **Base URL**, **API Key**, and **Model Name**.
* *Note: The extension uses the "OpenAI-compatible" format, meaning it works with 90% of AI providers out of the box!*

---

##  How to Use

1. **Open a Tab:** Navigate to a website playing audio/video (e.g., a YouTube video, a podcast, or a webinar).
2. **Open Side Panel:** Click the extension icon and select **Open Side Panel** (or click the extension icon in the side panel toolbar).
3. **Start Transcribing:** 
   * Click the **Start** button.
   * ⚠️ **CRITICAL:** A Chrome prompt will appear. You **MUST** check the box that says **"Share tab audio"**, then click Share.
4. **Watch & Interact:** The text will appear in the side panel every ~4 seconds. You can search, copy, or export it.
5. **Summarize:** Once you have a decent amount of text, click **✨ Summarise** to get an AI-generated short summary.
6. **Stop:** Click **Stop** to end the session. It will automatically save to your local history.

---

## 📁 Project Structure

```text
live-tab-transcriber/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker (handles routing and lifecycle)
├── offscreen.html         # Hidden document for audio processing
├── offscreen.js           # Core audio capture & WAV encoding logic
├── audio-processor.js     # AudioWorklet module for clean audio processing
├── popup.html/js/css      # Quick action popup UI
├── sidepanel.html/js/css  # Main transcription and summary UI
├── settings.html/js/css   # Configuration UI (API keys, AI providers)
├── history.html/js/css    # Local transcript history manager
└── icons/                 # Extension icons (16px, 48px, 128px)