# Adoption and recovery

Read existing records, code, and evidence to understand the scope. Record missing or outdated evidence. Get authorization under the [verification gate](workflow.md#verification-gate) before running independent reviews, tests, or builds.

## NEW — New project

Clarify the goal, scope, AC, and delivery endpoint. Once requirements are confirmed, establish the state and requirements records within the write grant. Add a short `AGENTS.md` entry only when no entry instructions exist. Write useful content first. Create design and task records at those stages and defer empty directories.

Keep entry instructions short: read the state first, read only the current scope, respect authorization, and invoke P-SOP. Keep the full procedure in the Skill.

## ADOPT — Existing project

1. Start with the current task, applicable rules, and sources the user named. Read the actual implementation and PRD, TECH, TASK, migration, and operations records that affect the scope. Identify known change ownership.
2. Distinguish confirmed requirements, existing design, present implementation, and valid verification. Mark gaps as unverified. Treat directory presence and undocumented approvals as insufficient evidence.
3. Set the adoption boundary at the current task, module, delivery, or full project as requested. Keep unrelated cleanup outside adoption.
4. Capture enough baseline to continue: goal and AC, effective design, current implementation and evidence gaps, source paths, ownership of uncommitted changes, and valid authorization. Use the earliest Git commit as the project start, with attribution. For missing or incomplete Git history, follow the [time rules](time-and-gap.md). Record the SOP adoption date separately.
5. With valid write authorization, create `PROJECT-STATE.md` with project origin ADOPTED and entry mode ADOPT. Point to existing records in their current formats. Fill only gaps required for the current task, preferably in place.
6. Resume at the stage justified by the evidence. Reuse sufficient design and verification. Resolve only missing AC, decisions, permissions, or evidence that affect this delivery.

Treat a read-only inventory as read-only. Reuse a clear grant for both adoption and implementation within that scope. Follow the active delivery gates when editing code.

<a id="continue日常接续"></a>

## CONTINUE routine work

Use the named goal or task. Continue directly when the scope is clear and authorized. If several open items make it ambiguous, ask only which item is in scope. Reuse existing goals, REQ, and TASK. Backlog entries outside that scope remain separate. Keep new issues in the appropriate workflow.

Read the relevant task, requirements, and design. Check that the worktree, evidence, and prerequisites still support the next action. Switch to RESUME or return to the affected stage if interfaces, scope, or ownership have changed.

## RESUME — After a gap or context change

Preserve origin, stable task IDs, revision counts, and valid records. Compute the gap from the existing progress timestamp as defined in the [time rules](time-and-gap.md). Recalculate the gap at the actual update time. Change the progress timestamp and its summary only after meaningful progress. Use RECOVERING while reconciling the baseline. Preserve the project and its progress instead of reinitializing.

Check requirements and design revisions, task progress against implementation, relevant interfaces and dependencies, uncommitted change ownership, the original grant, and whether prior evidence covers the current code. Continue safe read-only checks. Ask only about an ownership or business question that blocks the next action.

Record recovery findings in the current work, boundaries, and risks of the state file and in affected source records. Keep a separate Recovery Summary out of the default workflow. Use ACTIVE once the baseline and authorization are valid, WAITING_APPROVAL when a design or scope decision is needed, and BLOCKED when an external dependency actually prevents work.

When recovery completes in one pass, record the final state and why recovery was needed. If waiting, handing off, or continuing later, save one current RECOVERING snapshot.

## Timeline, gaps, and rework

Use the [time rules](time-and-gap.md) for elapsed time and gap guidance. Put the first SOP adoption date in project identity and the state check timestamp in metadata. Project duration is calendar time. Development hours and accumulated blocked time are outside the default metrics.

A gap is a clue. Reconcile material code, interface, or permission changes even after a short interval. Use the normal authorization gates for any extra checks.

Count material changes as revisions. Count repeated work on the same goal caused by a requirements or design gap, implementation mistake, or similar cause as rework. Keep ordinary increments, formatting, reading, and volume rollover outside rework counts. Record cause, impact, and the latest change.

For repeated rework on the same goal, look for a recurring cause. Use about three occurrences as a reminder and about five as a prompt for a focused requirements and design review. Adjust thresholds as needed. Address critical gaps immediately. Pause only where an actual gate prevents progress.

## Handoff or discontinuation

Give the current state, open tasks, evidence, and authorization boundaries. Preserve project records in readable formats. Remove or adjust entry-point hints only as requested. Keep code, project documents, and team constraints intact unless the user separately requests a change.
