import type { UserProfile } from '../../backend';
import { UserType } from '../../backend';

export function isStaffOrAdmin(userProfile: UserProfile | null | undefined, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  if (!userProfile) return false;
  return userProfile.userType === UserType.staff;
}

export function canAccessResident(
  userProfile: UserProfile | null | undefined,
  isAdmin: boolean,
  residentId: bigint
): boolean {
  if (isStaffOrAdmin(userProfile, isAdmin)) return true;
  if (!userProfile) return false;
  return userProfile.relatedResidentIds.some(id => id === residentId);
}

export function canListAllResidents(userProfile: UserProfile | null | undefined, isAdmin: boolean): boolean {
  return isStaffOrAdmin(userProfile, isAdmin);
}

export function canWriteClinicalData(userProfile: UserProfile | null | undefined, isAdmin: boolean): boolean {
  return isStaffOrAdmin(userProfile, isAdmin);
}

export function getUserTypeLabel(userType: UserType): string {
  switch (userType) {
    case UserType.staff:
      return 'Staff';
    case UserType.resident:
      return 'Resident';
    case UserType.familyMember:
      return 'Family Member';
    default:
      return 'Unknown';
  }
}
