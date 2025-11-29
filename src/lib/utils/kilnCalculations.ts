/**
 * Kiln Capacity and Calculation Utilities
 * Provides dynamic calculations for kiln management
 */

export interface PieceSize {
  width: number; // inches
  depth: number; // inches
  height: number; // inches
  weight?: number; // pounds (optional)
}

export interface ShelfDimensions {
  width: number; // inches
  depth: number; // inches
  height: number; // inches (clearance between shelves)
}

export interface CapacityCalculation {
  piecesPerShelf: number;
  totalCapacity: number;
  utilizationRate: number;
  totalVolume: number; // cubic inches
  estimatedWeight?: number; // pounds (if weight provided)
}

export interface PieceSizePreset {
  name: string;
  dimensions: PieceSize;
  description: string;
}

// Standard piece size presets
export const PIECE_SIZE_PRESETS: Record<string, PieceSizePreset> = {
  small: {
    name: 'Small',
    dimensions: { width: 4, depth: 4, height: 6, weight: 0.5 },
    description: 'Small bowls, cups, small plates'
  },
  medium: {
    name: 'Medium',
    dimensions: { width: 6, depth: 6, height: 8, weight: 1.5 },
    description: 'Medium bowls, vases, dinner plates'
  },
  large: {
    name: 'Large',
    dimensions: { width: 8, depth: 8, height: 10, weight: 3.0 },
    description: 'Large vases, platters, large bowls'
  },
  extraLarge: {
    name: 'Extra Large',
    dimensions: { width: 12, depth: 12, height: 14, weight: 6.0 },
    description: 'Very large pieces, sculptures'
  }
};

/**
 * Calculate capacity for a single shelf
 */
export function calculateShelfCapacity(
  shelfDimensions: ShelfDimensions,
  pieceSize: PieceSize,
  spacing: number = 2, // inches between pieces
  utilizationRate: number = 0.85 // Base utilization rate (used as minimum)
): CapacityCalculation {
  // Calculate how many pieces fit in width (accounting for spacing)
  const piecesInWidth = Math.floor(shelfDimensions.width / (pieceSize.width + spacing));
  
  // Calculate how many pieces fit in depth (accounting for spacing)
  const piecesInDepth = Math.floor(shelfDimensions.depth / (pieceSize.depth + spacing));
  
  // Total pieces that can physically fit (theoretical maximum)
  const theoreticalMax = piecesInWidth * piecesInDepth;
  
  // Apply base utilization rate to account for edge spacing and practical considerations
  const piecesPerShelf = Math.floor(theoreticalMax * utilizationRate);
  
  // Calculate ACTUAL utilization based on how much shelf space is used
  const shelfArea = shelfDimensions.width * shelfDimensions.depth;
  const pieceArea = pieceSize.width * pieceSize.depth;
  
  // Calculate total area used by pieces (including spacing)
  // Each piece takes up: piece area + spacing on two sides (but shared spacing)
  const areaPerPiece = (pieceSize.width + spacing) * (pieceSize.depth + spacing);
  const totalUsedArea = piecesPerShelf * areaPerPiece;
  
  // Actual utilization = how much of the shelf is actually used
  // This will vary based on piece size and spacing
  const actualUtilization = shelfArea > 0 
    ? Math.min(totalUsedArea / shelfArea, 1) 
    : 0;
  
  // Use the actual calculated utilization (it will change with dimensions)
  const effectiveUtilization = Math.max(actualUtilization, utilizationRate * 0.7); // Don't go below 70% of base rate
  
  // Calculate total volume
  const pieceVolume = pieceSize.width * pieceSize.depth * pieceSize.height;
  const totalVolume = piecesPerShelf * pieceVolume;
  
  // Calculate estimated weight if provided
  const estimatedWeight = pieceSize.weight 
    ? piecesPerShelf * pieceSize.weight 
    : undefined;
  
  return {
    piecesPerShelf,
    totalCapacity: piecesPerShelf, // For single shelf
    utilizationRate: effectiveUtilization, // Return the dynamically calculated utilization
    totalVolume,
    estimatedWeight
  };
}

/**
 * Calculate total capacity for multiple shelves
 */
