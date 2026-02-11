# Specification

## Summary
**Goal:** Allow staff to re-activate discontinued medications and move physician signature fields to the end of the printed resident report when enabled.

**Planned changes:**
- Add a backend method to re-activate a resident medication by setting `isActive` back to `true`, using the same authorization and resident-access checks as the existing discontinue flow.
- Add a frontend React Query mutation hook to call the re-activation method and invalidate resident/medication queries so the UI updates immediately.
- Add a “Re-activate” action on each discontinued medication (visible only to users who can edit) with an English confirmation prompt, moving the medication back into the active/current list after success.
- Update the print report so that when the physician signature toggle is ON, “Physician Name” and “Physician Signature” render after the medication sections with an appropriate print page break; when OFF, no physician signature fields render anywhere.

**User-visible outcome:** Authorized users can re-activate discontinued medications from the discontinued list, and printed reports place physician name/signature at the end of the report only when the toggle is enabled.
