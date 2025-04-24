/**
 * worldAllocation.ts
 * ------------------
 * Maps world IDs to world configuration data and provides variant-specific details for research.
 * Used to retrieve world and variant context for the IBC Terminal experiment.
 *
 * Exports:
 * - getWorldData: Returns world configuration for a given worldId
 * - getVariantDetails: Returns variant-specific details for a world
 */

import { getWorldConfig } from "../config/worlds";

/**
 * Returns the configuration data for a given world ID.
 * @param worldId - The world index (0-6)
 * @returns The world configuration object
 */
export const getWorldData = (worldId: number) => {
  // Validate worldId is in valid range
  if (worldId < 0 || worldId > 6) {
    throw new Error(`Invalid world ID: ${worldId}. Must be between 0 and 6.`);
  }

  return getWorldConfig(worldId);
};

/**
 * Returns the variant-specific details for a world.
 * @param worldId - The world index (0-6)
 * @param variant - The experimental/control variant ('A' | 'B')
 * @returns The variant details object
 */
export const getVariantDetails = (worldId: number, variant: "A" | "B") => {
  const worldData = getWorldData(worldId);

  return variant === "A"
    ? worldData.controlVariant
    : worldData.experimentalVariant;
};
