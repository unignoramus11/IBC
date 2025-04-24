/**
 * PrivacyPolicyConsent.tsx
 * -----------------------
 * Component to display privacy policy and require user consent before proceeding.
 */

"use client";

import React, { useState, useRef } from "react";

// Simple cookie utility
function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

interface PrivacyPolicyConsentProps {
  onConsent: () => void;
}

const PRIVACY_POLICY = `TERMINAL PRIVACY POLICY\n\nWhat data is collected?\n- All commands you enter in the terminal\n- Keystroke-level typing metrics (timing, corrections, hesitations)\n- Session duration and puzzle progress\n- Anonymous device/session ID\n\nHow is your data used?\n- For research on problem-solving and cognitive science\n- To analyze patterns in command usage and puzzle solving\n- To improve the terminal experience\n\nData is anonymous and cannot be traced back to you. No personal identifiers are collected.\n\nBy typing 'y' and pressing Enter, you consent to this data collection.\nYou must provide consent to proceed to the main menu.`;

const PrivacyPolicyConsent: React.FC<PrivacyPolicyConsentProps> = ({
  onConsent,
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === "y") {
      setCookie("terminal_consent", "true");
      setError("");
      onConsent();
    } else {
      setError(
        "Consent not given. Please type 'y' and press Enter to proceed."
      );
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="flex-grow overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-2 text-xs border-b border-gray-700 text-terminal-green font-mono bg-[var(--status-bar-bg)]">
          <div>Terminal</div>
          <div>Privacy Policy Consent</div>
          <div>00:00</div>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          <pre className="mb-4 whitespace-pre-wrap text-left text-terminal-green opacity-80">
            {PRIVACY_POLICY}
          </pre>
          {error && <div className="text-terminal-red mt-2">{error}</div>}
        </div>
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-700 bg-black p-4"
        >
          <div className="flex items-center">
            <span className="text-terminal-green mr-2">&gt;</span>
            <input
              id="consent-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              className="flex-grow bg-transparent text-terminal-green outline-none focus:outline-none"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Type 'y' and press Enter to continue"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export { getCookie };
export default PrivacyPolicyConsent;
