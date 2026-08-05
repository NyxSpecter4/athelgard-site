// modules/voice.js — Voice recognition & synthesis
let recognition = null;
let isRecording = false;

export function isVoiceSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startVoice(onResult, onError) {
  if (!isVoiceSupported()) {
    onError?.('Voice not supported. Use Chrome or Edge.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let finalTranscript = '';

  recognition.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalTranscript += t;
      else interim += t;
    }
    onResult?.(finalTranscript + interim, !!interim);
  };

  recognition.onerror = (e) => {
    onError?.(e.error);
    isRecording = false;
  };

  recognition.onend = () => {
    isRecording = false;
    if (finalTranscript.trim()) {
      onResult?.(finalTranscript.trim(), false, true); // final = true
    }
  };

  isRecording = true;
  recognition.start();
  return recognition;
}

export function stopVoice() {
  isRecording = false;
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

export function isRecordingActive() {
  return isRecording;
}

// Text-to-speech for Athelgard's voice
export function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.1;
  u.pitch = 1.0;
  // Try to find a female voice
  const voices = window.speechSynthesis.getVoices();
  const female = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria'));
  if (female) u.voice = female;
  window.speechSynthesis.speak(u);
}
