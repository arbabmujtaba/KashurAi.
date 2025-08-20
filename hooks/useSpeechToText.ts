import { useState, useEffect, useRef, useCallback } from 'react';

// --- START: Manual type definitions for Web Speech API ---
// This is necessary because the default TS DOM lib doesn't include these types.

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}
// --- END: Manual type definitions ---


interface UseSpeechToTextOptions {
  onFinalTranscript: (transcript: string) => void;
}

// Type guard for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

export const useSpeechToText = ({ onFinalTranscript }: UseSpeechToTextOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);
  
  const startRecording = useCallback(() => {
    if (isRecording || !supported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ks-IN'; // Kashmiri (India) - browser support may vary, will fallback to browser default if not supported

    recognition.onstart = () => {
      setIsRecording(true);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    
    let finalTranscript = '';

    recognition.onresult = (event) => {
      let tempInterimTranscript = '';
      finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          tempInterimTranscript += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(tempInterimTranscript);
      if (finalTranscript) {
        onFinalTranscript(finalTranscript.trim());
        stopRecording();
      }
    };
    
    recognition.start();

  }, [isRecording, supported, onFinalTranscript, stopRecording]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return { isRecording, startRecording, stopRecording, interimTranscript, supported };
};
