import { getWorldConfig } from '../config/worlds';

// Map world ID (0-4) to actual world data
export const getWorldData = (worldId: number) => {
  // Validate worldId is in valid range
  if (worldId < 0 || worldId > 4) {
    throw new Error(`Invalid world ID: ${worldId}. Must be between 0 and 4.`);
  }
  
  return getWorldConfig(worldId);
};

// Get details about the variant
export const getVariantDetails = (worldId: number, variant: 'A' | 'B') => {
  const worldData = getWorldData(worldId);
  
  return variant === 'A' 
    ? worldData.controlVariant 
    : worldData.experimentalVariant;
};