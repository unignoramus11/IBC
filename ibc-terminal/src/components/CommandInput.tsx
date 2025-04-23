'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CommandInputProps {
  onSubmit: (command: string, metrics: any) => void;
  isDisabled: boolean;
}

interface KeystrokeMetrics {
  keystrokes: {
    key: string;
    timestamp: number;
  }[];
  corrections: number;
  hesitations: { duration: number; position: number }[];
  inputDuration: number;
  commandLength: number;
}

const CommandInput: React.FC<CommandInputProps> = ({ onSubmit, isDisabled }) => {
  const [command, setCommand] = useState<string>('');
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [metrics, setMetrics] = useState<KeystrokeMetrics>({
    keystrokes: [],
    corrections: 0,
    hesitations: [],
    inputDuration: 0,
    commandLength: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Re-focus after command submission
  useEffect(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentTime = Date.now();
    const newValue = e.target.value;
    
    // Start tracking if this is the first character
    if (command === '' && newValue !== '') {
      setStartTime(currentTime);
    }
    
    // Track backspace/delete operations for corrections
    if (newValue.length < command.length) {
      setMetrics(prev => ({
        ...prev,
        corrections: prev.corrections + 1,
      }));
    }
    
    // Track hesitations (pauses between keystrokes)
    if (lastKeystrokeTime && currentTime - lastKeystrokeTime > 1000) {
      setMetrics(prev => ({
        ...prev,
        hesitations: [
          ...prev.hesitations,
          { duration: currentTime - lastKeystrokeTime, position: command.length },
        ],
      }));
    }
    
    // Update keystroke metrics
    setMetrics(prev => ({
      ...prev,
      keystrokes: [
        ...prev.keystrokes,
        { key: e.target.value.slice(-1), timestamp: currentTime },
      ],
    }));
    
    setLastKeystrokeTime(currentTime);
    setCommand(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrows for command history
    if (e.key === 'ArrowUp' && inputHistory.length > 0) {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
      setHistoryIndex(newIndex);
      setCommand(inputHistory[inputHistory.length - 1 - newIndex]);
    } else if (e.key === 'ArrowDown' && historyIndex > -1) {
      e.preventDefault();
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setCommand('');
      } else {
        setCommand(inputHistory[inputHistory.length - 1 - newIndex]);
      }
    }
    
    // Track current keystroke
    setMetrics(prev => ({
      ...prev,
      keystrokes: [
        ...prev.keystrokes,
        { key: e.key, timestamp: Date.now() },
      ],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (command.trim() === '' || isDisabled) return;
    
    // Calculate final metrics
    const endTime = Date.now();
    const finalMetrics = {
      ...metrics,
      inputDuration: startTime ? endTime - startTime : 0,
      commandLength: command.length,
    };
    
    // Add to history
    setInputHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    // Submit command with metrics
    onSubmit(command, finalMetrics);
    
    // Reset input and metrics
    setCommand('');
    setMetrics({
      keystrokes: [],
      corrections: 0,
      hesitations: [],
      inputDuration: 0,
      commandLength: 0,
    });
    setStartTime(null);
    setLastKeystrokeTime(null);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-700 bg-black p-4"
    >
      <div className="flex items-center">
        <span className="text-terminal-green mr-2">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="flex-grow bg-transparent text-terminal-green outline-none focus:outline-none"
          placeholder={isDisabled ? "Processing..." : "Enter command..."}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </form>
  );
};

export default CommandInput;