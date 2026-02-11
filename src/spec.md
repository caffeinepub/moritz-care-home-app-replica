# Specification

## Summary
**Goal:** Show each resident’s age on the Resident Dashboard using a timezone-safe computation from the stored date of birth.

**Planned changes:**
- Update the Resident Dashboard resident cards to display an “Age” value next to the existing DOB field.
- Implement a date-only (YYYY-MM-DD) age calculation that compares year/month/day components to avoid timezone/DST day shifting.
- Add safe handling for missing or invalid DOB values so the UI shows a fallback instead of crashing.

**User-visible outcome:** On the Resident Dashboard, each resident card shows “Age: N” (whole years) calculated consistently across timezones, or “Age: —” when DOB is unavailable/invalid.
