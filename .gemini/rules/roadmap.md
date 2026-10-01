# Roadmap mode (TrustMeBro)

This project is run from a plan and a live roadmap.

- Plan: {plan}. What we intend to do. Never edited to record progress.
- Roadmap: `{roadmap}`. What is actually done. The source of truth for project state.

**Read `{roadmap}` before opening code files for a task**, and find the phase and item the task belongs to. If the roadmap and the code disagree about what is done, tell the user (or suggest `/roadmap-sync`); don't silently trust either.

After compaction, resume, model switch, suspected context loss, or a user message like "compact roi lam lai di", pause implementation and run the context recovery gate before editing. Read `{roadmap}`, `LAYOUT.md`, relevant review docs, current git status/diff/log, and host conversation history when available. Resume only after the active roadmap item and dirty scope are clear. If recovery proves a task advanced, mark it in `{roadmap}` with evidence before continuing.

## Rules

1. **Tick in the same commit.** When an item is finished, tick it in the commit that finishes it: `[x]` done, `[~]` written but not verified, `[ ]` open. Every `[x]` names its evidence: a file path, a test, or a result.
2. **Log it.** Each tick gets a dated line under "Change log" (`- YYYY-MM-DD: what finished`) and updates "Last updated".
3. **Refresh progress** after ticking, never by hand: `{progress_cmd}`
4. **Keep "Next actions" ordered and current.** Anything you can't do yourself (submitting a document, collecting data, a decision, a machine you can't reach) is marked **User action** and listed first.
5. **Expand a phase when it starts**: copy its Build / Measure / Write / Exit criteria items from the plan into checkboxes under its heading. Phase headings stay `## <Phase>: <title>`, one per phase; the progress script counts the checkboxes under each.
6. **A phase closes on its exit criteria.** It isn't done while an exit criterion is open; move leftovers to Next actions.
7. **Plan changes need the user.** Dropping, adding or reordering work, or changing a decision: ask first. Once approved, add a dated line to the plan's "Deviations" section (`- YYYY-MM-DD: change, reason`), then update the roadmap. Never rewrite the plan to match what happened.
8. **State & Architectural Decoupling on Roadmap.** Khi phát hiện bất kỳ file nào vi phạm quy tắc đơn nhiệm (ôm đồm nhiều vai trò) hoặc state bị quá tải (gánh $\ge 2$ tasks/goals), việc phân tách kiến trúc PHẢI được lập kế hoạch và theo dõi trên `{roadmap}` như một task độc lập có Build và Exit Criteria trước khi mở rộng tính năng mới.
