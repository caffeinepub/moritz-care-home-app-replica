# Specification

## Summary
**Goal:** When the “Show Physician Signature Fields” toggle is ON, add writable underline lines for Physician Name, Physician Signature, and Date in the printed report’s final-page physician signature section.

**Planned changes:**
- Update the print report final-page physician signature section to render three labeled fields exactly: “Physician Name:”, “Physician Signature:”, and “Date:”.
- Add an underline line after each label, matching the existing print signature line style, sized for handwriting on a printed page.
- Ensure the physician signature section remains hidden when the toggle is OFF (no change to toggle behavior beyond adding the Date field).

**User-visible outcome:** With the toggle ON, the printed report includes three labeled handwriting lines for Physician Name, Physician Signature, and Date; with the toggle OFF, the physician signature section is not shown.
