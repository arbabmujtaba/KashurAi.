import React, { useRef, useEffect } from 'react';
import SendIcon from './icons/SendIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopIcon from './icons/StopIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  text: string;
  setText: (text: string) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  hasRecognitionSupport: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  text,
  setText,
  isRecording,
  startRecording,
  stopRecording,
  hasRecognitionSupport,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-grow">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Listening..." : "پَنُن سَوال کٔرِو پرژھ..."}
          disabled={isLoading}
          rows={1}
          className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 border border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all duration-200 max-h-40"
        />
      </div>

      {hasRecognitionSupport && (
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading}
          className={`w-12 h-12 flex items-center justify-center text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 flex-shrink-0 ${
            isRecording ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500 animate-pulse' : 'bg-gray-600 hover:bg-gray-500 focus:ring-emerald-500'
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <StopIcon /> : <MicrophoneIcon />}
        </button>
      )}

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 transition-all duration-200 flex-shrink-0"
        aria-label="Send message"
      >
        <SendIcon />
      </button>
    </form>
  );
};

export default ChatInput;