# Specification

## Summary
**Goal:** Prevent the production app from hanging on the loading screen when `caffeineAdminToken` is missing/empty by ensuring `_initializeAccessControlWithSecret` returns promptly and does not block actor initialization.

**Planned changes:**
- Update the backend `_initializeAccessControlWithSecret` call path to quickly no-op/return when the provided secret token is missing or an empty string, avoiding any indefinite await or blocking initialization.
- Preserve authorization safety: ensure empty/invalid tokens do not grant admin privileges and do not weaken existing authorization checks, while valid tokens continue to initialize admin access as in draft.

**User-visible outcome:** Production builds load past the global loading spinner even when no `caffeineAdminToken` is present in the URL; draft behavior remains unchanged when a valid token is provided.
