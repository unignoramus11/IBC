'use client';

import React from 'react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ResponseDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ messages, isLoading }) => {
  return (
    <div className="space-y-4 font-mono text-sm">
      {messages.map((message, index) => (
        <div key={index} className="pb-2">
          {message.role === 'user' ? (
            <div>
              <span className="text-terminal-green mr-2">{'>'}</span>
              <span className="text-terminal-yellow">{message.content}</span>
            </div>
          ) : (
            <div className="text-terminal-blue whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="inline-block">
          <span className="animate-pulse">_</span>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;