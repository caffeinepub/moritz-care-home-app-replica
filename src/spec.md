# Specification

## Summary
**Goal:** Adjust the “Show Physician Signature Fields” toggle on the Resident Profile page so only the switch knob (thumb) changes color based on on/off state.

**Planned changes:**
- Update styling for the Resident Profile page’s “Show Physician Signature Fields” switch so the thumb is green when OFF/unchecked and white when ON/checked.
- Apply the styling via `className` and/or global CSS selectors without modifying any files under `frontend/src/components/ui`.
- Ensure the label/text styling remains unchanged between toggle states, and avoid affecting other toggles in the app.

**User-visible outcome:** On the Resident Profile page, the “Show Physician Signature Fields” switch knob appears green when off and white when on, with no change to the label styling.
