# Feature Spec: MOBI And AZW3 Import E2E Coverage

## Summary
Exercise the existing end-to-end flow against the real MOBI and AZW3 ebook fixtures in `ebooks/`. The test flow should validate library import and basic reader access for real `.mobi` and `.azw3` files from the repository.

## User Stories
- As a developer, I can run Playwright against the real MOBI and AZW3 fixtures under `ebooks/` and verify both import paths still work.
- As a developer, I can verify that each imported book appears in the library and opens in the reader.
- As a developer, I can catch regressions in the basic happy path for MOBI and AZW3 parsing and reader entry.

## UI/UX Notes
- No intentional end-user UI redesign is required.
- No visible product changes are required unless test stability exposes a gap in current selectors or copy.
- Error handling during import should remain user-readable if the fixture fails to parse.

## Technical Design
- Use the repository fixtures `ebooks/Steve Jobs.mobi` and `ebooks/Steve Jobs.azw3` as the Playwright upload targets.
- Remove or reduce manual setup friction around the existing smoke test flow so both import scenarios are easy to run locally.
- Keep the test focused on the real import path, not mocked IndexedDB state.
- Keep production behavior unchanged unless a small testability seam is required.

## Acceptance Criteria
- AC-1: A Playwright test run can target `ebooks/Steve Jobs.mobi` and `ebooks/Steve Jobs.azw3` without requiring the user to locate separate external files.
- AC-2: The browser flow imports the MOBI file from the library page and reaches the reader for the imported book.
- AC-3: The browser flow imports the AZW3 file from the library page and reaches reader controls for the imported book.
- AC-4: Test documentation records the exact command and result for the combined MOBI and AZW3 fixture run.

## Test Mapping
| AC ID | Description | Planned Playwright Coverage |
|------|-------------|-----------------------------|
| AC-1 | Test run targets the repo MOBI and AZW3 fixtures | `e2e/smoke.spec.ts` uses `ebooks/Steve Jobs.mobi` and `ebooks/Steve Jobs.azw3` via default fixture wiring |
| AC-2 | Import reaches the reader | Test: upload the MOBI file from `/library` and assert `Back to library` in the reader |
| AC-3 | Reader controls are visible after AZW3 import | Test: upload the AZW3 file from `/library` and assert `Pagination` after import completes |
| AC-4 | Test command/result are documented | `test/report.md` records the executed command and result; raw artifacts are saved under `test/results/` |

## Decision Log
- Decision: Update the scope from a real-file MOBI flow to combined MOBI and AZW3 flows because the user confirmed both fixtures are present in `ebooks/`.
- Decision: Reuse the existing Playwright import smoke path where possible instead of introducing a broader new E2E architecture.
- Decision: Keep scope limited to real MOBI and AZW3 import plus basic reader entry, not a full regression matrix.
