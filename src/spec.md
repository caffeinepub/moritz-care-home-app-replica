# Specification

## Summary
**Goal:** Add a per-user setting to show or hide the “Resident Profile Report” feature on the Resident Profile page.

**Planned changes:**
- Add a Settings UI entry with an English-labeled toggle controlling visibility of the Resident Profile Report feature.
- Persist the toggle state per signed-in user in the backend user profile data and load it on sign-in/reload (default ON for new users to keep current behavior).
- Update the Resident Profile page to conditionally hide the “Print Profile” action and the print-only report content (ResidentProfilePrintReport) when the setting is OFF, without changing any other sections/tabs.

**User-visible outcome:** Users can open Settings and turn the Resident Profile Report feature on or off; when off, the Resident Profile page no longer shows “Print Profile” and printing won’t include the ResidentProfilePrintReport content.
