
import React from 'react';
import type { Message } from '../types';
import { Role } from '../types';
import ChinarLeafIcon from './icons/ChinarLeafIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';

interface ChatMessageProps {
  message: Message;
  isSpeaking: boolean;
  onPlayAudio: () => void;
  hasTTSSupport: boolean;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSpeaking, onPlayAudio, hasTTSSupport }) => {
  const isUser = message.role === Role.USER;

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-emerald-500/70 text-white rounded-l-2xl rounded-tr-2xl'
    : 'bg-gray-700/60 text-gray-200 rounded-r-2xl rounded-tl-2xl';
  
  const Avatar = () => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gray-600' : 'bg-teal-900/50'}`}>
        {isUser ? <UserIcon /> : <div className="w-6 h-6 text-emerald-400"><ChinarLeafIcon /></div>}
    </div>
  );

  return (
    <div className={`max-w-3xl w-full mx-auto ${containerClasses}`}>
        <div className={`flex items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <Avatar />
            <div className={`px-4 py-3 ${bubbleClasses} max-w-lg relative group`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                 {message.translationForSpeech && !isUser && (
                    <div className="mt-2 pt-2 border-t border-gray-600/50">
                        <p className="text-xs text-gray-400 italic">
                            <span className="font-semibold not-italic">Pronunciation Guide (Hindi):</span> {message.translationForSpeech}
                        </p>
                    </div>
                )}
                {!isUser && hasTTSSupport && message.text && (
                    <button 
                        onClick={onPlayAudio} 
                        className="absolute -bottom-3 -right-3 w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={isSpeaking ? "Stop audio" : "Play audio"}
                    >
                        {isSpeaking ? <SpeakerWaveIcon /> : <SpeakerIcon />}
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default ChatMessage;