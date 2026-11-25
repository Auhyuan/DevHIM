# Artifacts, readability, and maintenance

## Minimal layout

```text
project/
├── AGENTS.md                         Existing entry instructions
├── PROJECT-STATE.md                  Current delivery snapshot
├── PROJECT-MANIFEST.md               Optional; existing sources can serve this purpose
├── psop/
│   ├── PROJECT-DASHBOARD.html         Optional current snapshot
│   ├── REQ/PROJECT-SPEC-001.md        Requirements, AC, scope, review, confirmation
│   ├── DEV/
│   │   ├── TECH-SPEC-001.md           Technical design and design review
│   │   ├── TASKS-001.md               Tasks, checks, review, and acceptance
│   │   └── DATA/                     Necessary executable database artifacts
│   └── OPS/
│       ├── OPERATIONS-001.md          Release and current operations
│       └── ISSUES-001.md              Operational issues and outcomes
└── tmp/                              Disposable checks and output
```

Create records when the stage needs them. First requirements confirmation usually needs only state and requirements records. Add TECH and TASK during design and planning. Create OPS, DATA, dedicated indexes, and the page on demand. Let the technology stack determine source and test layout.

Reuse existing PRD, AC, TECH, TASK, and operations records in their current names, paths, and formats. Identify the current authoritative location in the state file. Use the default layout for a new project unless the user specifies another one.

## Where information belongs

| Record | Contents |
|---|---|
| PROJECT-SPEC | Purpose, in-scope and excluded work, business rules, stable REQ and AC IDs, observable acceptance criteria, review, and confirmation |
| TECH-SPEC | Goal and AC mapping, implementation boundaries, interface, data and state changes, timeouts, retries, idempotency, exceptions, dependencies, risks, checks, design review, and confirmation |
| TASKS | Index, current tasks, self-checks, code review, integration results, AC acceptance, completion facts, and evidence locations |
| OPERATIONS | Version, environment, actual releases, deployment prerequisites and permissions, operation and recovery, smoke checks, monitoring, and troubleshooting |
| ISSUES | Source, impact, disposition, and related REQ, BUG, TASK, or RELEASE links |
| BUGS and optional INDEX | BUGS holds defects and closure evidence. INDEX holds navigation and status summaries. A small index can live at the top of BUGS. |

Keep a short scope, material revision, latest change and reason, and related links in each active volume. Record confirmations and reviews in place. Keep decisions, essential evidence, boundaries, and next actions. Remove placeholders, drafting prompts, verbose transcripts, routine tool output, and redundant process notes. Retain operating or reproduction steps necessary to use the record.

### Task details

Index each task by ID, goal, related AC, dependencies, and status. For the current task, record inputs, affected scope, implementation constraints, applicable checks, completion criteria, and results. Name tasks by action and outcome. Example:

```text
TASK-004 — Detect timeouts and protect terminal states
AC: AC-004 through AC-006. Dependencies: effective design and downstream idempotency.
Scope: identified scan, retry, and callback handlers. Ownership checked.
Constraints: one retry at most. A late callback cannot overwrite a terminal state.
Current: implementation in progress. Build and scenario checks not run.
Authorization: pending. Proposed checks are time boundaries, concurrent scans,
duplicate callbacks, and retry exhaustion.
Done: applicable checks and code review pass, with evidence for the current version.
```

Update an open task for changes to the same goal and keep its ID. Use a new ID for a new independent goal or delivery after completion. Link a new regression repair to the prior task and retain prior results. Record the disposition of canceled, merged, or superseded work without counting it as complete.

Follow [defect tracking](bug-management.md) for issues and closure. TASK holds actual repairs and evidence linked by stable BUG IDs. One task may cover related defects.

### Traceable evidence

Record the object and version, method or command actually used, time, outcome, essential output, remaining gaps, and evidence location. Distinguish unrun checks from evidence. Link AC to design, tasks, and acceptance by stable IDs. Use paths, sections, or existing entries when IDs are missing, and add only the mapping the task needs. Preserve the meaning and confirmation of existing requirements.

