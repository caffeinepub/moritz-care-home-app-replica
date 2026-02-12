# Specification

## Summary
**Goal:** Promote Draft Version 27 to Production as release name “Moritz Care Home” without introducing any code changes and while preserving existing backend canister state/data.

**Planned changes:**
- Promote (release-only) Draft Version 27 build artifacts to the Production environment with the production release name exactly set to “Moritz Care Home”.
- Add a new release promotion Markdown document under `frontend/docs/release/`, modeled after `frontend/docs/release/promote-v22-to-production.md`, updated for Draft Version 27 and “Moritz Care Home”, including: pre-promotion checklist, promotion steps, post-promotion verification checklist, rollback plan, and post-deployment notes section.

**User-visible outcome:** The Production environment runs Draft Version 27 as “Moritz Care Home” with existing data preserved, and there is internal documentation describing how the promotion was performed and how to verify/rollback.
