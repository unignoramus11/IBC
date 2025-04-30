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
  segments?: TextSegment[]; // Use pre-parsed segments if available
}

// Interface to represent split text segments with type information
interface TextSegment {
  text: string;
  isPoem: boolean;
  isEmphasized?: boolean; // New property for emphasized text
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

/**
 * Splits text into regular segments and poem segments
 * @param text - The input text that might contain poem tags
 * @returns Array of TextSegment objects
 */
const parseTextSegments = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  const poemRegex = /<POEM>([\s\S]*?)<\/POEM>/g;

  let lastIndex = 0;
  let match;

  // Find all poem segments and add them to the segments array
  while ((match = poemRegex.exec(text)) !== null) {
    // Add non-poem text segment before the match
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        isPoem: false,
      });
    }

    // Add poem segment (without the tags)
    segments.push({
      text: match[1], // Content inside the poem tags
      isPoem: true,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last poem segment
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isPoem: false,
    });
  }

  debugLog("Parsed text segments", {
    segmentCount: segments.length,
    poemSegments: segments.filter((s) => s.isPoem).length,
  });

  return segments;
};

/**
 * Processes both poem tags and emphasized text (between *asterisks*)
 * @param text - The input text that might contain poem tags and emphasized text
 * @returns Array of TextSegment objects with appropriate flags
 */
const parseTextWithFormatting = (text: string): TextSegment[] => {
  // First parse poem segments
  const segments: TextSegment[] = parseTextSegments(text);
  const result: TextSegment[] = [];

  // Then parse each segment for emphasized text (text between asterisks)
  for (const segment of segments) {
    // Only process non-poem segments for emphasis (preserve poem formatting as-is)
    if (!segment.isPoem) {
      // Regex to find text between asterisks, but only where asterisks don't touch alphanumerics on the outside
      // This avoids matching things like "multiplication*operator" but matches " *important* "
      const emphasizedRegex = /(?<!\w)\*([^*]+?)\*(?!\w)/g;
      let lastIndex = 0;
      let match;
      let hasEmphasis = false;

      // Check if there are any emphasized segments
      if (emphasizedRegex.test(segment.text)) {
        hasEmphasis = true;
        // Reset the regex state
        emphasizedRegex.lastIndex = 0;

        // Process all emphasized segments
        while ((match = emphasizedRegex.exec(segment.text)) !== null) {
          // Add regular text before the emphasized part
          if (match.index > lastIndex) {
            result.push({
              text: segment.text.substring(lastIndex, match.index),
              isPoem: false,
              isEmphasized: false,
            });
          }

          // Add emphasized text (without the asterisks)
          result.push({
            text: match[1], // Content inside the asterisks
            isPoem: false,
            isEmphasized: true,
          });

          lastIndex = match.index + match[0].length;
        }

        // Add any remaining text after the last emphasized segment
        if (lastIndex < segment.text.length) {
          result.push({
            text: segment.text.substring(lastIndex),
            isPoem: false,
            isEmphasized: false,
          });
        }
      }

      // If no emphasized text was found, add the segment as is
      if (!hasEmphasis) {
        result.push({
          text: segment.text,
          isPoem: false,
          isEmphasized: false,
        });
      }
    } else {
      // Preserve poem segments as is
      result.push(segment);
    }
  }

  debugLog("Parsed text segments with formatting", {
    segmentCount: result.length,
    poemSegments: result.filter((s) => s.isPoem).length,
    emphasizedSegments: result.filter((s) => s.isEmphasized).length,
  });

  return result;
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
 * Process content for display, handles special formatting and strips regular markdown
 * @param content - The raw content from a message
 * @returns Array of TextSegment objects with processed text
 */
const processContentForDisplay = (content: string): TextSegment[] => {
  // First parse the text for poem segments and emphasized text
  const segments = parseTextWithFormatting(content);
  
  // Then strip markdown from each segment (but preserve formatting flags)
  return segments.map((segment) => ({
    text: stripMarkdown(segment.text),
    isPoem: segment.isPoem,
    isEmphasized: segment.isEmphasized
  }));
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

  // Render a specific text segment based on its type
  const renderTextSegment = (segment: TextSegment, index: number) => {
    if (segment.isPoem) {
      return (
        <span
          key={index}
          className="italic text-terminal-cyan animate-pulse-subtle block my-2 px-4 border-l-2 border-terminal-cyan"
        >
          {segment.text}
        </span>
      );
    }
    
    if (segment.isEmphasized) {
      return (
        <span
          key={index}
          className="font-bold text-terminal-yellow animate-glow-subtle inline-block"
        >
          {segment.text}
        </span>
      );
    }
    
    return <span key={index}>{segment.text}</span>;
  };

  return (
    <div className="space-y-4 font-mono text-sm">
      {messages.map((message, index) => {
        debugLog(`Processing message ${index}`, { role: message.role });

        // Use pre-parsed segments if available, otherwise process the content
        const processedSegments =
          message.segments || processContentForDisplay(message.content);

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
                {processedSegments.map((segment, i) =>
                  renderTextSegment(segment, i)
                )}
              </div>
            ) : (
              <div className="text-terminal-blue whitespace-pre-wrap">
                {processedSegments.map((segment, i) =>
                  renderTextSegment(segment, i)
                )}
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
