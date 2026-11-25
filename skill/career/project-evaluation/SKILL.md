---
name: project-evaluation
description: Evaluate a software project for learning value, career mobility, re-employment or job-switching usefulness, technical breadth and depth, business/domain exposure, resume and interview value, and project-level growth opportunities. Use when the user asks to assess whether a repository, system, module, internship project, company project, side project, or open-source project is worth joining, studying, maintaining, or writing on a resume; when they ask what they can learn from a project; or when they want a structured judgment of a project's technical value and future job-search impact.
---

# Project Evaluation

Use this skill to judge a whole software project as a learning and career asset. The goal is not to praise or dismiss the project, but to make a defensible value judgment from evidence. Keep defect-fix and requirement-development evaluation as separate task-level skills unless the user explicitly asks to connect project-level conclusions to those activities.

## First Clarify The Evaluation Target

Before scoring, identify:

- **User goal**: learning, resume improvement, job switching, re-employment, interview preparation, promotion, or deciding whether to join/continue the project.
- **Target role**: backend, frontend, full-stack, platform, data, QA, DevOps, mobile, architecture, or management.
- **User level**: junior, mid-level, senior, career switcher, or returning engineer.
- **Participation mode**: read-only study, small fixes, feature ownership, module ownership, production operation, or architecture ownership.

If these are missing, infer conservatively from the request. Ask at most 2 concise questions only when the answer would materially change the recommendation.

## Evidence Collection

Prefer repository facts over assumptions. If the repository is available, inspect enough evidence before scoring.

1. **Project orientation**
   - Read `README`, docs, architecture notes, deployment files, API specs, migrations, package/build files, test setup, and environment examples.
   - Identify the domain, user scenarios, main modules, data lifecycle, external systems, and project type: production, internal tool, learning demo, open source, legacy maintenance, or interview toy.

2. **Implementation depth**
   - Map the stack: frameworks, storage, cache, queue, search, auth, permissions, observability, CI/CD, deployment, testing, and operational scripts.
   - Trace 2-4 representative flows from entry point to persistence or external integration.
   - Look for hard problems: transactions, concurrency, consistency, performance, security, complex rules, domain modeling, data migration, monitoring, error handling, extensibility, or distributed-system tradeoffs.

3. **Engineering health**
   - Check layering, boundaries, coupling, duplication, naming, test coverage style, error boundaries, configuration, dependency hygiene, and operational maturity.
   - Use git history when useful: active maintenance, feature size, defect-prone areas, refactors, ownership patterns, and release cadence.

4. **Opportunity surface**
   - Identify what a contributor can actually change. A technically deep project has limited learning value if the user only edits copy or configuration.
   - Separate visible technology from hands-on ownership.

## Evidence Strength

Assign a confidence level before the final recommendation:

- **High**: repository/docs are available, core flows were traced, and claims cite concrete files/modules/configs.
- **Medium**: enough structure is visible, but some production context, scale, or ownership details are inferred.
- **Low**: only a description is available; provide a preliminary evaluation and list missing evidence.

Never present a low-confidence evaluation as a firm conclusion.

## Scoring Anchors

Score each dimension from 1 to 5. Use half scores when evidence is mixed.

- **1**: little transferable value; mostly boilerplate, toy CRUD, unclear domain, or no meaningful ownership.
- **2**: some exposure, but shallow implementation or weak career signal.
- **3**: useful for learning common production patterns; limited deep tradeoffs or differentiation.
- **4**: strong learning and interview material; includes meaningful constraints, tradeoffs, and ownership paths.
- **5**: rare high-signal project; combines real domain complexity, technical depth, measurable outcomes, and strong ownership.

Dimensions:

- **Learning value**: Real constraints, architecture, implementation patterns, debugging opportunities, and feedback loops.
- **Career relevance**: Match to target roles, interview topics, resume bullets, and transferable engineering stories.
- **Technical depth**: Performance, concurrency, consistency, distributed behavior, security, complex domain rules, data correctness, or operations.
- **Technical breadth**: Meaningful coverage across app, data, infrastructure, quality, and operations. Do not count unused dependencies.
- **Business/domain value**: Domain concepts, workflows, lifecycle state changes, permissions, audit, reconciliation, compliance, or product constraints.
- **Ownership growth**: Ability to understand, change, test, release, observe, and improve the system.
- **Differentiation**: Ability to produce distinctive stories beyond generic CRUD or framework usage.

