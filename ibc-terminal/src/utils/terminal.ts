/**
 * terminal.ts
 * -----------
 * Provides utility functions for terminal UI effects, command parsing, and special command handling in the IBC Terminal platform.
 * Used for enhancing user experience and supporting research on command input and feedback.
 *
 * Exports:
 * - typewriterEffect: Animates text with a typewriter effect
 * - parseCommand: Parses user input into command and arguments
 * - formatTerminalText: Formats text with terminal color styling
 * - processSpecialCommands: Handles non-AI terminal commands (clear, debug, etc.)
 */

// Terminal utility functions

/**
 * Animates text in a DOM element with a typewriter effect for research on feedback timing.
 * @param text - The text to animate
 * @param element - The target DOM element
 * @param speed - Delay in ms between characters (default 50)
 * @returns Promise that resolves when animation is complete
 */
export const typewriterEffect = (
  text: string,
  element: HTMLElement,
  speed = 50
): Promise<void> => {
  let i = 0;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
};

/**
 * Parses a user input string into a command and argument array.
 * @param input - The raw user input
 * @returns Object with command and args array
 */
export const parseCommand = (
  input: string
): { command: string; args: string[] } => {
  const parts = input.trim().split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
};

/**
 * Formats text with terminal color styling for feedback and research on user perception.
 * @param text - The text to format
 * @param type - The message type (error, success, info, warning)
 * @returns HTML string with color styling
 */
export const formatTerminalText = (
  text: string,
  type: "error" | "success" | "info" | "warning" = "info"
): string => {
  const colors = {
    error: "var(--terminal-red)",
    success: "var(--terminal-green)",
    info: "var(--terminal-blue)",
    warning: "var(--terminal-yellow)",
  };

  return `<span style="color: ${colors[type]}">${text}</span>`;
};

/**
 * Processes special terminal commands that are not sent to the AI (e.g., clear, debug).
 * @param input - The raw user input
 * @returns Object indicating if it is a special command and the result if applicable
 */
export const processSpecialCommands = (
  input: string
): { isSpecialCommand: boolean; result?: string } => {
  const { command, args } = parseCommand(input);

  switch (command) {
    case "clear":
      return { isSpecialCommand: true, result: "CLEAR_TERMINAL" };

    case "help":
      // Let the AI handle help command with game context
      return { isSpecialCommand: false };

    case "debug":
      if (process.env.NODE_ENV === "development") {
        return {
          isSpecialCommand: true,
          result: `Debug mode: ${args.join(" ") || "No arguments provided"}`,
        };
      }
      return { isSpecialCommand: false };

    default:
      return { isSpecialCommand: false };
  }
};
