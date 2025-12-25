# Task 4: Integrate recording in tests

## Description

Add screen recording start/stop logic to key Playwright test files.

## Steps

1. Identify critical test files (login, booking, room management)
2. Add recorder import and initialization
3. Wrap test execution with startRecording() and stopRecording()
4. Ensure recordings save to videos directory

## Acceptance Criteria

- Selected tests generate video files
- Recordings capture full test execution
- No test failures due to recording

## Notes

Start with 2-3 key tests to validate the integration before expanding.
