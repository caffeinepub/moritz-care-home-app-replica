/**
 * Shared administration routes for medications
 * Single source of truth for all medication administration route options
 */

export const ADMINISTRATION_ROUTES = [
  'Oral',
  'IV',
  'IM',
  'Subcutaneous',
  'Topical',
  'Rectal',
  'Inhalation',
  'Sublingual',
  'Transdermal',
  'Ophthalmic',
  'Otic',
  'Nasal',
  'Intrathecal',
] as const;

export type AdministrationRoute = typeof ADMINISTRATION_ROUTES[number];

/**
 * Ensures a route value can be displayed in a Select component
 * If the current value is not in the standard list, it will be included
 */
export function getRouteOptions(currentValue?: string): string[] {
  const routes: string[] = [...ADMINISTRATION_ROUTES];
  
  // If current value exists and is not in the standard list, add it
  if (currentValue && !routes.includes(currentValue)) {
    routes.push(currentValue);
  }
  
  return routes;
}
