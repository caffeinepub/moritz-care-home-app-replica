# Specification

## Summary
**Goal:** Remove all transparency/glass effects from dialogs, dropdowns, and selection menus so these surfaces render as fully opaque solid white across the app.

**Planned changes:**
- Update dialog/modal surfaces so every DialogContent uses an opaque solid white background (no alpha backgrounds, no blur, no opacity < 1) in both light and dark modes.
- Update dropdown/select/popover menu surfaces so all menu content panels render with an opaque solid white background (no translucency or backdrop blur).
- Add global styling safeguards (without editing `frontend/src/components/ui/*`) to prevent future dialog/dropdown/select/popover surfaces from becoming transparent due to theme/component defaults.

**User-visible outcome:** All pop-up dialogs and all dropdown/selection menus consistently appear with solid white, fully opaque backgrounds, improving readability and eliminating transparency effects.
