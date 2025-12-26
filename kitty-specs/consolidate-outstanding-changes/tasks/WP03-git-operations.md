---
work_package_id: 'WP03'
subtasks:
  - 'T021'
  - 'T022'
  - 'T023'
  - 'T024'
  - 'T025'
  - 'T026'
title: 'Git Operations'
phase: 'Phase 3 - Git Operations & Deployment'
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

# Work Package Prompt: WP03 – Git Operations

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

- Changes committed, pushed, PR created, deployment prepared.

## Context & Constraints

- Reference plan.md Phase 3: Git Operations & Deployment.

## Subtasks & Detailed Guidance

### Subtask T021 – Create feature branch

- **Purpose**: Ensure on correct branch.
- **Steps**: git checkout -b feature/consolidate-changes (if not already).
- **Files**: N/A
- **Parallel?**: No.
- **Notes**: Check current branch.

### Subtask T022 – Add all changes to staging

- **Purpose**: Stage changes.
- **Steps**: git add -A
- **Files**: All modified.
- **Parallel?**: No.
- **Notes**: Or selective if separate commits.

### Subtask T023 – Create comprehensive commit

- **Purpose**: Commit all changes.
- **Steps**: git commit -m "feat: consolidate outstanding UI/UX and documentation improvements..."
- **Files**: All.
- **Parallel?**: No.
- **Notes**: Use the long message from plan.md.

### Subtask T024 – Push to GitHub

- **Purpose**: Push branch.
- **Steps**: git push origin feature/consolidate-changes
- **Files**: N/A
- **Parallel?**: No.
- **Notes**: Set upstream if needed.

### Subtask T025 – Create pull request

- **Purpose**: Create PR.
- **Steps**: Use gh pr create with title and body.
- **Files**: N/A
- **Parallel?**: No.
- **Notes**: Detailed description.

### Subtask T026 – Prepare deployment

- **Purpose**: Setup for deployment.
- **Steps**: Prepare manual deployment or wait for PAT.
- **Files**: N/A
- **Parallel?**: No.
- **Notes**: Vercel setup.

## Risks & Mitigations

- Push failures; check permissions.

## Definition of Done Checklist

- [ ] All subtasks completed
- [ ] PR created

## Review Guidance

- Check PR content.

## Activity Log

- 2025-12-26 – system – lane=planned – Prompt created.

---

### Updating Metadata When Changing Lanes

**Always use the move command:**

```bash
python3 .kittify/scripts/tasks/tasks_cli.py move consolidate-outstanding-changes WP03 <lane> --note "Your note"
```
