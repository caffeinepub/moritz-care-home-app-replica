# Specification

## Summary
**Goal:** Add a Resident “Code Status” (Full Code / DNR) field and surface it prominently on the Residents Dashboard and Resident Profile.

**Planned changes:**
- Add a persistent Code Status field to each Resident record with exactly two allowed values: “Full Code” and “DNR”.
- Add an upgrade-safe migration so existing residents default to Code Status = “Full Code”.
- Update “Add New Resident” and “Edit Resident” flows to require/select Code Status (Full Code / DNR) and persist changes.
- Display Code Status on each resident card in the Residents Dashboard with bold styling and stronger visual highlighting for “DNR” than “Full Code”.
- Display Code Status on the Resident Profile page with the exact text “Full Code” or “DNR”.

**User-visible outcome:** Staff/admin users can set or change a resident’s Code Status (Full Code or DNR) when adding/editing residents, and everyone can clearly see the current Code Status on the dashboard and the resident’s profile, with DNR more strongly highlighted.
