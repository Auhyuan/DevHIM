# Defect tracking

Read this when the user reports a defect or the current work finds a product problem that needs independent tracking. Keep the issue, state, and next action easy to find. Require the appropriate grant for repair and verification.

## Register or route

- Record user reports, behavior that conflicts with requirements or AC, regressions, and product problems that need cross-task handling or later acceptance. Use UNCONFIRMED when evidence is incomplete. A report may be recorded before reproduction.
- Track routine coding corrections, failed test scripts, and environment problems in the relevant TASK. Record separate evidence if investigation reveals a product defect.
- Route new goals or behavior to requirements. If expected behavior is unclear, record the question and keep proposed AC pending.
- Check the relevant index and entries before assigning an ID. Compare actual behavior, trigger, and expected behavior. Keep possible duplicates separate until evidence supports merging. Limit discovery to relevant records. Apply the verification gate to reproduction.
- Write records under the current request or an existing record grant. During read-only advice or review, suggest changes in conversation.

## Record locations

Reuse the project's tracker, issue entry, or external system, including its names, IDs, and statuses. For new file-based records, use `psop/OPS/bug/BUGS.md` as needed, including for development defects. Keep repair tasks and implementation in DEV.

| Location | Contents |
|---|---|
| BUGS | Authoritative problem, current cause finding, status, task links, repair summary, and closure evidence |
| INDEX | Lightweight navigation with ID and link, status, priority, module, and problem title |
| TASK | Repair scope, constraints, verification grant, actual results, and evidence linked by BUG ID |

Embed a small index at the top of BUGS. Split into `INDEX.md` when navigation warrants it or the project already uses two files. Maintain one detail source per issue. After triage, keep a link in ISSUES. Synchronize index status and priority from the detail entry, mark inconsistencies, and use titles that describe the problem. Open relevant entries after scanning the index.

## IDs and minimum details

Reuse stable IDs. Otherwise allocate unique sequential IDs such as `BUG-001` across volumes. Update the original entry for the same issue, including when reopening it. Use a new ID only for an independent problem and link related history.

Record ID and title, actual behavior, expected behavior and its source, impact, status, current finding, and next action. Mark gaps as unknown. Add reproduction conditions, environment and version, evidence, priority, cause, task, repair, and acceptance details when useful. Keep evidence summaries and references. Exclude secrets and keep durable conclusions independent of `tmp/`.

Assign priority only when needed for triage. Follow the project's scheme. If it has none, you may use P0 for severe and urgent impact, P1 for an important delivery issue, P2 for a normal issue, and P3 for a low-priority improvement. State the impact that supports the rating or leave priority pending. Keep repair authorization and actual blockers separate from priority.

## States and transitions

Use existing equivalents where available. The default lifecycle is:

```text
UNCONFIRMED → OPEN → IN_PROGRESS → FIXED_PENDING_QA → RESOLVED
```

| State | Meaning |
|---|---|
| UNCONFIRMED | A report exists and expected behavior, facts, or impact still need confirmation. |
| OPEN | User confirmation or valid evidence establishes a defect awaiting repair. Reuse valid evidence. |
| IN_PROGRESS | Repair has started within the approved scope. |
| FIXED_PENDING_QA | Repair is implemented. Record which verification or defect acceptance conditions remain. |
| RESOLVED | Agreed defect acceptance passed for a known version and scope. Track deployment separately. |

Keep unfinished repair work in IN_PROGRESS. Failed acceptance returns to OPEN or to IN_PROGRESS when further repair is authorized. Return a recurrence after RESOLVED to OPEN on the same record and retain the prior closure evidence, recurrence conditions, and new task links.

Use the project's dispositions or DUPLICATE with a primary issue link, and NOT_A_BUG with evidence. For deferral, retain the unfinished status and record the reason, decision source, and reentry condition. When reproduction fails, keep the run scope and unresolved conditions and seek authorization for further checks as needed.

## Repair, acceptance, and closure

1. Confirm the affected behavior, impact, and evidence. Label cause hypotheses. Return requirements or design gaps to their stages. Scope repairs through linked tasks; one task may cover related defects.
2. Apply the current grants to recording, analysis, implementation, and verification. Reuse valid authorization without asking again. Keep repairs focused.
3. Follow the [verification gate](workflow.md#verification-gate). Record run limits and stop conditions in TASK. Require coverage for full regression, retests, or expanded checks.
4. Keep a short repair and verification summary plus task links in BUGS. Distinguish self-checks, tests, failed checks, and unrun work. Use FIXED_PENDING_QA when implemented. Mark TASK done only when its agreed evidence exists.
5. Close under the agreed acceptance mechanism and any independent review requirement. Self-check evidence qualifies only if the mechanism permits it. Record the result, reviewer or acceptance mechanism, version, scope, and evidence. Keep closure pending for partial coverage, an unknown outcome, or a missing decision mechanism.

Track deployment separately, including the required version or release task. Keep overall project acceptance and deployment authorization separate from defect closure. When a diagram would clarify transitions, follow [diagram guidance](visual-communication.md) and retain failed acceptance and reopening routes in existing records.

## Maintenance and progress

Update the same entry as findings, proposed repair, and results change. Replace stale hypotheses or mark them as superseded. Keep only history needed for handoff. Avoid full conversations, repeated authorization logs, tool output, and duplicated test matrices.

Summarize only defects affecting current delivery, open decisions, and source links in the state and dashboard. Count only a reconciled scope. Separate resolved issues, duplicates, non-defects, and deferrals. Rely on actual delivery gates even when no issues are OPEN.

Remove redundant process notes before [volume rollover](artifacts.md#living-documents-and-volume-rollover). Carry open issues and necessary context forward with the same IDs. Keep completed evidence in the sealed volume, add a successor link, and update index targets.

## Example

```markdown
| ID / details | Status | Priority | Module | Title |
|---|---|---|---|---|
| [BUG-001](#bug-001) | OPEN | P1 | Orders | Repeated confirmation charges the order again |

## BUG-001

| Field | Record |
|---|---|
| Actual | Confirming an already confirmed order deducts the balance again. |
| Expected | Confirmation is idempotent under Orders AC-004. |
| Impact and trigger | Order balance. Submit confirmation again. Environment and version pending. |
| State and priority | OPEN / P1. The second charge makes the balance wrong. |
| Finding and next action | The user confirmed the problem. Cause pending. Repair and checks await authorization. |
```

In a separate INDEX, include the detail file path in the link. Add the actual task link once repair starts and briefly link evidence after checks and acceptance. Fill optional fields when facts exist.
