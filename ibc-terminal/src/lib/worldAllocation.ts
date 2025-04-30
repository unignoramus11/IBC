/**
 * worldAllocation.ts
 * ------------------
 * Maps world IDs to world configuration data.
 * Used to retrieve world context for the IBC Terminal experiment.
 */

// Import the configuration data and type definition
import {
  worldDefinitions,
  WorldDefinition,
  getWorldConfig,
} from "../config/worlds.config";

/**
 * Returns the configuration data for a given world ID.
 * @param worldId - The world index (0-6)
 * @returns The world configuration object (WorldDefinition)
 * @throws Error if the worldId is invalid or config not found
 */
export const getWorldData = (worldId: number): WorldDefinition => {
  // Validate worldId is in valid range (assuming 0-6 inclusive)
  if (worldId < 0 || worldId >= worldDefinitions.length) {
    console.error(`Attempted to access invalid world ID: ${worldId}`);
    throw new Error(
      `Invalid world ID: ${worldId}. Must be between 0 and ${
        worldDefinitions.length - 1
      }.`
    );
  }

  // Use the helper function from the config file to get the world data
  // This ensures consistency if the retrieval logic becomes more complex later
  try {
    const worldData = getWorldConfig(worldId);
    return worldData;
  } catch (error) {
    // Log the error and re-throw or handle appropriately
    console.error(`Error retrieving world config for ID ${worldId}:`, error);
    throw new Error(
      `Configuration for world ID ${worldId} could not be processed.`
    );
  }
};
