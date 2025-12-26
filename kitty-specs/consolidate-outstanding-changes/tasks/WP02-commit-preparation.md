---
work_package_id: 'WP02'
subtasks:
  - 'T013'
  - 'T014'
  - 'T015'
  - 'T016'
  - 'T017'
  - 'T018'
  - 'T019'
  - 'T020'
title: 'Commit Preparation'
phase: 'Phase 2 - Commit Organization'
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

# Work Package Prompt: WP02 – Commit Preparation

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

- Changes organized into logical commit groups.
- Commits created for each group.

## Context & Constraints

- Reference plan.md Phase 2: Commit Organization.
- Group files as per research.md.

## Subtasks & Detailed Guidance

### Subtask T013 – Prepare UI/UX enhancements commit group

- **Purpose**: Group UI changes.
- **Steps**: Identify files: check-in-out, pos, calendar, sidebar, dashboard.
- **Files**: app/(dashboard)/properties/[id]/check-in-out/, app/(dashboard)/properties/[id]/pos/, etc.
- **Parallel?**: No.
- **Notes**: List files for commit.

### Subtask T014 – Create UI/UX commit

- **Purpose**: Commit UI changes.
- **Steps**: git add <files>, git commit -m "UI/UX enhancements".
- **Files**: UI files.
- **Parallel?**: No.
- **Notes**: Specific message.

### Subtask T015 – Prepare documentation updates commit group

- **Purpose**: Group doc changes.
- **Steps**: Identify doc files: README, AGENTS, marketing docs, etc.
- **Files**: docs/, \*.md files.
- **Parallel?**: No.
- **Notes**: List docs.

### Subtask T016 – Create documentation commit

- **Purpose**: Commit docs.
- **Steps**: git add <docs>, git commit -m "Documentation updates".
- **Files**: Doc files.
- **Parallel?**: No.
- **Notes**: Message.

### Subtask T017 – Prepare configuration & infrastructure commit group

- **Purpose**: Group config changes.
- **Steps**: Identify: playwright.config, docker-compose, .gitignore, workflows.
- **Files**: Config files.
- **Parallel?**: No.
- **Notes**: List.

### Subtask T018 – Create configuration commit

- **Purpose**: Commit configs.
- **Steps**: git add <configs>, git commit -m "Configuration updates".
- **Files**: Config files.
- **Parallel?**: No.
- **Notes**: Message.

### Subtask T019 – Prepare database & testing commit group

- **Purpose**: Group db/test changes.
- **Steps**: Identify: prisma/schema, seed, test configs.
- **Files**: prisma/, test files.
- **Parallel?**: No.
- **Notes**: List.

### Subtask T020 – Create database/testing commit

- **Purpose**: Commit db/tests.
- **Steps**: git add <files>, git commit -m "Database and testing updates".
- **Files**: Db/test files.
- **Parallel?**: No.
- **Notes**: Message.

## Risks & Mitigations

- Conflicts between groups; ensure distinct.

## Definition of Done Checklist

- [ ] All subtasks completed
- [ ] Commits created

## Review Guidance

- Check commit messages and groupings.

## Activity Log

- 2025-12-26 – system – lane=planned – Prompt created.

---

### Updating Metadata When Changing Lanes

**Always use the move command:**

```bash
python3 .kittify/scripts/tasks/tasks_cli.py move consolidate-outstanding-changes WP02 <lane> --note "Your note"
```
