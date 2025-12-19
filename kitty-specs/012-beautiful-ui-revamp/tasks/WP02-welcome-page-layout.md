---
work_package_id: "WP02"
title: "Welcome page layout + demo data"
lane: "done"
subtasks:
  - "T003"
  - "T004"
phase: "Phase 2 - Welcome Page"
assignee: "user"
agent: "Gemini"
shell_pid: "8081"
review_status: "approved"
reviewed_by: "user"
history:
  - timestamp: "2025-12-19T00:00:00Z"
    lane: "planned"
    agent: "system"
    action: "Prompt generated via manual task creation"
  - timestamp: "2025-12-19T10:30:00Z"
    lane: "doing"
    agent: "Gemini"
    action: "Implementation started"
  - timestamp: "2025-12-19T11:00:00Z"
    lane: "done"
    agent: "Gemini"
    action: "Implementation completed and verified"
---

# Work Package Prompt: WP02 – Welcome page layout + demo data

## Goal
Implement the welcome page UI to match the screenshot, including the demo hostel details and room cards.

## Tasks
- T003: Replace redirect-only `app/page.tsx` with the new welcome page layout.
- T004: Add static demo data (8 rooms, 5 bookings) for the page display.

## Notes
- Keep DaisyUI/Tailwind.
- No DB or server action changes.
