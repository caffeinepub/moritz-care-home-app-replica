# Specification

## Summary
**Goal:** Add a print-only, document-style Resident Profile Report that matches the uploaded print reference (print.JPG) while keeping the existing on-screen resident profile UI unchanged.

**Planned changes:**
- Implement a dedicated print-only Resident Profile Report layout with multi-page structure, matching the reference for header (date/time, app name, page indicator), title block (facility name + “Resident Profile Report”), section typography, spacing, dividers, and table styling.
- Update the existing ResidentProfilePage Print action to print the new report layout (print-only) while preserving the current on-screen cards/tabs view.
- Extend print CSS for document printing (A4/Letter margins/scale, print-safe colors, table borders/header backgrounds, and controlled page breaks that avoid awkward section splitting).
- Render required report sections in document format: Resident Information, Insurance Information, Active Medications (bordered table), Discontinued Medications (table/list or “No discontinued medications”), Assigned Physicians, Pharmacy Information, and Responsible Contacts, using existing data sources and displaying “N/A” for missing fields.
- Ensure all navigation/UI controls remain hidden in print (no-print behavior preserved) and avoid impacting printing elsewhere in the app.

**User-visible outcome:** Clicking “Print” from a resident profile produces a clean, multi-page Resident Profile Report matching the reference layout, with consistent headers and readable sections/tables, while the normal on-screen profile experience remains the same.
