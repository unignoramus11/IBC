/**
 * Terminal.tsx
 * ------------
 * Main interactive terminal component for the IBC Terminal research platform.
 * Handles world selection, session initialization, command input, response display, and session completion logic.
 * Integrates with data collection and world allocation modules for research on functional fixedness and problem-solving.
 *
 * Exports:
 * - Terminal: Main terminal UI and logic component
 *
 * Props:
 * - deviceId: Unique identifier for the participant's device/session
 * - worldId: (Optional) Pre-selected world index
 * - variant: Experimental/control variant ("A" or "B")
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import CommandInput from "./CommandInput";
import ResponseDisplay from "./ResponseDisplay";
import HistoryDrawer from "./HistoryDrawer";
import { trackUserInteraction } from "../lib/dataCollection";
import { getWorldData } from "../lib/worldAllocation";

// Debug logger that only logs in development mode
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Terminal] ${message}`, ...data);
  }
};

/**
 * Props for Terminal component.
 */
interface TerminalProps {
  deviceId: string;
  worldId?: number; // Optional now, as we'll select it via CLI
  variant: "A" | "B";
}

interface Message {
  role: "system" | "user" | "model";
  content: string;
  timestamp: number;
}

// Function to format session time (MM:SS)
const formatSessionTime = (startTime: number): string => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Terminal React component for the main experiment interface and session logic.
 * @param deviceId - Unique device/session ID
 * @param worldId - (Optional) Pre-selected world index
 * @param variant - Experimental/control variant
 */
