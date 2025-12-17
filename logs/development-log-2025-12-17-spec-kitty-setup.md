# Development Log - 2025-12-17

## Architecture Update: Adopting Spec-Driven Development

**Decision:**
To support the "Clean Slate" / "Operation Bedrock" strategy, we have integrated `spec-kitty` to enforce strict focus and prevent scope creep.

**Tooling:**
- **Tool:** `spec-kitty` (Fork of GitHub Spec Kit)
- **Method:** Installed in a local Python virtual environment (`.venv-speckitty`) managed via `npm run spec`.
- **Integration:** Configured for Codex and Gemini interaction.
- **Safety:** Explicitly ignored in `.gitignore` and `.vercelignore` to prevent production pollution.

**Workflow:**
1.  **Define:** `npm run spec -- specify "Feature Name"`
2.  **Implement:** `npm run spec -- implement`
3.  **Review:** `npm run spec -- review`

**Context:**
This tool isolates features into git worktrees, ensuring that when we work on "Room Management," we cannot accidentally break "Authentication." It aligns perfectly with the goal of restoring features incrementally and safely.

## Conversation Log

**User:** "Research the usefulness of a tool like https://github.com/Priivacy-ai/spec-kitty for my project, can it be helpful to maintain focus?"
**Gemini:** Researched the tool. Confirmed it is highly effective for maintaining focus and enforcing the "Clean Slate" discipline. Recommended adoption.

**User:** "Help me to maintain it in its own pythonenv."
**Gemini:** Created a dedicated `.venv-speckitty` virtual environment and installed `spec-kitty-cli`.

**User:** "Pls streamline pythonenv control with npm tools."
**Gemini:** Added `spec` and `spec:setup` scripts to `package.json` to abstract away the virtual environment management.

**User:** "Is this the right way to do it? Shouldn't we put it in a subdir?"
**Gemini:** Advised keeping it in the root for proper Git and Project context integration, but ensured it is "invisible" to Vercel via ignore files.

**User:** "Yes and configure it to interface with codex and gemini."
**Gemini:** Initialized the project with `--ai codex,gemini`. The tool is now live.