export function calculateTotalCapacity(
  shelfCount: number,
  shelfDimensions: ShelfDimensions,
  pieceSize: PieceSize | 'small' | 'medium' | 'large' | 'extraLarge',
  customPieceSize?: PieceSize,
  spacing: number = 2,
  utilizationRate: number = 0.85
): CapacityCalculation {
  // Get piece size
  let actualPieceSize: PieceSize;
  if (typeof pieceSize === 'string') {
    if (pieceSize === 'custom' && customPieceSize) {
      actualPieceSize = customPieceSize;
    } else {
      actualPieceSize = PIECE_SIZE_PRESETS[pieceSize]?.dimensions || PIECE_SIZE_PRESETS.medium.dimensions;
    }
  } else {
    actualPieceSize = pieceSize;
  }
  
  // Adjust spacing based on piece size - larger pieces need more spacing
  let effectiveSpacing = spacing;
  const pieceArea = actualPieceSize.width * actualPieceSize.depth;
  if (pieceArea > 100) { // Large pieces (>10x10)
    effectiveSpacing = spacing * 1.5;
  } else if (pieceArea < 20) { // Small pieces (<5x4)
    effectiveSpacing = spacing * 0.75;
  }
  
  // Calculate per shelf
  const shelfCapacity = calculateShelfCapacity(
    shelfDimensions,
    actualPieceSize,
    effectiveSpacing,
    utilizationRate
  );
  
  // Calculate total
  const totalCapacity = shelfCapacity.piecesPerShelf * shelfCount;
  const totalVolume = shelfCapacity.totalVolume * shelfCount;
  const totalWeight = shelfCapacity.estimatedWeight 
    ? shelfCapacity.estimatedWeight * shelfCount 
    : undefined;
  
  // Calculate overall utilization (weighted average if multiple shelves)
  // For now, utilization is per-shelf, so it's the same
  const overallUtilization = shelfCapacity.utilizationRate;
  
  return {
    piecesPerShelf: shelfCapacity.piecesPerShelf,
    totalCapacity,
    utilizationRate: overallUtilization, // Return the calculated utilization
    totalVolume,
    estimatedWeight: totalWeight
  };
}

/**
 * Calculate capacity based on firing type
 * Different firing types have different spacing requirements
 */
export function calculateCapacityByFiringType(
  shelfCount: number,
  shelfDimensions: ShelfDimensions,
  firingType: 'bisque' | 'glaze' | 'raku' | 'crystalline',
  pieceSize: PieceSize | 'small' | 'medium' | 'large' | 'extraLarge',
  customPieceSize?: PieceSize
): CapacityCalculation {
  // Firing type specific spacing requirements
  const spacingByType: Record<string, number> = {
    bisque: 1, // Can stack closer
    glaze: 3, // Need more spacing for glaze
    raku: 5, // Safety spacing for raku
    crystalline: 2.5 // Precise spacing for crystalline
  };
  
  // Firing type specific utilization rates
  const utilizationByType: Record<string, number> = {
    bisque: 0.90, // Can pack tighter
    glaze: 0.75, // Need more space
    raku: 0.60, // Safety spacing
    crystalline: 0.80 // Precise but can be efficient
  };
  
  const spacing = spacingByType[firingType] || 2;
  const utilizationRate = utilizationByType[firingType] || 0.85;
  
  return calculateTotalCapacity(
    shelfCount,
    shelfDimensions,
    pieceSize,
    customPieceSize,
    spacing,
    utilizationRate
  );
}

/**
 * Calculate optimal shelf configuration
 * Suggests best shelf heights and spacing
 */
export interface OptimalShelfConfig {
  shelfCount: number;
  shelves: Array<{
    level: number;
    height: number;
    capacity: number;
  }>;
  totalCapacity: number;
  averageShelfHeight: number;
}

export function calculateOptimalShelfConfig(
  totalKilnHeight: number, // inches
  shelfThickness: number = 1, // inches
  minShelfHeight: number = 8, // minimum clearance between shelves
  maxShelfHeight: number = 14, // maximum clearance between shelves
  pieceHeight: number = 8 // average piece height
): OptimalShelfConfig {
  // Account for bottom and top space
  const usableHeight = totalKilnHeight - (shelfThickness * 2) - 4; // 4" for top/bottom clearance
  
  // Calculate how many shelves fit
  const shelfCount = Math.floor(usableHeight / (minShelfHeight + shelfThickness));
  
  // Calculate average shelf height
  const totalShelfThickness = shelfCount * shelfThickness;
  const totalClearance = usableHeight - totalShelfThickness;
  const averageShelfHeight = totalClearance / shelfCount;
  
  // Generate shelf configuration
  const shelves = Array.from({ length: shelfCount }, (_, i) => ({
    level: i + 1,
    height: Math.min(Math.max(averageShelfHeight, minShelfHeight), maxShelfHeight),
    capacity: 0 // Will be calculated based on piece size
  }));
  
  return {
    shelfCount,
    shelves,
    totalCapacity: 0, // Will be calculated based on piece size
    averageShelfHeight
  };
}

/**
 * Calculate energy cost per firing
 */
