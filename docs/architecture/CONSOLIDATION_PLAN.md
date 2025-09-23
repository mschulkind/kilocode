# Documentation Consolidation Plan

Purpose: Reduce duplication across architecture docs and improve discoverability with cross-links. Items are lettered for quick selection.

## Candidates (Priority Order)

A) Race Condition Summaries

- Duplicate: High-level summaries in `race-condition/PROBLEM_OVERVIEW.md` and `API_DUPLICATION_RACE_CONDITION_ANALYSIS.md` overlap.
- Action: Keep the master index summary in `API_DUPLICATION_RACE_CONDITION_ANALYSIS.md`; shorten `PROBLEM_OVERVIEW.md` to a one-paragraph executive summary linking out.

B) Navigation Scenario Details

- Duplicate: Parent reinitialization explanations appear in `NAVIGATION_SCENARIO.md` and sprinkled in `ROOT_CAUSE_ANALYSIS.md`.
- Action: Canonicalize deep detail in `NAVIGATION_SCENARIO.md`; replace secondary occurrences with a brief pointer.

C) State Machine Notes

- Duplicate: State descriptions partially restated in multiple pages.
- Action: Treat `state-machines/` as the single source; pages should link rather than restate properties.

D) Solution Options

- Duplicate: Lock vs Arbiter pros/cons appear in short guides and full recommendations.
- Action: Keep full evaluation in `SOLUTION_RECOMMENDATIONS.md`; short guides should link with 1–2-line summaries.

E) Testing Strategy Excerpts

- Duplicate: Test ideas copied into other pages.
- Action: Centralize in `TESTING_STRATEGY.md`; other pages link to specific sections.

F) Repository Overviews

- Duplicate: Pieces of repository context repeated in `REPOSITORY_OVERVIEW.md` and architecture index.
- Action: Keep full in repository index; architecture index retains only a 2–3 sentence description.

## Rationale

- Single-source-of-truth reduces drift and maintenance overhead.
- Readers navigate from concise indexes to canonical detail pages.
- Improves consistency during future refactors.

## Next Steps

- Apply A–F; track follow-ups during review.
- Add a lint/check to flag long duplicate excerpts in PRs.
