# Summary — Agents Guide and Jest Setup

Date: 2025-09-14

## What was requested
Create a concise contributor guide (`AGENTS.md`) and add a basic Jest testing setup with an example test.

## Actions taken
- Wrote `AGENTS.md` tailored to this Next.js + TypeScript repo (structure, scripts, style, testing, PR, and security tips).
- Added Jest configuration via `next/jest` and jsdom environment.
- Created style/asset mocks and an example unit test for `utils/formatDate`.
- Updated npm scripts to run tests and coverage.

## Findings / decisions
- No existing test runner; introduced Jest 29 with minimal config suitable for both utils and component tests.
- Kept changes small and in line with repo conventions (pages router, styled-components, 2-space indent).

## Code changes
- Added: `AGENTS.md`.
- Added: `jest.config.js`.
- Added: `test/__mocks__/styleMock.js`, `test/__mocks__/fileMock.js`.
- Added: `__tests__/formatDate.test.ts` (covers valid/invalid date cases).
- Updated: `package.json` scripts (`test`, `test:watch`, `test:coverage`) and devDependencies (`jest`, `@types/jest`, `jest-environment-jsdom`).

## Next steps / recommendations
- Install dev deps: `npm i -D jest@^29 @types/jest@^29 jest-environment-jsdom@^29`.
- Run tests: `npm test` or `npm run test:coverage`.
- Add tests for `utils/csv.ts` and any new hooks/components.

