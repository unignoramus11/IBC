/**
 * deviceId.ts
 * -----------
 * Handles device/session identification and deterministic world/variant allocation for research.
 * Ensures each participant is consistently assigned to a world and experimental/control variant.
 *
 * Exports:
 * - generateDeviceId: Returns a persistent unique device/session ID
 * - allocateWorld: Maps deviceId to worldId (0-4) and variant ('A' | 'B')
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generates or retrieves a persistent device/session ID for the participant.
 * @returns A UUID string stored in localStorage
 */
export const generateDeviceId = (): string => {
  // Check if a device ID already exists in localStorage
  const existingId = localStorage.getItem("ibc_device_id");

  if (existingId) {
    return existingId;
  }

  // Generate a new UUID
  const newId = uuidv4();

  // Store in localStorage for persistence
  localStorage.setItem("ibc_device_id", newId);

  return newId;
};

/**
 * Deterministically allocates a world and variant for a given device ID.
 * @param deviceId - The device/session UUID
 * @returns An object with worldId (0-4) and variant ('A' | 'B')
 */
export const allocateWorld = (
  deviceId: string
): { worldId: number; variant: "A" | "B" } => {
  // Convert UUID to a number for consistent allocation
  const idSum = deviceId
    .replace(/-/g, "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  // Allocate world ID (0-4) based on modulo 5
  const worldId = idSum % 5;

  // Allocate variant (A or B) based on even/odd
  const variant = idSum % 2 === 0 ? "A" : "B";

  return { worldId, variant };
};
