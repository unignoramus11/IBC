// Terminal utility functions

// Add a typewriter effect to text
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

// Parse terminal commands
export const parseCommand = (input: string): { command: string; args: string[] } => {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  return { command, args };
};

// Format text with terminal styling
export const formatTerminalText = (
  text: string,
  type: 'error' | 'success' | 'info' | 'warning' = 'info'
): string => {
  const colors = {
    error: 'var(--terminal-red)',
    success: 'var(--terminal-green)',
    info: 'var(--terminal-blue)',
    warning: 'var(--terminal-yellow)',
  };
  
  return `<span style="color: ${colors[type]}">${text}</span>`;
};

// Process special terminal commands not sent to the AI
export const processSpecialCommands = (
  input: string
): { isSpecialCommand: boolean; result?: string } => {
  const { command, args } = parseCommand(input);
  
  switch (command) {
    case 'clear':
      return { isSpecialCommand: true, result: 'CLEAR_TERMINAL' };
      
    case 'help':
      // Let the AI handle help command with game context
      return { isSpecialCommand: false };
      
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        return { 
          isSpecialCommand: true, 
          result: `Debug mode: ${args.join(' ') || 'No arguments provided'}`
        };
      }
      return { isSpecialCommand: false };
      
    default:
      return { isSpecialCommand: false };
  }
};