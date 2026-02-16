import { Resident, ResidentStatus } from '../backend';

/**
 * Numeric-aware room number comparison.
 * Handles room numbers like "101", "102A", "12", etc.
 */
function compareRoomNumbers(a: string, b: string): number {
  // Extract numeric prefix and suffix
  const aMatch = a.match(/^(\d+)(.*)$/);
  const bMatch = b.match(/^(\d+)(.*)$/);

  if (!aMatch || !bMatch) {
    // Fallback to string comparison if no numeric prefix
    return a.localeCompare(b);
  }

  const aNum = parseInt(aMatch[1], 10);
  const bNum = parseInt(bMatch[1], 10);

  if (aNum !== bNum) {
    return aNum - bNum;
  }

  // If numeric parts are equal, compare suffixes
  return aMatch[2].localeCompare(bMatch[2]);
}

/**
 * Compare residents by name (lastName, then firstName).
 */
function compareByName(a: Resident, b: Resident): number {
  const lastNameCmp = a.lastName.localeCompare(b.lastName);
  if (lastNameCmp !== 0) return lastNameCmp;
  return a.firstName.localeCompare(b.firstName);
}

/**
 * Compare residents by status with deterministic tie-breaker.
 * Active comes before Discharged, with name as tie-breaker.
 */
function compareByStatus(a: Resident, b: Resident): number {
  // Active (0) comes before Discharged (1)
  const statusOrder = { [ResidentStatus.active]: 0, [ResidentStatus.discharged]: 1 };
  const aOrder = statusOrder[a.status];
  const bOrder = statusOrder[b.status];

  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  // Tie-breaker: use name
  return compareByName(a, b);
}

export type SecondarySortOption = 'none' | 'name' | 'status';

/**
 * Sort residents with room number as primary key and optional secondary sort.
 * Always sorts by room number first, then applies secondary sort for equal room numbers.
 */
export function sortResidents(
  residents: Resident[],
  secondarySort: SecondarySortOption = 'none'
): Resident[] {
  return [...residents].sort((a, b) => {
    // Primary sort: always by room number
    const roomCmp = compareRoomNumbers(a.roomNumber, b.roomNumber);
    if (roomCmp !== 0) return roomCmp;

    // Secondary sort: only applies when room numbers are equal
    switch (secondarySort) {
      case 'name':
        return compareByName(a, b);
      case 'status':
        return compareByStatus(a, b);
      case 'none':
      default:
        // No secondary sort, maintain original order (stable sort)
        return 0;
    }
  });
}
