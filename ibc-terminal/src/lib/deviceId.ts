import { v4 as uuidv4 } from 'uuid';

// Generate a unique device ID
export const generateDeviceId = (): string => {
  // Check if a device ID already exists in localStorage
  const existingId = localStorage.getItem('ibc_device_id');
  
  if (existingId) {
    return existingId;
  }
  
  // Generate a new UUID
  const newId = uuidv4();
  
  // Store in localStorage for persistence
  localStorage.setItem('ibc_device_id', newId);
  
  return newId;
};

// Allocate a world ID (0-4) and variant (A or B) based on the device ID
export const allocateWorld = (deviceId: string): { worldId: number; variant: 'A' | 'B' } => {
  // Convert UUID to a number for consistent allocation
  const idSum = deviceId
    .replace(/-/g, '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  // Allocate world ID (0-4) based on modulo 5
  const worldId = idSum % 5;
  
  // Allocate variant (A or B) based on even/odd
  const variant = idSum % 2 === 0 ? 'A' : 'B';
  
  return { worldId, variant };
};