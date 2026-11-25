# Development timeline and gaps

Use this contract for the project state and dashboard. Keep displayed values short and calculation rules in the Skill.

## Output contract

For Chinese output, use the heading from the [state template](../assets/project-state-template.md). Show one line with the as-of timestamp and time zone, the five fields below in order, then `等级说明` as four separate list items in the order NORMAL, REMINDER, WARNING, LONG_GAP. Use the template's Chinese meanings and intervals. Update the intervals when the user sets thresholds. Use a five-row Markdown table in `PROJECT-STATE.md` and the same order and list structure on the dashboard.

Only if needed, add one short note after the level list about a real evidence gap, such as `历史推进时间仅记录到日期`. Prefer marking the affected field unrecorded, indeterminate, or at its true precision. Omit calculation notes, maintenance rules, repeated Git attribution, and filler. Put scheduling and grants under delivery, current work, or boundaries.

| Fixed Chinese label | Value |
|---|---|
| 项目起始 | Timestamp. For adopted projects include `以 Git 最早提交为基准`. |
| 项目历时（包含中断时间） | Duration only, such as `20 天 2 小时`. |
| 最近一次有效推进 | Actual timestamp only. |
| 距上次推进 | Elapsed time and English level, such as **9 天 2 小时 · WARNING**. |
| 最近一次有效推进内容 | One sentence on the work corresponding to the timestamp. Keep it last. |

Use the real start for a new project. For adoption, use the earliest commit in available local Git history. Reuse that baseline after establishing it. Without Git, record the start as unrecorded. For incomplete history use `当前可追溯最早提交，历史不完整` and keep the assessment local without automatically fetching history. Keep first SOP adoption in project identity. Preserve any manual correction and its basis.

Use a single project time zone, default `Asia/Shanghai`, and format `YYYY-MM-DD HH:mm:ss`. Label zone and as-of time in each timing section. Preserve actual date or minute precision and mark boundary uncertainty for review. Distinguish the state check, dashboard generation, and effective progress timestamps.

If the user set a delivery date, record it under current delivery or risks. Base dates on supplied evidence. Keep this section to the five fields with no recovery timestamps, prior-gap fields, or reminder history. Recalculate after manual corrections and keep corrections separate from progress.

## Calculate and update

Use actual elapsed time including weekends and holidays. One day is 24 continuous hours. Assign the level before formatting the duration. Treat the page as a snapshot at its stated time. Do not start a timer or rewrite files just to refresh the numbers.

```text
Elapsed project time = actual calculation time − project start
Time since progress = actual calculation time − last effective progress in PROJECT-STATE.md
```

Recompute elapsed time and gap when updating the state or generating a dashboard. Preserve the progress timestamp during inspection or display refresh. After effective progress, update its time and summary together and recompute the gap. A near-zero gap is valid at that point. A dashboard-only request leaves the source timestamp intact. When the state file is absent, use the corresponding record from existing sources.

For example, progress at `2026-10-01 12:50:59` as of `2026-10-10 14:50:59` gives **9 天 2 小时 · WARNING**.

Effective progress includes requirements confirmation, a material design or scope decision, actual implementation or repair, an authorized check with a real result including failure, and a completed recovery assessment that establishes the current state and next step. Use the actual work time for backfilled records. Opening, reading, asking for status, formatting, refreshing a dashboard, correcting a timestamp, and repeated actions without results leave the timestamp intact. A recovery assessment must establish scope, implementation, and task state.

When progress is unrecorded, mark the gap as indeterminate. Use project initiation as first progress only if substantive work actually occurred. Report incomplete history as an evidence gap. Mark inconsistent, future, or zone-ambiguous times pending reconciliation. Project elapsed time is calendar span including interruptions. Development or blocked hours are outside the default metrics.

## Levels and reminders

Use these configurable thresholds. Keep custom boundaries explicit, continuous, and non-overlapping. Changes belong to the user or established project settings.

| Exact elapsed time | Level | Chinese meaning and action |
|---|---|---|
| Less than 72 hours | NORMAL | `正常接续`. Display the duration. |
| At least 72 hours and under 168 hours | REMINDER | `接续提醒`. Briefly recap where work stopped and the next step. |
| At least 168 hours and at most 360 hours | WARNING | `中断警告`. Suggest reviewing the active task, key decisions, and incomplete work. |
| Over 360 hours | LONG_GAP | `长期中断`. Suggest reconciling goals, implementation, and remaining work before continuing. |

Use the duration and level in the gap field. When the level rises or a developer returns, keep any reminder brief and in conversation as needed. Avoid recurring warnings or storing reminder history.

Keep planned pauses in elapsed time and document the plan under current work or risks. At actual project completion, freeze elapsed time at the completion timestamp and stop continuity reminders. Task or documentation DONE does not end the project. If work resumes later, retain the original start and reflect the actual resumption.

Use levels only for reminder intensity and recovery guidance. Determine stage, pause, blockage, and acceptance from project facts. Keep tests, refactoring, and replanning under their own authorization gates.
