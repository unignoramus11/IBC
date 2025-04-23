'use client';

import React, { useState, useEffect, useRef } from 'react';
import CommandInput from './CommandInput';
import ResponseDisplay from './ResponseDisplay';
import HistoryDrawer from './HistoryDrawer';
import { trackUserInteraction } from '../lib/dataCollection';

interface TerminalProps {
  deviceId: string;
  worldId: number;
  variant: 'A' | 'B';
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const Terminal: React.FC<TerminalProps> = ({ deviceId, worldId, variant }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  // Load initial message on component mount
  useEffect(() => {
    const initializeTerminal = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/session/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceId, worldId, variant }),
        });
        
        if (!response.ok) throw new Error('Failed to initialize session');
        
        const data = await response.json();
        setMessages([
          {
            role: 'assistant',
            content: data.initialMessage,
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        console.error('Error initializing terminal:', error);
        setMessages([
          {
            role: 'assistant',
            content: 'System error: Failed to initialize terminal. Please refresh and try again.',
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTerminal();
  }, [deviceId, worldId, variant]);

  const handleCommand = async (command: string, metrics: any) => {
    // Track user interaction data
    trackUserInteraction({
      deviceId,
      command,
      metrics,
      timestamp: Date.now(),
      worldId,
      variant,
    });

    // Add user command to messages
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: command,
        timestamp: Date.now(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          command,
          worldId,
          variant,
        }),
      });

      if (!response.ok) throw new Error('Failed to process command');

      // Get the response from the Gemini API via our backend
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to read response');

      // Initialize a decoder for text
      const decoder = new TextDecoder();
      let responseText = '';

      // Add an initial empty message for streaming
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        },
      ]);

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert the chunk to text
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        
        // Update the last message with the new content
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = responseText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error processing command:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'System error: Failed to process command. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        messages={messages} 
      />
      
      <div className="flex-grow overflow-hidden flex flex-col">
        <div 
          className="p-2 text-xs cursor-pointer hover:bg-gray-800 text-center border-b border-gray-700"
          onClick={toggleHistory}
        >
          {isHistoryOpen ? 'Hide History' : 'Show History ▼'}
        </div>
        
        <div 
          ref={terminalRef}
          className="flex-grow p-4 overflow-y-auto"
        >
          <ResponseDisplay messages={messages} isLoading={isLoading} />
        </div>
        
        <CommandInput onSubmit={handleCommand} isDisabled={isLoading} />
      </div>
    </div>
  );
};

export default Terminal;