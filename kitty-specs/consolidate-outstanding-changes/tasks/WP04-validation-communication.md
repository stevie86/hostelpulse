---
work_package_id: 'WP04'
subtasks:
  - 'T027'
  - 'T028'
title: 'Validation & Communication'
phase: 'Phase 4 - Validation & Monitoring'
lane: 'planned'
assignee: ''
agent: ''
shell_pid: ''
review_status: ''
reviewed_by: ''
history:
  - timestamp: '2025-12-26'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via tasks generation'
---

# Work Package Prompt: WP04 – Validation & Communication

## ⚠️ IMPORTANT: Review Feedback Status

**Read this first if you are implementing this task!**

- **Has review feedback?**: Check the `review_status` field above. If it says `has_feedback`, scroll to the **Review Feedback** section immediately (right below this notice).
- **You must address all feedback** before your work is complete. Feedback items are your implementation TODO list.
- **Mark as acknowledged**: When you understand the feedback and begin addressing it, update `review_status: acknowledged` in the frontmatter.
- **Report progress**: As you address each feedback item, update the Activity Log explaining what you changed.

---

## Review Feedback

_[This section is empty initially.]_

---

## Markdown Formatting

Wrap HTML/XML tags in backticks, use language identifiers.

---

## Objectives & Success Criteria

- Deployment validated, stakeholders communicated.

## Context & Constraints

- Reference plan.md Phase 4: Validation & Monitoring.

## Subtasks & Detailed Guidance

### Subtask T027 – Post-deployment validation

- **Purpose**: Ensure production works.
- **Steps**: Test functionality, performance, UI.
- **Files**: N/A
- **Parallel?**: No.
- **Notes**: Check load times, touch interfaces.

### Subtask T028 – Stakeholder communication

- **Purpose**: Notify stakeholders.
- **Steps**: Send updates to investors, partners, team.
- **Files**: N/A
- **Parallel?**: No.
- **Notes**: Progress summaries.

## Risks & Mitigations

- Issues in production; rollback plan.

## Definition of Done Checklist

- [ ] All subtasks completed
- [ ] Validation passed

## Review Guidance

- Confirm communications sent.

## Activity Log

- 2025-12-26 – system – lane=planned – Prompt created.

---

### Updating Metadata When Changing Lanes

**Always use the move command:**

```bash
python3 .kittify/scripts/tasks/tasks_cli.py move consolidate-outstanding-changes WP04 <lane> --note "Your note"
```
