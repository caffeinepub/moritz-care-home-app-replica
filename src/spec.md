# Specification

## Summary
**Goal:** Add a PRN (as-needed) flag to medications, persist it in the backend, and update the UI to capture, edit, and display PRN medications appropriately.

**Planned changes:**
- Backend: add a boolean PRN field to the Medication model, persist it on add/update, return it in medication read operations, and default to `false` when not provided.
- Frontend: Add Medication modal: add a PRN checkbox next to the Administration Times label; when checked, hide/disable time inputs and suppress related required validation; submit PRN to backend.
- Frontend: Edit Medication modal: show and allow editing the PRN checkbox with the same hide/disable and validation behavior; initialize from existing medication PRN value; persist on save.
- Frontend: medications list: label PRN medications and do not display administration times when PRN is true.

**User-visible outcome:** Users can mark a medication as PRN when adding/editing it; PRN medications won’t require or show administration times, will be labeled as PRN in lists, and the PRN setting is saved and loaded consistently.
