# QA Workflow: Ensuring Code Correctness

To guarantee that every coding task is syntactically correct, type-safe, and functional, follow this strict loop for **every single task**.

## The Loop: "Build-Verify-Commit"

For each task in `plan.md`:

1.  **Implement**: Write the code.
2.  **Lint & Format**:
    ```bash
    mise exec -- pnpm run lint --fix
    mise exec -- pnpm run format
    ```
    *Stop if errors. Fix them.*
3.  **Type Check**:
    ```bash
    mise exec -- pnpm run type-check
    ```
    *Stop if errors. Fix them.*
4.  **Verify (Build)**:
    ```bash
    mise exec -- pnpm run build
    ```
    *Stop if errors. This confirms strict adherence to Next.js constraints.*
5.  **Test (Unit)** (If logic changed):
    ```bash
    mise exec -- pnpm run test
    ```
6.  **Commit**:
    ```bash
    git add .
    git commit -m "feat(scope): implementation details"
    ```

## Automation

*   **Pre-commit Hooks**: `husky` is configured to run lint/type-check automatically on commit.
*   **CI/CD**: GitHub Actions runs the full suite on every push.

## Role of Agents

*   **Builder (You/AI)**: MUST run Steps 2-4 locally before saying "Task Complete".
*   **Architect (Me)**: Will refuse to mark a spec as "Merged" until the CI pipeline is green.
