# Specification

## Summary
**Goal:** Add dedicated Resident Profile sidebar sections for Responsible Persons, Pharmacy, Insurance, and Physician information, each supporting multi-entry add/edit flows.

**Planned changes:**
- Update the Resident Profile page to include a left sidebar/navigation with tabs for Responsible Persons, Pharmacy Information, Insurance Information, and Physician Information, switching content while staying in the same resident context.
- Add list/table views within each new section to display multiple entries for the current resident.
- Implement separate add and edit screens (solid white background) for Responsible Persons with fields: Name, Relationship, Phone Number, Fax Number.
- Implement separate add and edit screens (solid white background) for Pharmacy Information with fields: Pharmacy Name, Address, Phone Number, Fax Number.
- Implement separate add and edit screens (solid white background) for Insurance Information with fields: Insurance Name, Policy Number, Medicare ID Number, Medicaid ID Number.
- Implement Physician Information section with separate add/edit screens (solid white background) using the existing backend physician data shape (name, specialty, contact info).
- Update backend resident data model and APIs to support multiple pharmacy and insurance entries with stable entry IDs for reliable editing.
- Add upgrade-safe backend state migration so existing single-record pharmacy/insurance data and existing responsible contacts/persons data are preserved and mapped into the new multi-entry structures.
- Apply styling so the new sidebar and screens are visually consistent with the existing app theme, keeping form areas on solid white backgrounds.

**User-visible outcome:** Within a resident’s profile, users can navigate via a sidebar to Responsible Persons, Pharmacy, Insurance, and Physician sections, view multiple saved entries, and add or edit entries using dedicated solid-white form screens without leaving the resident profile context.
