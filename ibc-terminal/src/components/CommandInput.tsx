/**
 * CommandInput.tsx
 * ----------------
 * React component for user command input in the IBC Terminal research platform.
 * Collects detailed keystroke, correction, and hesitation metrics for research on problem-solving and cognitive processes.
 *
 * Exports:
 * - CommandInput: Main input component for terminal commands
 *
 * Props:
 * - onSubmit: Function to handle command submission and metrics
 * - isDisabled: Whether input is disabled (e.g., during processing)
 * - isSessionComplete: Whether the session is complete (disables input)
 */

"use client";

import React, { useState, useRef, useEffect } from "react";

// Debug logger that only logs in development mode
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[CommandInput] ${message}`, ...data);
  }
};

/**
 * Props for CommandInput component.
 */
interface CommandInputProps {
  onSubmit: (command: string, metrics: any) => void;
  isDisabled: boolean;
  isSessionComplete?: boolean;
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

/**
 * CommandInput React component for capturing user commands and research metrics.
 * @param onSubmit - Handler for command submission and metrics
 * @param isDisabled - Whether input is disabled
 * @param isSessionComplete - Whether session is complete
 */
const CommandInput: React.FC<CommandInputProps> = ({
  onSubmit,
  isDisabled,
  isSessionComplete,
}) => {
  const [command, setCommand] = useState<string>("");
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
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  debugLog("Rendering CommandInput", {
    command,
    isDisabled,
    isSessionComplete,
    historyLength: inputHistory.length,
    historyIndex,
  });

  // Focus input on component mount
  useEffect(() => {
    debugLog("CommandInput mounted, focusing input");
    if (inputRef.current) {
      inputRef.current.focus();
      debugLog("Input focused");
    }
  }, []);

  // Re-focus after command submission
  useEffect(() => {
    if (!isDisabled && inputRef.current) {
      debugLog("Input re-focus triggered", { isDisabled });
      inputRef.current.focus();
    }
  }, [isDisabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentTime = Date.now();
    const newValue = e.target.value;

    debugLog("Input changed", {
      prevValue: command,
      newValue,
      currentTime,
    });

    // Start tracking if this is the first character
    if (command === "" && newValue !== "") {
      debugLog("First character typed, starting metrics tracking");
      setStartTime(currentTime);
    }

    // Track backspace/delete operations for corrections
    if (newValue.length < command.length) {
      debugLog("Correction detected", {
        prevLength: command.length,
        newLength: newValue.length,
      });

      setMetrics((prev) => ({
        ...prev,
        corrections: prev.corrections + 1,
      }));
    }

    // Track hesitations (pauses between keystrokes)
    if (lastKeystrokeTime && currentTime - lastKeystrokeTime > 1000) {
      const hesitationDuration = currentTime - lastKeystrokeTime;
      debugLog("Hesitation detected", {
        duration: hesitationDuration,
        position: command.length,
      });

      setMetrics((prev) => ({
        ...prev,
        hesitations: [
          ...prev.hesitations,
          { duration: hesitationDuration, position: command.length },
        ],
      }));
    }

    // Update keystroke metrics
    const lastChar = newValue.length > 0 ? newValue.slice(-1) : "";
    debugLog("Adding keystroke to metrics", {
      key: lastChar,
      timestamp: currentTime,
    });

    setMetrics((prev) => ({
      ...prev,
      keystrokes: [
        ...prev.keystrokes,
        { key: lastChar, timestamp: currentTime },
      ],
    }));

    setLastKeystrokeTime(currentTime);
    setCommand(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    debugLog("Key down event", {
      key: e.key,
      keyCode: e.keyCode,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    });

    // Handle up/down arrows for command history
    if (e.key === "ArrowUp" && inputHistory.length > 0) {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
      const historyCommand = inputHistory[inputHistory.length - 1 - newIndex];

      debugLog("History navigation - up", {
        newIndex,
        historyCommand,
        totalHistory: inputHistory.length,
      });

      setHistoryIndex(newIndex);
      setCommand(historyCommand);
    } else if (e.key === "ArrowDown" && historyIndex > -1) {
      e.preventDefault();
      const newIndex = historyIndex - 1;

      debugLog("History navigation - down", {
        newIndex,
        totalHistory: inputHistory.length,
      });

      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setCommand("");
        debugLog("History navigation - returned to empty input");
      } else {
        const historyCommand = inputHistory[inputHistory.length - 1 - newIndex];
        setCommand(historyCommand);
        debugLog("History navigation - selected command", { historyCommand });
      }
    }

    // Track current keystroke
    debugLog("Recording keydown in metrics", { key: e.key });
    setMetrics((prev) => ({
      ...prev,
      keystrokes: [...prev.keystrokes, { key: e.key, timestamp: Date.now() }],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (command.trim() === "" || isDisabled) {
      debugLog("Command submission prevented", {
        isEmpty: command.trim() === "",
        isDisabled,
      });
      return;
    }

    // Calculate final metrics
    const endTime = Date.now();
    const inputDuration = startTime ? endTime - startTime : 0;

    const finalMetrics = {
      ...metrics,
      inputDuration,
      commandLength: command.length,
    };

    debugLog("Command submitted", {
      command,
      metrics: finalMetrics,
      duration: inputDuration,
      keystrokes: metrics.keystrokes.length,
      corrections: metrics.corrections,
      hesitations: metrics.hesitations.length,
    });

    // Add to history
    setInputHistory((prev) => {
      const newHistory = [...prev, command];
      debugLog("Updated command history", {
        historySize: newHistory.length,
        lastCommands: newHistory.slice(-3),
      });
      return newHistory;
    });

    setHistoryIndex(-1);

    // Submit command with metrics
    onSubmit(command, finalMetrics);

    // Reset input and metrics
    setCommand("");
    setMetrics({
      keystrokes: [],
      corrections: 0,
      hesitations: [],
      inputDuration: 0,
      commandLength: 0,
    });
    setStartTime(null);
    setLastKeystrokeTime(null);
    debugLog("Reset input state after submission");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-700 bg-black p-4"
    >
      <div className="flex items-center">
        <span className="text-terminal-green mr-2">{">"}</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="flex-grow bg-transparent text-terminal-green outline-none focus:outline-none"
          placeholder={
            isSessionComplete
              ? "Session complete"
              : isDisabled
              ? "Processing..."
              : "Enter command..."
          }
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </form>
  );
};

export default CommandInput;
