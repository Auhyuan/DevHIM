# Diagram guidance

Read this when a new or changed diagram would clarify a technical design, gate, or dashboard. Reuse clear text, tables, and collapsible sections when they answer the question.

## Choose a format by question

Establish what readers need to understand, the scope, evidence, and applicable version. Infer routine presentation choices from the task and the project. Ask only about ambiguity that changes content or delivery.

| Question | Format | Show |
|---|---|---|
| What makes up the system and where are its boundaries? | Architecture diagram | Components, responsibilities, boundaries, and necessary links |
| Where do components run? | Deployment topology | Entry points, runtime locations, environments, and network boundaries. Distinguish configuration from deployment. |
| Who interacts in what order? | Sequence diagram | Participants, direction, important errors, and responses |
| When can a state change? | State machine | States, triggers, conditions, failure, and reentry |
| Who hands work off and when? | Flowchart or swimlanes | Stage, owner, gates, waiting, and rework destinations |
| How is data related or moved? | ER diagram or data flow | Relationships or direction, according to the question |
| What is in scope and how far along is it? | Collapsible hierarchy or table | Parts, modules, features, and actual states |
| How do quantities, times, or check results compare? | Table or fields | Units, scope, basis, and unknowns |

Give each diagram a primary question. Keep simple time fields in the existing timeline. Use Gantt charts only with a real schedule and proportions only with reliable counts.

## Evidence and maintenance

- Use current sources and existing names and IDs such as REQ, AC, TASK, and BUG. If IDs are absent, link to actual paths and sections.
- Place scope, source pointers, and needed version or check time beside the diagram. For an overview, briefly identify material omissions or collapses and link to details in place.
- Mark gaps and conflicts as unknown or pending reconciliation. Distinguish plans, assumptions, implementation, and verified results. Base components, states, relationships, and approvals on evidence.
- Update the diagram with its living document. Mark the discrepancy pending reconciliation and point to the source. Redrawing the diagram cannot settle a business decision. Keep dashboard changes confined to presentation.

## Readability

Highlight what matters and keep text labels for state. Use color, shape, and position as secondary cues. Remove decoration and duplication first, then group, collapse, or layer overviews and details in place. Around nine main nodes is a cue to consider layering. Preserve legible text and required detail.

Keep gates, approvals, exceptions, failure routes, blockers, and recovery entry points visible. Separate delivery stages from ACTIVE, BLOCKED, WAITING_APPROVAL, and similar statuses. Label transitions with events or conditions and route rework to the affected stage. Show only observed checks as passed.

Use developer-readable names, explain unfamiliar abbreviations, and use identifiers as secondary labels where helpful. Keep arrows directional, reduce crossing, and leave labels clear of nodes and lines. Explain special symbols briefly. Omit decorative connections while preserving actual dependencies and transitions.

Group architecture by clients, services, data, and external dependencies. Keep the main flow direction consistent, prefer orthogonal lines, and label supported protocol or relationship details. Group topology by actual or proposed environment boundaries. Layer larger systems.

On narrow screens retain the conclusion and next gate. Give a dense diagram its own horizontal scroll area while keeping the page within the viewport. Provide a readable caption and summary for HTML or SVG diagrams. Use an accessible name connected to real SVG title and description elements. Keep key conclusions available as text.

## Formats and output

- Use Mermaid or the project's existing format for diagrams maintained in technical documents. Retain editable sources such as draw.io when developers need them. Revise only the relevant diagram.
- Embed simple diagrams. Keep an independent source only for complexity, tool use, or separate editing. Maintain one source for the same information.
- Use existing dashboard phase strips, text, tables, and collapsible sections first. Embed static diagrams only where they add clarity. Use system fonts and keep the page offline. Keep local file paths highlighted and copyable. Skip sidecar SVG or PNG, diagram registries, preview pages, and branding configuration by default.
- Follow the [verification gate](workflow.md#verification-gate) for independent review, scripts, browser previews, screenshots, or export. Stop when an approved check reaches its limit or cannot be interpreted.

[diagram-design](https://github.com/cathrynlavery/diagram-design) informed the format, density, and evidence principles. This guidance is self-contained.
