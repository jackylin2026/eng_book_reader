# Test Report

## Feature
[spec/0001-feature-reader-e2e-coverage.md](/home/lin/ai/openai/eng_book_reader/spec/0001-feature-reader-e2e-coverage.md)

## Environment
- Framework: React + TypeScript + Vite
- E2E: Playwright
- Base URL: http://127.0.0.1:4173
- Date: 2026-03-09
- Fixtures: `ebooks/Steve Jobs.mobi`, `ebooks/Steve Jobs.azw3`

## Acceptance Criteria Coverage
| AC ID | Description | Test File | Result |
|------|-------------|-----------|--------|
| AC-1 | Playwright can target the repo MOBI and AZW3 fixtures | `e2e/smoke.spec.ts` | Pass |
| AC-2 | Importing the MOBI fixture reaches the reader | `e2e/smoke.spec.ts` | Pass |
| AC-3 | Importing the AZW3 fixture reaches reader controls | `e2e/smoke.spec.ts` | Pass |
| AC-4 | Command and result are documented with saved artifacts | `test/report.md` | Pass |

## Commands Run
```bash
npm run build
npm run test:e2e
```

## Results
- Build passed.
- Playwright rerun result with both repo fixtures: 3 passed.
- Manual browser verification confirmed `/library` load, successful MOBI import to `/reader/:bookId`, no console errors, and correct missing-book fallback on `/reader/does-not-exist`.
- The first plain `npm run test:e2e` attempt failed before navigation because Playwright's automatic `webServer` startup did not bring `http://127.0.0.1:4173` up in time. Rerunning against an explicitly started preview server passed cleanly.

## Raw Outputs
- [build.log](/home/lin/ai/openai/eng_book_reader/test/results/build.log)
- [npm-test-e2e.log](/home/lin/ai/openai/eng_book_reader/test/results/npm-test-e2e.log)
- [both-formats-e2e.log](/home/lin/ai/openai/eng_book_reader/test/results/both-formats-e2e.log)
- [both-formats-e2e-rerun.log](/home/lin/ai/openai/eng_book_reader/test/results/both-formats-e2e-rerun.log)
- [playwright-results.json](/home/lin/ai/openai/eng_book_reader/test/results/playwright-results.json)
- [manual-console.log](/home/lin/ai/openai/eng_book_reader/test/results/manual-console.log)
- [manual-network.log](/home/lin/ai/openai/eng_book_reader/test/results/manual-network.log)
- [manual-reader-snapshot.md](/home/lin/ai/openai/eng_book_reader/test/results/manual-reader-snapshot.md)
