# Specification

## Summary
**Goal:** Show discontinued medications on resident medication lists in a separate, clearly labeled section/table instead of using crossed-out styling.

**Planned changes:**
- Update the resident medications view to split medications into two labeled sections/tables: active (isActive=true) and discontinued (isActive=false), with discontinued items view-only.
- Update the Resident Profile page’s Medications tab to also display discontinued medications in a separate section/table alongside the active list.
- Add an appropriate hidden/empty-state behavior for the discontinued section when there are no discontinued medications.

**User-visible outcome:** Residents’ medication lists clearly separate current/active medications from discontinued medications on the same screen, without strikethrough styling; discontinued medications can be viewed but not edited/discontinued.