export function calculateFiringCost(
  kilnType: 'electric' | 'gas' | 'wood' | 'raku',
  firingDuration: number, // hours
  kilnSpecs: {
    voltage?: number;
    amperage?: number;
    power?: number; // kW for electric
    gasConsumption?: number; // cubic feet per hour for gas
    woodConsumption?: number; // cords per firing for wood
  },
  rates: {
    electricityRate?: number; // $ per kWh
    gasRate?: number; // $ per cubic foot
    woodCost?: number; // $ per cord
  }
): number {
  let cost = 0;
  
  switch (kilnType) {
    case 'electric':
      if (kilnSpecs.power && rates.electricityRate) {
        const kwh = kilnSpecs.power * firingDuration;
        cost = kwh * rates.electricityRate;
      } else if (kilnSpecs.voltage && kilnSpecs.amperage && rates.electricityRate) {
        const power = (kilnSpecs.voltage * kilnSpecs.amperage) / 1000; // kW
        const kwh = power * firingDuration;
        cost = kwh * rates.electricityRate;
      }
      break;
      
    case 'gas':
      if (kilnSpecs.gasConsumption && rates.gasRate) {
        const totalGas = kilnSpecs.gasConsumption * firingDuration;
        cost = totalGas * rates.gasRate;
      }
      break;
      
    case 'wood':
      if (kilnSpecs.woodConsumption && rates.woodCost) {
        cost = kilnSpecs.woodConsumption * rates.woodCost;
      }
      break;
      
    case 'raku':
      // Raku typically uses propane, similar to gas calculation
      if (kilnSpecs.gasConsumption && rates.gasRate) {
        const totalGas = kilnSpecs.gasConsumption * firingDuration;
        cost = totalGas * rates.gasRate;
      }
      break;
  }
  
  return cost;
}

/**
 * Calculate maintenance schedule
 */
export interface MaintenanceSchedule {
  nextMaintenance: string; // ISO date string
  maintenanceType: 'routine' | 'deep-clean' | 'inspection' | 'repair';
  daysUntil: number;
  isOverdue: boolean;
}

export function calculateNextMaintenance(
  lastMaintenance: string, // ISO date string
  maintenanceType: 'routine' | 'deep-clean' | 'inspection' | 'repair',
  intervalType: 'firings' | 'time',
  interval: number,
  currentFiringCount?: number,
  lastFiringCount?: number
): MaintenanceSchedule {
  const now = new Date();
  const lastMaintenanceDate = new Date(lastMaintenance);
  
  let nextMaintenanceDate: Date;
  let daysUntil: number;
  
  if (intervalType === 'firings' && currentFiringCount !== undefined && lastFiringCount !== undefined) {
    const firingsSince = currentFiringCount - lastFiringCount;
    const firingsUntil = interval - firingsSince;
    
    // Estimate based on average firing frequency
    // This is a simplified calculation - you'd want to use actual firing history
    const estimatedDays = firingsUntil * 7; // Assume 1 firing per week
    nextMaintenanceDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
  } else {
    // Time-based
    nextMaintenanceDate = new Date(lastMaintenanceDate.getTime() + interval * 24 * 60 * 60 * 1000);
  }
  
  daysUntil = Math.ceil((nextMaintenanceDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  const isOverdue = daysUntil < 0;
  
  return {
    nextMaintenance: nextMaintenanceDate.toISOString(),
    maintenanceType,
    daysUntil,
    isOverdue
  };
}

/**
 * Calculate kiln utilization rate
 */
export function calculateUtilizationRate(
  totalFirings: number,
  daysSinceInstall: number,
  averageFiringDuration: number, // hours
  coolingTime: number = 12 // hours
): {
  utilizationRate: number; // percentage
  firingsPerWeek: number;
  hoursInUse: number;
  hoursAvailable: number;
} {
  const totalHours = daysSinceInstall * 24;
  const totalFiringHours = totalFirings * averageFiringDuration;
  const totalCoolingHours = totalFirings * coolingTime;
  const totalCycleHours = totalFiringHours + totalCoolingHours;
  
  const utilizationRate = (totalCycleHours / totalHours) * 100;
  const firingsPerWeek = (totalFirings / daysSinceInstall) * 7;
  
  return {
    utilizationRate: Math.min(utilizationRate, 100), // Cap at 100%
    firingsPerWeek,
    hoursInUse: totalCycleHours,
    hoursAvailable: totalHours
  };
}

/**
 * Validate shelf configuration
 */
export function validateShelfConfiguration(
  shelves: Array<{ level: number; height: number; capacity: number }>,
  totalKilnHeight: number
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if shelves fit
  const totalShelfHeight = shelves.reduce((sum, shelf) => sum + shelf.height, 0);
  if (totalShelfHeight > totalKilnHeight) {
    errors.push(`Total shelf height (${totalShelfHeight}") exceeds kiln height (${totalKilnHeight}")`);
  }
  
  // Check for minimum heights
  shelves.forEach((shelf, index) => {
    if (shelf.height < 6) {
      warnings.push(`Shelf ${shelf.level} has very low clearance (${shelf.height}"). Minimum recommended is 8".`);
    }
    if (shelf.height > 16) {
      warnings.push(`Shelf ${shelf.level} has very high clearance (${shelf.height}"). This may reduce capacity.`);
    }
  });
  
  // Check for duplicate levels
  const levels = shelves.map(s => s.level);
  const uniqueLevels = new Set(levels);
  if (levels.length !== uniqueLevels.size) {
    errors.push('Duplicate shelf levels detected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

