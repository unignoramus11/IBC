/**
 * HistoryDrawer.tsx
 * -----------------
 * React component for displaying the command and response history in the IBC Terminal research platform.
 * Used for reviewing participant interactions and supporting research on command sequence and recall.
 *
 * Exports:
 * - HistoryDrawer: Drawer component for session history
 *
 * Props:
 * - isOpen: Whether the drawer is visible
 * - onClose: Function to close the drawer
 * - messages: Array of message objects (role, content, timestamp)
 */

"use client";

import React, { useEffect } from "react";

// Debug logger that only logs in development mode
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[HistoryDrawer] ${message}`, ...data);
  }
};

interface Message {
  role: "system" | "user" | "model";
  content: string;
  timestamp: number;
}

/**
 * Props for HistoryDrawer component.
 */
interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

/**
 * HistoryDrawer React component for displaying session command history.
 * @param isOpen - Whether the drawer is open
 * @param onClose - Handler to close the drawer
 * @param messages - Array of message objects
 */
const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  messages,
}) => {
  debugLog("Rendering HistoryDrawer", {
    isOpen,
    messageCount: messages.length,
  });

  useEffect(() => {
    if (isOpen) {
      debugLog("History drawer opened", {
        visibleMessages: messages.length,
        firstMessageTime:
          messages.length > 0
            ? new Date(messages[0].timestamp).toISOString()
            : "none",
        lastMessageTime:
          messages.length > 0
            ? new Date(messages[messages.length - 1].timestamp).toISOString()
            : "none",
      });
    }
  }, [isOpen, messages]);

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleClose = () => {
    debugLog("History drawer closing");
    onClose();
  };

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 
        transition-transform duration-300 z-10
        ${isOpen ? "translate-y-0" : "-translate-y-full"}
      `}
      style={{ maxHeight: "60vh", overflowY: "auto" }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-terminal-green text-lg">Command History</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            ▲ Close
          </button>
        </div>

        <div className="space-y-2">
          {messages.map((message, index) => {
            debugLog(`Rendering history message ${index}`, {
              role: message.role,
              timestamp: new Date(message.timestamp).toISOString(),
              contentLength: message.content.length,
            });

            return (
              <div key={index} className="text-sm">
                <div className="text-gray-500 text-xs">
                  {formatTime(message.timestamp)} - {message.role}
                </div>
                <div
                  className={`
                  ${
                    message.role === "user"
                      ? "text-terminal-yellow"
                      : "text-terminal-blue"
                  }
                  truncate
                `}
                >
                  {message.content}
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-gray-500 italic">No history yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;
