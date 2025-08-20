
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { createKashmiriChat, translateKashmiriToHindiForSpeech } from '../services/geminiService';
import type { Message } from '../types';
import { Role } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Loader from './Loader';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [currentlySpeakingMessageId, setCurrentlySpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { speak, cancel, isSpeaking, supported: ttsSupported } = useTextToSpeech({
    onEnd: () => setCurrentlySpeakingMessageId(null)
  });
  
  const handleFinalTranscript = useCallback((transcript: string) => {
    if (transcript) {
        handleSendMessage(transcript);
    }
  }, []);

  const {
    isRecording,
    startRecording,
    stopRecording,
    interimTranscript,
    supported: sttSupported
  } = useSpeechToText({ onFinalTranscript: handleFinalTranscript });
  
  useEffect(() => {
    setInputText(interimTranscript);
  }, [interimTranscript]);


  useEffect(() => {
    try {
      const newChat = createKashmiriChat();
      setChat(newChat);
      setMessages([
        {
          id: 'initial-bot-message',
          role: Role.BOT,
          text: 'آسِو وَصْل! بہٕ چھُس تُہُنٛد کٲشُر اے آے مددگار۔ ک‍‍یتھٕ پٲٹھۍ کَران بہٕ تُہِہ مَدَتھ؟', // Welcome! I am your Kashmiri AI assistant. How can I help you?
          translationForSpeech: 'आस्यव वसल! बह छुस तोहुंद कशुर एआई मददगार। केथ पाठी करान बह तोहि मदद?'
        },
      ]);
    } catch (e) {
      setError('Failed to initialize chat service. Please check your API key.');
      console.error(e);
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chat || !text.trim()) return;
    
    if (isSpeaking) cancel();

    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setInputText('');
    
    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: Role.BOT, text: '' }]);

    try {
      const stream = await chat.sendMessageStream({ message: text });
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
      
      if (ttsSupported && fullResponse) {
          try {
            const translation = await translateKashmiriToHindiForSpeech(fullResponse);
            setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, translationForSpeech: translation } : msg));
            speak(translation);
            setCurrentlySpeakingMessageId(botMessageId);
          } catch(e) {
             console.error("Failed to translate for speech, attempting to speak original text.", e);
             speak(fullResponse); // Fallback
             setCurrentlySpeakingMessageId(botMessageId);
          }
      }

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get a response: ${errorMessage}`);
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [chat, isSpeaking, cancel, speak, ttsSupported]);
  
  const handlePlayAudio = async (message: Message) => {
    if (isSpeaking) {
      cancel();
      if (currentlySpeakingMessageId === message.id) {
        setCurrentlySpeakingMessageId(null);
        return;
      }
    }
    
    const textToSpeak = message.translationForSpeech || message.text;

    if (message.role === Role.BOT && !message.translationForSpeech) {
      try {
        const translation = await translateKashmiriToHindiForSpeech(message.text);
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, translationForSpeech: translation } : m));
        speak(translation);
        setCurrentlySpeakingMessageId(message.id);
      } catch (e) {
        console.error("Failed to translate for speech on demand", e);
        speak(message.text); // Fallback
        setCurrentlySpeakingMessageId(message.id);
      }
    } else {
      speak(textToSpeak);
      setCurrentlySpeakingMessageId(message.id);
    }
  };

  return (
    <div className="flex flex-col flex-grow h-full overflow-hidden">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg}
            isSpeaking={currentlySpeakingMessageId === msg.id}
            onPlayAudio={() => handlePlayAudio(msg)}
            hasTTSSupport={ttsSupported}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-center space-x-2">
                <Loader />
                <span className="text-sm text-gray-400"> سوچان چھُس... </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="p-4 text-center text-red-400 bg-red-900/50 mx-4 rounded-lg">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
       {!sttSupported && (
        <div className="px-4 pb-2 text-center text-xs text-gray-500">
          <p>Voice input is not supported by your browser.</p>
        </div>
      )}
      <div className="p-4 md:p-6 border-t border-gray-700">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          text={inputText}
          setText={setInputText}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          hasRecognitionSupport={sttSupported}
        />
      </div>
    </div>
  );
};

export default ChatWindow;