Overall recommendation:

- **Strongly worth investing**: high learning and career signal with concrete growth paths.
- **Worth selective investment**: useful if the user focuses on high-value modules or improvements.
- **Limited value**: mostly generic, shallow, or hard to convert into interview evidence.
- **Not recommended as a main learning project**: poor signal, little ownership, or outdated patterns without transferable value.

## Calibration By Project Type

Adjust judgment by project type:

- **Production business system**: value comes from domain rules, reliability, data correctness, observability, performance, and change safety.
- **Internal admin/tooling project**: value depends on workflow complexity, permission models, data operations, automation, and integration breadth.
- **Legacy project**: value can be high if it teaches refactoring, migration, stabilization, testing, and risk control; low if only repetitive patching is possible.
- **Open-source project**: value depends on code quality, review standards, issue quality, community activity, and whether contributions are non-trivial.
- **Learning/demo project**: usually lower career signal unless it contains deliberate architecture, tests, deployment, performance work, or strong documentation.
- **High-tech but low-ownership project**: score career relevance lower if the user cannot explain decisions, tradeoffs, or outcomes.

## Growth Opportunities To Look For

At project level, identify recurring opportunities the user may encounter while adding features or fixing defects:

- Persistence issues: repeated queries, N+1 patterns, missing indexes, broad transactions, data inconsistency, inefficient pagination, or excessive remote calls.
- Business complexity: duplicated rules, unclear states, branching workflows, weak validation, missing audit, or permissions scattered across layers.
- Change fragility: tight coupling, hidden side effects, weak tests, unclear module ownership, duplicated logic, or poor API contracts.
- Reliability gaps: weak logs, missing metrics/tracing, unclear error handling, no retry/idempotency strategy, poor rollback path.
- Quality gaps: missing regression tests, excessive mocks, untested integration paths, brittle UI states, or undocumented operational steps.

For each opportunity, explain:

1. Symptom the user may observe.
2. Investigation method.
3. Concept or engineering habit learned by solving it.
4. Resume/interview evidence that could come from the work.

## Anti-Bias Rules

- Do not equate many dependencies with technical breadth.
- Do not equate framework usage with engineering depth.
- Do not overvalue a famous company, fashionable stack, or large codebase without evidence of ownership and learning surface.
- Do not undervalue CRUD automatically; CRUD becomes valuable when it involves real domain rules, scale, consistency, audit, permissions, or operational constraints.
- Distinguish **exposure** from **learning**. Seeing Redis is exposure; designing cache keys, invalidation, metrics, and failure behavior is learning.
- Distinguish **participation** from **ownership**. Fixing small isolated issues is weaker than owning design, implementation, tests, rollout, and post-release observation.

## Output Format

Respond in Chinese unless the user asks otherwise. For Chinese output, use these headings in the order below: 结论, 置信度, 评分, 能学到什么, 对求职的帮助, 技术深度与广度, 项目中的成长机会, 建议投入路线, 最终建议. Use 高 / 中 / 低 for confidence and label evidence and missing information separately. Use this structure:

- **Conclusion**. State whether the project is worth pursuing and the best way to participate.
- **Confidence**. Rate it high, medium, or low. Give the evidence and important gaps.
- **Scores**. Use a table with dimension, score out of five, and evidence. Include learning value, job-switching or re-employment value, technical depth, technical breadth, business or domain value, growth potential, and differentiation. For Chinese output use 学习价值, 跳槽/再就业帮助, 技术深度, 技术广度, 业务/domain 价值, 成长空间, 差异化程度.
- **What you can learn**. Name the concrete learning opportunities.
- **Career value**. Identify résumé points, interview stories, and points too weak to lead with.
- **Technical depth and breadth**. Explain each dimension and its risks or gaps.
- **Growth opportunities**. For each opportunity, give the scenario, symptom, learning point, and demonstrable outcome.
- **Suggested path**. Give a three-stage sequence for getting involved.
- **Final recommendation**. Choose commit strongly, participate selectively, pursue for limited value, or avoid as the main project. For Chinese output use 强烈投入 / 选择性投入 / 价值有限 / 不建议作为主项目. Explain the reason.

If the repository is unavailable, produce only a preliminary evaluation and explicitly state what evidence would change the conclusion.
