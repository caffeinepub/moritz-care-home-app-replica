# Specification

## Summary
**Goal:** Let users optionally include blank “Physician’s Name” and “Physician’s Signature” fields when printing a Resident Profile report.

**Planned changes:**
- Add a clearly labeled, screen-only toggle on the Resident Profile page header near the existing Print action to control inclusion of physician name/signature blank fields in the printout.
- Pass the toggle state into the Resident Profile print report component and conditionally render a dedicated physician name/signature section only when enabled.
- Add/adjust print-only CSS (under the existing `@media print` section) to ensure the blank lines print reliably without affecting existing print styling.

**User-visible outcome:** On the Resident Profile page, users can switch a toggle before printing to include or exclude writable blank lines for “Physician’s Name” and “Physician’s Signature” on the printed Resident Profile Report; the Print button behavior remains the same.
