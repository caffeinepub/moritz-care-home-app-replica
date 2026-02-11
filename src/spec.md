# Specification

## Summary
**Goal:** Fix the recurring “Unable to Initialize” boot failure after login so authenticated users can reliably complete actor initialization and initial profile fetch without needing a URL admin token.

**Planned changes:**
- Backend: Adjust authorization/access-control flow so newly authenticated principals can call `getCallerUserProfile` (returning `null` for new users) and `saveCallerUserProfile` during initial setup without requiring a `caffeineAdminToken`.
- Backend: Ensure boot-critical calls do not fail due to missing access-control initialization; add a minimal backend-side mechanism to allow authenticated boot/profile setup.
- Frontend: Update boot logic (App.tsx) and BootErrorScreen to distinguish actor initialization failures vs profile fetch failures and show a concise English error detail (collapsible/secondary section).
- Frontend: Add a “Retry” action on the boot error screen that re-attempts boot without logging out, while preserving the existing “Log Out and Try Again” behavior.
- Frontend: Prevent persistent boot failure due to stale React Query error caching by properly resetting/invalidating actor and `currentUserProfile` queries on retry and identity changes.

**User-visible outcome:** After logging in with Internet Identity, users proceed to the dashboard or profile setup instead of repeatedly seeing “Unable to Initialize,” and if boot fails, they can retry without logging out and see clearer error details.
