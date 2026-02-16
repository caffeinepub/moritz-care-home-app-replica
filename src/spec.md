# Specification

## Summary
**Goal:** Add a Settings toggle to switch resident profile editing screens between solid white and solid black backgrounds, ensuring all edit-form text and controls remain readable in both modes.

**Planned changes:**
- Extend backend display preferences to include a resident profile editor background mode field (solid white / solid black), returned by getAppSettings and persisted via updateDisplayPreferences (with a sensible default when unset).
- If needed, update backend migration handling so upgrades yield a deterministic default for the new display preference field.
- Add a clearly labeled (English) Display Preferences control on the Settings page for the editor background mode, integrated with the existing Save Changes behavior and persisted on reload.
- Apply the selected background mode to resident profile editing UI (modal and edit/add pages) and adjust form/control styling (text, labels, inputs, selects, textareas) to maintain strong contrast in both modes without changing the rest of the app’s theme.

**User-visible outcome:** Users can choose solid white or solid black background for resident profile editing screens from Settings, save it, and see all resident profile edit modals/pages render with readable, high-contrast form UI in the selected mode.
