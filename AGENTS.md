We are working in a React + TypeScript + Vite repository.

Follow this workflow strictly.

STAGE A — Planning
1. Read the existing codebase.
2. Produce a concise implementation plan.
3. Produce acceptance criteria.
4. Produce a test plan that maps each acceptance criterion to at least one Playwright test.

STAGE B — Specification
5. Create and switch to a branch named codex/feature-<slug>.
6. Create spec/0001-feature-<slug>.md with:
   - summary
   - user stories
   - UI/UX notes
   - technical design
   - acceptance criteria
   - test mapping table
   - decision log
7. Stop and wait for approval before changing code.

STAGE C — Implementation
8. Implement the approved spec.
9. Start the app locally.
10. Use MCP browser tools to explore the feature manually:
    - confirm page loads
    - exercise happy path
    - check console errors
    - inspect failed UI states
11. Convert the explored scenarios into Playwright tests under e2e/.
12. Run Playwright tests and fix failures.
13. Update README.md with user instructions.
14. Write test/report.md and save raw outputs under test/results/.

STAGE D — Review
15. Wait for my review.
16. If I request changes, update spec if requirements changed, otherwise update code/tests/docs only.

STAGE E — Repo
17. After approval:
    - git add -A
    - git commit
    - git push -u origin HEAD
    - create a PR with gh pr create