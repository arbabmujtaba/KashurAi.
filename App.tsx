import React from 'react';
import ChatWindow from './components/ChatWindow';
import ChinarLeafIcon from './components/icons/ChinarLeafIcon';

const App: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black w-full h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full max-h-[95vh] bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 flex flex-col">
        <header className="flex items-center justify-center p-4 border-b border-gray-700 relative">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 text-emerald-400">
                <ChinarLeafIcon />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
              Kashmiri Ai
            </h1>
          </div>
           <p className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hidden sm:block">کَشمیری گَپھ باتھ</p>
        </header>
        <ChatWindow />
      </div>
       <footer className="text-center py-3">
        <p className="text-xs text-gray-600">
          Created by <a href="http://arbabmujtaba.github.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">ArbabMujtaba</a>
        </p>
      </footer>
    </div>
  );
};

export default App;