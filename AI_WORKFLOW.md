# AI Workflow Documentation

## Tools Used

- Claude Code (CLI) - main thread work
- [Cursor IDE] - small fixes

## AI-Assisted Parts
Check which parts were created with AI assistance:

- [x] Project setup / boilerplate
- [x] TypeScript types/interfaces
- [x] TanStack Query state management logic
- [x] Mock WebSocket implementation
- [x] UI components
- [x] Tests
- [x] Theme configuration
- [x] Error boundaries
- [x] Documentation (README)

## Example Prompts (2-3 examples)

### Prompt 1:
**Prompt:** "You are a Frontend/Tech Lead. Your task is to draw up a detailed implementation plan based on the attached PDF with specifications (“VR-Frontend Developer Test Assignment-050126-180630.pdf”).

IMPORTANT:
- First, extract and structure the requirements from the PDF. Do not invent anything.
- All “Bonus Points” items from the PDF must be included in the plan (as separate tasks/subtasks) and marked ✅ BONUS.
- If there are ambiguities in the PDF, formulate assumptions explicitly (Assumption) and add a question to ask the customer.
- The conclusion should be practical: so that tasks can be immediately created in Jira/Linear based on it.
  INPUT DATA:
- PDF: (attached to this chat)
- Technology stack: if not specified in the PDF or package.json, suggest 2 reasonable options and choose one “by default” with a justification in 2-3 sentences.
- Restrictions: comply with the requirements in the PDF; if something is missing, mark it as “not specified in the specification.”
 EXPECTED RESULT
1) Specification analysis (without implementation)
   1.1 Functional requirements (list)
   1.2 Non-functional requirements (performance, availability, quality, limitations)
   1.3 Data/models/entities (if any)
   1.4 Screen(s)/user flow
   1.5 List of “Bonus Points” (provide all items verbatim or as close as possible, with references to their location in the PDF)
2) Implementation plan by task (in as much detail as possible)
   Decomposition rules:
    - Break down into stages: Setup → Core → UI/UX → State/Data → Validation/Errors → Testing → Polish/Perf → Docs/Delivery.
    - Add a “Definition of Done” for each stage.
    - Be sure to include: linting/formatting, typing, error handling, edge cases, tests, documentation, launch/build instructions.
3) Quality control
    - Pre-delivery checklist
    - Set of test cases (minimum 10) + what they cover
    - What metrics/tools we use (if relevant)
      CONCLUSION RESTRICTIONS:
- Do not use general phrases. Write specifically: “do X, check Y.”
- If something is not in the PDF, say so; do not speculate."

**What AI generated:** Detailed implementation plan.

**What you modified:** Add plan corrections

### Prompt 2:
**Prompt:** "Continue implementing the project according to the implementation plan described in  @.claude/instructions/plan.md.

WORK MODE (ITERATIVE)
- Work in small, reviewable increments.
- Split the remaining work into logical “Steps”.
- For each Step:
    1) Implement the Step.
    2) Run linters and tests, and review the modified code yourself.
        - If anything fails or looks off: fix it, then run linters/tests and review again.
        - Repeat until everything is clean and correct.
    3) Only when everything is OK: stop and wait for my “continue” instruction after I manually review + commit.
- Do NOT proceed to the next Step until I explicitly say “continue”.
- Don’t forget to mark todos and update marks in plan

READ FIRST
- Open and read `plan.md`.
- Infer current progress from the repo state (git status, existing files, TODOs).
- If `plan.md` conflicts with the codebase, prefer the codebase; note the discrepancy.  RULES
- Follow `plan.md` strictly, including all BONUS items. Track BONUS work explicitly.
- Keep diffs minimal and focused per Step (avoid sweeping refactors).
- Prefer type-safe, explicit code.
- Do not change public APIs/interfaces unless required by the plan; if required, explain impact.
- Maintain the repo’s existing conventions and style.  EXECUTION INSTRUCTIONS
1) Inspect repo and `plan.md`, then propose a numbered list of Steps that cover the remaining plan (including BONUS). Keep steps small.
2) Start implementing ONLY Step 1 immediately.
3) At the end of Step 1, provide a short summary of what was done in this step (simple bullet list is fine), and then STOP and wait for “continue”.

CHECKS
- Prefer running: formatter → lint → typecheck → unit tests → build (adapt to repo tooling).
- If there are no tests yet and the plan requires them, add tests incrementally in dedicated steps.

STOP CONDITION
After completing Step 1 and summarizing what was done in this step, stop and wait for my instruction (“continue”)."

**What AI generated:** Task by task code implementation

**What you modified:** Fixed issues, correct assumptions

## AI Mistakes Caught

Describe 1-2 cases where AI generated incorrect or suboptimal code:

### Example 1:
- **What was wrong?** Useless performance optimizations
- **How did you catch it?** I noticed several redundant performance optimizations in the code.
- **How did you fix it?** Ask why this was done? Remove useless

## Time Breakdown

- Total time spent: 6 hours
- Time with AI assistance: 4 hours
- Time reviewing/fixing AI output: 1.5 hours
- Time writing code manually: 0.5 hours

## Reflection

### Where did AI help the most?
General plan creation, boilerplate generation, test writing, documentation, complex logic implementation

### Where did AI slow you down?
Had to do a lot of code review, had to correct assumptions, regenerate code, explain context multiple times

### What would you do differently?
Provide more context upfront, break tasks into smaller pieces, be more specific with requirements
