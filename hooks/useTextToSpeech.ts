
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  onEnd?: () => void;
}

export const useTextToSpeech = ({ onEnd }: UseTextToSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [supported]);
  
  const getSelectedVoice = useCallback(() => {
    if (!voices.length) return null;
    
    // Prioritize Hindi for TTS as we are translating to it.
    const langPriority = ['hi-IN', 'ur-IN', 'ur-PK', 'ks-IN'];
    for (const lang of langPriority) {
        const voice = voices.find(v => v.lang === lang);
        if (voice) return voice;
    }

    // Fallback to any Indian English voice
    const indianVoice = voices.find(v => v.lang.startsWith('en-IN'));
    if (indianVoice) return indianVoice;

    // Final fallback to the browser's default voice.
    return voices.find(v => v.default) || voices[0];
  }, [voices]);


  const speak = useCallback((text: string) => {
    if (!supported || isSpeaking) return;

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.voice = getSelectedVoice();
    utterance.pitch = 1;
    utterance.rate = 0.95;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
    }

    window.speechSynthesis.speak(utterance);
  }, [supported, isSpeaking, onEnd, getSelectedVoice]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);
  
  return { speak, cancel, isSpeaking, supported };
};