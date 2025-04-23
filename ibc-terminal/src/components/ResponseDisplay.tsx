/**
 * ResponseDisplay.tsx
 * -------------------
 * React component for displaying system, user, and model/AI responses in the IBC Terminal research platform.
 * Handles formatting, markdown stripping, and loading/typing feedback for research on user perception and feedback timing.
 *
 * Exports:
 * - ResponseDisplay: Main display component for terminal responses
 *
 * Props:
 * - messages: Array of message objects (role, content, timestamp)
 * - isLoading: Whether the system is processing a command
 */

"use client";

import React, { useEffect, useRef } from "react";

interface Message {
  role: "system" | "user" | "assistant" | "model";
  content: string;
  timestamp: number;
}

/**
 * Props for ResponseDisplay component.
 */
interface ResponseDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

// Debug logger that only logs in development mode
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[ResponseDisplay] ${message}`, ...data);
  }
};

// Function to strip markdown from text
const stripMarkdown = (text: string): string => {
  debugLog("Stripping markdown from text", { textLength: text.length });

  const result = text
    // Remove headers
    .replace(/#{1,6}\s+/g, "")
    // Remove bold/italic
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    // Remove links
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    // Remove blockquotes
    .replace(/^>\s+/gm, "")
    // Remove code blocks and inline code
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // Remove horizontal rules
    .replace(/^---$/gm, "")
    // Remove ordered and unordered lists markers
    .replace(/^\s*[\*\-]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "");

  debugLog("Markdown stripped", {
    originalLength: text.length,
    strippedLength: result.length,
  });

  return result;
};

/**
 * ResponseDisplay React component for showing terminal messages and feedback.
 * @param messages - Array of message objects
 * @param isLoading - Whether the system is processing a command
 */
const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  messages,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const thinkingSoundRef = useRef<HTMLAudioElement | null>(null);

  debugLog("Rendering ResponseDisplay", {
    messageCount: messages.length,
    isLoading,
  });

  // Manage thinking sound when loading state changes
  useEffect(() => {
    debugLog("Loading state changed", { isLoading });
    if (isLoading) {
      // Start thinking sound when loading starts
      thinkingSoundRef.current = new Audio("/thinking.wav");
      thinkingSoundRef.current.loop = true;
      thinkingSoundRef.current.play().catch((err) => {
        debugLog("Error playing thinking sound", err);
      });
    } else if (thinkingSoundRef.current) {
      // Stop thinking sound when loading stops
      thinkingSoundRef.current.pause();
      thinkingSoundRef.current.currentTime = 0;
      thinkingSoundRef.current = null;
    }

    return () => {
      // Cleanup on unmount
      if (thinkingSoundRef.current) {
        thinkingSoundRef.current.pause();
        thinkingSoundRef.current.currentTime = 0;
      }
    };
  }, [isLoading]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    debugLog("Messages changed, scrolling to bottom");
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      debugLog("Scrolled to bottom");
    }
  }, [messages]);

  return (
    <div className="space-y-4 font-mono text-sm">
      {messages.map((message, index) => {
        debugLog(`Processing message ${index}`, { role: message.role });

        return (
          <div key={index} className="pb-2">
            {message.role === "user" ? (
              <div className="flex">
                <span className="text-terminal-green mr-2 opacity-80">
                  {">"}
                </span>
                <span className="text-terminal-yellow">{message.content}</span>
              </div>
            ) : message.role === "system" ? (
              <div className="text-gray-400 whitespace-pre-wrap">
                {stripMarkdown(message.content)}
              </div>
            ) : (
              <div className="text-terminal-blue whitespace-pre-wrap">
                {stripMarkdown(message.content)}
              </div>
            )}
          </div>
        );
      })}
      {isLoading && (
        <div className="inline-block">
          <span className="animate-blink">_</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ResponseDisplay;
