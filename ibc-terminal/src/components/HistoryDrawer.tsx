'use client';

import React from 'react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, messages }) => {
  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div 
      className={`
        fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 
        transition-transform duration-300 z-10
        ${isOpen ? 'translate-y-0' : '-translate-y-full'}
      `}
      style={{ maxHeight: '60vh', overflowY: 'auto' }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-terminal-green text-lg">Command History</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ▲ Close
          </button>
        </div>
        
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div key={index} className="text-sm">
              <div className="text-gray-500 text-xs">
                {formatTime(message.timestamp)} - {message.role}
              </div>
              <div className={`
                ${message.role === 'user' ? 'text-terminal-yellow' : 'text-terminal-blue'}
                truncate
              `}>
                {message.content}
              </div>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-gray-500 italic">No history yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;