Record verification scope, run count, stop conditions, and authorization in the current task or design. Treat the checklist as a list of checks the work may require. Keep only a short boundary and pointer in the state. Avoid separate verification logs.

Compute task completion only from unique current tasks within the confirmed scope and label any effort weighting. Exclude past deliveries, canceled work, and out-of-scope tasks. Avoid using feature counts as task counts or project progress.

## Separate artifacts on demand

- Use API-SPEC, ERD, state or sequence diagrams when integration, tooling, or independent editing calls for them. Embed simple diagrams and models in the design. Reuse generated contracts where present.
- For DATA, optionally use DDL, DML, MIGRATION, and ROLLBACK. Follow the actual tool or ORM layout and link the source files. State SQL dialect, dependencies, environment, recovery, and execution prerequisites. Obtain execution authorization separately. Preserve applied migrations and version subsequent executable changes.
- Keep deployment configurations, builds, container files, and scripts in their actual engineering directories. Reference versions and uses from operations notes. Exclude binary copies, secrets, and live credentials from P-SOP records.
- Create a structure index only when current records cannot explain project, parts, modules, and features. Reuse names and IDs and mark unknowns.
- Read [diagram guidance](visual-communication.md) for visual artifacts. Embed supporting diagrams in the corresponding living document where practical. Keep underlying gates and acceptance evidence available.

Treat suggested paths and filenames as defaults. Reuse other skills' formats if the result is readable, evidence is locatable, and each fact has one maintenance location.

## Triage issues and defects

Handle immediate coding corrections, script failures, and environment issues in the relevant task. For user-reported defects, regressions, and independently tracked product problems, use [defect tracking](bug-management.md) whether found during development, acceptance, or operations. Mark uncertain product reports as unconfirmed.

Operational feedback can start in ISSUES or an existing tracker. After triage keep only its origin, disposition, and links there. Put confirmed new requirements in REQ and design and implementation in DEV. Track implementation, acceptance, and actual releases separately. Keep unconfirmed suggestions outside the agreed scope.

<a id="living-documents-与分卷"></a>

## Living documents and volume rollover

Overwrite the current state and dashboard snapshots. Update an existing goal in the active requirements, design, task, operations, or issue volume. Append independent goals in the same volume. Use readable fields and tables as needed.

For a proposed requirement or design change, note the proposal, reason, impact, and open decision beside the current entry. Keep the effective requirement until the change is confirmed. Keep read-only discussion in the conversation. For example, a proposal to raise the retry limit from one to three can identify AC-012, design section 2, and TASK-008. If a valid confirmation or grant already applies, update in place.

After confirmation, merge the decision into the current entry and retain only useful rationale and links. Remove superseded or declined drafts. Track implementation, verification, and release separately. Follow existing ID rules for new goals. Keep IDs on renames, preserve the disposition of removed or superseded items, and avoid reusing IDs. Record only material changes without mandatory change IDs or separate proposals.

Consider cleanup around **8,000 body characters or 300 non-empty lines**, and assess rollover around **12,000 characters or 500 non-empty lines**. Adjust for project and information density. Remove duplication first and split at complete entry boundaries. Keep time and stage changes independent of rollover.

1. Start the next numbered volume. Carry over open entries, stable IDs, and enough current context to continue.
2. Keep completed details and historical evidence in the old volume. Summarize or link them in the new one. Include current design decisions in enough detail to avoid rereading all prior volumes.
3. Record the seal date, transferred scope, and successor path in the old volume, then stop routine edits there.
4. Point the state to the new volume and current entries. Check links in both directions, stable IDs, statuses, and the counting basis. Count a transferred task once.

Correct old factual errors in the current volume with a source link. Add an erratum if the team requires it. Track volume number separately from material revision. Rollover, reading, and formatting count as neither revisions nor rework.

Apply the tooling's rules to executable migrations and contracts. Use the document thresholds for prose records. Consult Git history on demand and require actual authorization for staging or committing.