const Terminal: React.FC<TerminalProps> = ({ deviceId, worldId, variant }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionComplete, setSessionComplete] = useState<boolean>(false);
  const [selectedWorldId, setSelectedWorldId] = useState<number | undefined>(
    worldId
  );
  const [worldSelectionMode, setWorldSelectionMode] = useState<boolean>(
    !worldId
  );
  const terminalRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef<boolean>(false);
  const [sessionTime, setSessionTime] = useState<string>("00:00");

  // Update session time continuously
  useEffect(() => {
    if (messages.length > 0) {
      // Use requestAnimationFrame to update time smoothly during animations
      let frameId: number;

      const updateTime = () => {
        setSessionTime(formatSessionTime(messages[0].timestamp));
        frameId = requestAnimationFrame(updateTime);
      };

      // Start the animation frame loop
      frameId = requestAnimationFrame(updateTime);

      // Clean up
      return () => {
        cancelAnimationFrame(frameId);
      };
    }
  }, [messages]);

  debugLog("Rendering Terminal", {
    deviceId,
    worldId,
    variant,
    selectedWorldId,
    worldSelectionMode,
    isLoading,
    sessionComplete,
    messageCount: messages.length,
    sessionTime,
    initialized: initializedRef.current,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    debugLog("Messages changed, scrolling to bottom");
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      debugLog("Scrolled to bottom", {
        scrollHeight: terminalRef.current.scrollHeight,
        clientHeight: terminalRef.current.clientHeight,
      });
    }
  }, [messages]);

  // Initialize with world selection or load specified world
  useEffect(() => {
    const initialize = async () => {
      // Skip if already initialized (prevents double init in strict mode)
      if (initializedRef.current) {
        debugLog("Terminal already initialized, skipping initialization");
        return;
      }

      debugLog("Initializing terminal", {
        deviceId,
        variant,
        worldId: selectedWorldId,
        worldSelectionMode,
      });

      initializedRef.current = true;
      setIsLoading(true);

      // If no world is selected, show world selection screen
      if (worldSelectionMode) {
        debugLog("Entering world selection mode");
        try {
          // Prepare mystical descriptions for each world
          const worldDescriptions = [];
          for (let i = 0; i < 5; i++) {
            try {
              const world = getWorldData(i);
              worldDescriptions.push({
                id: i,
                name: world.name,
                description: world.description,
              });
              debugLog(`Loaded world data for world ${i}`, {
                name: world.name,
                descriptionLength: world.description.length,
              });
            } catch (error) {
              debugLog(`Error loading world ${i}:`, error);
              console.warn(`Error loading world ${i}:`, error);
            }
          }

          // Format the world selection prompt
          const selectionPrompt = `
> Terminal initialized...
> Connection established to the nexus of realities...
> Five worlds await your presence, traveler.
> Which dimension calls to your spirit?

${worldDescriptions
  .map(
    (world, index) =>
      `[${index + 1}] ${world.name} - ${world.description.substring(0, 150)}${
        world.description.length > 150 ? "..." : ""
      }`
  )
  .join("\n\n")}

> Type a number (1-5) to select your destination...`;

          debugLog("Setting world selection message", {
            promptLength: selectionPrompt.length,
            worldsAvailable: worldDescriptions.length,
          });

          setMessages([
            {
              role: "system",
              content: selectionPrompt,
              timestamp: Date.now(),
            },
          ]);
        } catch (error) {
          debugLog("Error in world selection initialization", error);
          console.error("Error preparing world selection:", error);
          setMessages([
            {
              role: "system",
              content:
                "> Terminal starting...\n> Error connecting to world nexus.\n> Please refresh and try again.",
              timestamp: Date.now(),
            },
          ]);
        }
        setIsLoading(false);
        return;
      }

      // If world is already selected, initialize that world
      try {
        if (selectedWorldId === undefined) {
          debugLog("No world selected for initialization");
          throw new Error("No world selected");
        }

        debugLog(`Initializing world ${selectedWorldId}`);

        const worldData = getWorldData(selectedWorldId);
        debugLog("Retrieved world data", {
          name: worldData.name,
          variant,
        });

        // Show loading messages first, before the API call
        debugLog("Setting initial system messages");
        setMessages([
          {
            role: "system",
            content: "> Terminal starting...",
            timestamp: Date.now() - 1000,
          },
          {
            role: "system",
            content: "> System initialized",
            timestamp: Date.now() - 500,
          },
          {
            role: "system",
            content: `> Connecting to ${worldData.name}...`,
            timestamp: Date.now() - 250,
          },
        ]);

        // Force render before continuing
        debugLog("Waiting for render before continuing");
        await new Promise((resolve) => setTimeout(resolve, 10));

        debugLog("Making session initialization API call", {
          deviceId,
          worldId: selectedWorldId,
          variant,
        });

        const response = await fetch("/api/session/initialize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceId,
            worldId: selectedWorldId,
            variant,
          }),
        });

        if (!response.ok) {
          debugLog("Session initialization API error", {
            status: response.status,
            statusText: response.statusText,
          });
          throw new Error("Failed to initialize session");
        }

        const data = await response.json();
        debugLog("Session initialization successful", {
          initialMessageLength: data.initialMessage?.length || 0,
        });

        // Get the initial message
        const initialMessage = data.initialMessage;
        const timestamp = Date.now();

        // Add empty message that we'll animate
        debugLog("Adding empty message placeholder for animation");
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: "", // Start empty, will animate
            timestamp,
          },
        ]);

        // First end the loading state to stop thinking sound
        setIsLoading(false);

        // Give a small pause to ensure thinking sound has stopped
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Play typing sound for the animation
        debugLog("Starting typing sound for introduction animation");
        const typingSound = new Audio("/typing.wav");
        typingSound.loop = true;

        try {
          await typingSound.play();
        } catch (soundError) {
          debugLog("Error playing typing sound", soundError);
          console.warn("Could not play typing sound:", soundError);
        }

        // Wait a moment to ensure message is rendered
        debugLog("Waiting for message render");
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Animate the introduction text
        try {
          debugLog("Starting text animation", {
            textLength: initialMessage.length,
          });

          let displayedText = "";
          // Adjust speed based on text length
          const speed = Math.min(Math.max(30, initialMessage.length / 25), 70);
          const delay = 1000 / speed;
          debugLog("Animation parameters", { speed, delay });

          for (let i = 0; i < initialMessage.length; i++) {
            displayedText += initialMessage[i];

            // Update message
            setMessages((prev) => {
              const newMessages = [...prev];
              const messageIndex = newMessages.findIndex(
                (msg) => msg.role === "model" && msg.timestamp === timestamp
              );
              if (messageIndex !== -1) {
                newMessages[messageIndex].content = displayedText;
              } else {
                debugLog("Failed to find message for animation update", {
                  timestamp,
                  currentLength: i,
                });
              }
              return newMessages;
            });

            // Scroll as we type
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }

            // Wait before adding next character
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          debugLog("Text animation completed successfully");
        } catch (animError) {
          debugLog("Error during intro animation", animError);
          console.error("Error during intro animation:", animError);

          // If animation fails, show full message
          setMessages((prev) => {
            const newMessages = [...prev];
            const messageIndex = newMessages.findIndex(
              (msg) => msg.role === "model" && msg.timestamp === timestamp
            );
            if (messageIndex !== -1) {
              newMessages[messageIndex].content = initialMessage;
              debugLog("Set full message content after animation failure");
            } else {
              debugLog(
                "Failed to find message to update after animation failure"
              );
            }
            return newMessages;
          });
        } finally {
          // Stop typing sound
          debugLog("Stopping typing sound");
          typingSound.pause();
          typingSound.currentTime = 0;
        }
      } catch (error) {
        debugLog("Error in terminal initialization", error);
        console.error("Error initializing terminal:", error);
        setMessages([
          {
            role: "system",
            content: "> Terminal starting...",
            timestamp: Date.now() - 500,
          },
          {
            role: "system",
            content: "> Error detected",
            timestamp: Date.now() - 250,
          },
          {
            role: "model",
            content:
              "System error: Failed to initialize terminal. Please refresh and try again.",
            timestamp: Date.now(),
          },
        ]);
        setIsLoading(false);
      }
    };

    initialize();
  }, [deviceId, variant, worldSelectionMode, selectedWorldId]);

  const handleCommand = async (command: string, metrics: any) => {
    debugLog("Command received", {
      command,
      metrics,
      worldSelectionMode,
      selectedWorldId,
    });

    // Handle world selection mode
    if (worldSelectionMode) {
      debugLog("Processing world selection command", { command });
      const worldNumber = parseInt(command.trim());

      // Add user command to messages
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: command,
          timestamp: Date.now(),
        },
      ]);

      // Check if input is a valid world number
      if (isNaN(worldNumber) || worldNumber < 1 || worldNumber > 5) {
        debugLog("Invalid world selection", {
          input: command,
          parsed: worldNumber,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content:
              "> Invalid selection. Please enter a number between 1 and 5.",
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      // Convert to zero-based index and select the world
      const selectedId = worldNumber - 1;
      debugLog("World selected", { worldNumber, selectedId });

      try {
        // Verify the world exists
        const world = getWorldData(selectedId);
        debugLog("World data verified", { name: world.name });

        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `> World selected: ${world.name}\n> Establishing connection...`,
            timestamp: Date.now(),
          },
        ]);

        // Set the selected world and exit world selection mode
        debugLog("Setting world and exiting selection mode", {
          worldId: selectedId,
        });
        setSelectedWorldId(selectedId);
        setWorldSelectionMode(false);

        // Reset initialization flag to allow initialization of the selected world
        debugLog("Resetting initialization flag for new world");
        initializedRef.current = false;

        return;
      } catch (error) {
        debugLog("Error selecting world", { selectedId, error });
        console.error("Error selecting world:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: "> Error selecting world. Please try again.",
            timestamp: Date.now(),
          },
        ]);
        return;
      }
    }

    // Check for session completion command
    if (
      command.toLowerCase() === "exit" ||
      command.toLowerCase() === "quit" ||
      command.toLowerCase() === "end session" ||
      command.toLowerCase() === "finish"
    ) {
      debugLog("Session completion command detected", { command });
      setSessionComplete(true);

      // Add user command to messages
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: command,
          timestamp: Date.now(),
        },
        {
          role: "system",
          content: "> Uploading session data...",
          timestamp: Date.now() + 1,
        },
      ]);

      // Import the function dynamically to avoid server-side rendering issues
      debugLog("Dynamically importing data upload function");
      const { uploadStoredInteractions } = await import(
        "../lib/dataCollection"
      );

      // Upload data
      debugLog("Starting data upload");
      const success = await uploadStoredInteractions();
      debugLog("Data upload complete", { success });

      // Show result
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: success
            ? "> Session data uploaded successfully. You may now close this window."
            : "> Failed to upload session data. Please try again or contact support.",
          timestamp: Date.now() + 1000,
        },
      ]);

      return; // Don't proceed with regular command handling
    }

    // Track user interaction data (stored locally)
    debugLog("Tracking user interaction", {
      deviceId,
      command,
      timestampCount: metrics?.keystrokes?.length || 0,
      worldId: selectedWorldId,
    });

    // Save the response once we get it to properly track the entire conversation
    const interactionTimestamp = Date.now();

    // Start tracking the interaction without response yet
    trackUserInteraction({
      deviceId,
      command,
      response: "", // Will be updated after we get the response
      metrics,
      timestamp: interactionTimestamp,
      worldId: selectedWorldId ? selectedWorldId : 0,
      variant,
      puzzleContext: { isAttemptedSolution: false, isSolutionSuccess: false }, // Will be updated in the backend when determining puzzle relevance
    });

    // Add user command to messages
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: command,
        timestamp: Date.now(),
      },
    ]);

    setIsLoading(true);
    debugLog("Processing command", { command, worldId: selectedWorldId });

    try {
      debugLog("Sending command to API", {
        command,
        worldId: selectedWorldId,
        variant,
      });

      const response = await fetch("/api/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId,
          command,
          worldId: selectedWorldId,
          variant,
        }),
      });

      if (!response.ok) {
        debugLog("Command API error", {
          status: response.status,
          statusText: response.statusText,
        });

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to process command");
      }

      // Get the complete response from the Gemini API via our backend
      const responseData = await response.json();
      debugLog("Command response received", {
        responseLength: responseData.response?.length || 0,
      });

      if (!responseData.response) throw new Error("No response received");

      // Update the interaction with the response for proper conversation tracking
      const { updateInteraction } = await import("../lib/dataCollection");
      await updateInteraction(
        deviceId,
        interactionTimestamp,
        responseData.response,
        responseData.puzzleContext
      );

      // First end the loading state to stop thinking sound
      setIsLoading(false);

      // Give a small pause to ensure thinking sound has stopped
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Play typing sound for the animation
      debugLog("Starting typing sound for animation");
      const typingSound = new Audio("/typing.wav");
      typingSound.loop = true;

      try {
        await typingSound.play();
      } catch (soundError) {
        debugLog("Error playing typing sound", soundError);
        console.warn("Could not play typing sound:", soundError);
      }

      // Get the complete response text
      const responseText = responseData.response;

      // Add an empty message that we'll animate with typing effect
      const timestamp = Date.now();
      debugLog("Adding empty placeholder for response animation");

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "", // Start empty, will be updated character by character
          timestamp,
        },
      ]);

      // Force immediate render of the empty message
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Animate the text character by character
      const animateText = async () => {
        debugLog("Starting response animation", {
          responseLength: responseText.length,
        });

        // Calculate typing speed - faster for longer texts
        const baseSpeed = 40; // characters per second
        const adjustedSpeed = Math.min(
          Math.max(baseSpeed, responseText.length / 20),
          80
        );
        const delayBetweenChars = 1000 / adjustedSpeed;
        debugLog("Animation parameters", {
          baseSpeed,
          adjustedSpeed,
          delayBetweenChars,
        });

        let currentText = "";

        for (let i = 0; i < responseText.length; i++) {
          currentText += responseText[i];

          // Update the message content with current text
          setMessages((prev) => {
            const newMessages = [...prev];
            const messageIndex = newMessages.findIndex(
              (msg) => msg.role === "model" && msg.timestamp === timestamp
            );
            if (messageIndex !== -1) {
              newMessages[messageIndex].content = currentText;
            } else {
              debugLog("Failed to find message for animation update", {
                timestamp,
                currentLength: i,
              });
            }
            return newMessages;
          });

          // Scroll to bottom with each character update
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }

          // Wait before adding the next character
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenChars)
          );
        }

        debugLog("Text animation complete");
      };

      // Start the animation
      try {
        await animateText();
      } catch (animationError) {
        debugLog("Error during response animation", animationError);
        console.error("Error during text animation:", animationError);

        // If animation fails, just show the complete text
        setMessages((prev) => {
          const newMessages = [...prev];
          const messageIndex = newMessages.findIndex(
            (msg) => msg.role === "model" && msg.timestamp === timestamp
          );
          if (messageIndex !== -1) {
            newMessages[messageIndex].content = responseText;
            debugLog("Set full response text after animation failure");
          } else {
            debugLog("Failed to find message after animation failure");
          }
          return newMessages;
        });
      } finally {
        // Stop typing sound when animation is complete
        debugLog("Stopping typing sound");
        typingSound.pause();
        typingSound.currentTime = 0;
      }
    } catch (error) {
      debugLog("Error processing command", error);
      console.error("Error processing command:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "System error: Failed to process command. Please try again.",
          timestamp: Date.now(),
        },
      ]);
      setIsLoading(false);
    }
  };

  // Removed history toggle function

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="flex-grow overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-2 text-xs border-b border-gray-700 text-terminal-green font-mono bg-[var(--status-bar-bg)]">
          <div>
            {selectedWorldId !== undefined
              ? getWorldData(selectedWorldId).name
              : "Terminal"}
          </div>
          <div>
            {variant === "A" ? "Control Variant" : "Experimental Variant"}
          </div>
          <div>{messages.length > 0 ? `${sessionTime}` : "00:00"}</div>
        </div>

        <div ref={terminalRef} className="flex-grow p-4 overflow-y-auto">
          <ResponseDisplay messages={messages} isLoading={isLoading} />
        </div>

        <CommandInput
          onSubmit={handleCommand}
          isDisabled={isLoading || sessionComplete}
          isSessionComplete={sessionComplete}
        />
      </div>
    </div>
  );
};

export default Terminal;
