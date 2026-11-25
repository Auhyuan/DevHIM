# DevHIM

![DevHIM 封面：PLAN → DEV → OPS 项目开发流程](assets/DevHIM.png)

面向软件开发与职业成长的 AI Agent Skill 集合，帮助开发者评估项目价值、分析和交付需求，以及维护可接续的项目开发流程。

当前仓库收录 4 个 Skill，均位于 `skill/career/`。每个 Skill 以 `SKILL.md` 为入口，按需配套参考文档、模板及 Agent 界面配置。使用说明默认面向中文交流场景。

## Skill 索引

| Skill | 适用场景 | 主要能力 | 入口 |
| --- | --- | --- | --- |
| `project-evaluation` | 判断项目是否值得学习、参与、维护，或作为简历与面试素材 | 基于项目证据评估学习价值、求职相关性、技术深度与广度、业务价值和成长机会 | [项目价值评估](skill/career/project-evaluation/SKILL.md) |
| `requirement-helper` | 分析新需求、增强功能、修复缺陷、制定实现方案或审查改动 | 先只读分析价值、方案与风险，再按授权进入手动指导或自动实现，并验证结果 | [需求分析与交付助手](skill/career/requirement-helper/SKILL.md) |
| `p-sop` | 新项目启动、已有项目接入、日常接续与中断恢复 | 按需求、设计、任务、开发、验证与验收推进，维护当前状态和精简资料，按需生成进度页面 | [P-SOP 项目开发规范](skill/career/P-SOP/SKILL.md) |
| `brainstorming` | 新项目、新功能的方向或首期范围需要探索 | 澄清关键问题，比较可行方向，收敛为可确认的需求 | [需求探索](skill/career/brainstorming/SKILL.md) |

> `P-SOP` 是仓库目录名，`p-sop` 是该 Skill 在 `SKILL.md` 中声明的名称。

## 如何选择

- 想知道“这个项目值得投入吗、能学到什么、对求职有什么帮助”，使用 `project-evaluation`。
- 还在想“做什么、先做什么”，使用 `brainstorming` 收敛方向。
- 已有具体需求，想判断“要不要做、怎么做、怎么验证”，使用 `requirement-helper`。
- 希望知道“项目做到哪了、接下来做什么、如何接续或交接”，使用 `p-sop`。
- 只希望“用现有资料生成或更新进度看板”，直接告诉 Agent 生成看板，由 `p-sop` 按需加载内置规则与模板。

这些能力可独立使用，也可配合。方向不清时用 brainstorming 探索，明确的需求交给 requirement-helper 分析与交付，项目全程由 P-SOP 接续管理。

## 快速开始

### 1. 获取仓库

```bash
git clone https://github.com/Auhyuan/DevHIM.git
cd DevHIM
```

### 2. 选择并加载 Skill

打开上方索引中的 `SKILL.md`，确认其适用场景和执行规则。若所用 Agent 支持安装 Skill，按该工具的约定放置所选 Skill 的完整目录；保留 `references/`、`assets/` 和 `agents/` 等已有配套文件，保证相对引用可用。

直接安装仓库中的 `skill/career/P-SOP/` 完整目录，就能使用完整流程和内置看板。仅生成看板时按需读取本目录的规则与模板，不要求先接入项目开发流程。

仓库内容更新不会自动更新已复制到个人 Skill 目录的旧版本，升级时需更新对应的完整目录副本，并移除已不使用的旧入口。

也可以直接让 Agent 阅读仓库中的 Skill 文件，并按其中规则处理任务。例如，在本仓库中：

```text
请阅读 skill/career/project-evaluation/SKILL.md，
按其中规则评估我指定项目的学习价值与求职价值。
我的目标岗位是 Java 后端，参与方式是负责一个业务模块。
```

评估其他项目时，提供目标项目路径或资料入口，并确保 Agent 能访问相应内容。

### 3. 描述目标与执行范围

可以直接用自然语言描述目标，让 Agent 按对应 Skill 执行；所用工具支持显式选择 Skill 时，也可按其名称调用。以下是可参考的提示词：

**项目价值评估**

```text
使用 $project-evaluation 评估当前项目。
我希望提升后端开发能力，并积累可用于简历与面试的项目经历。
请基于仓库事实给出评分、证据置信度、成长机会和建议投入路线。
```

**需求分析与手动指导**

```text
使用 $requirement-helper 分析这个需求：为订单列表增加状态筛选。
先只读检查项目，给出验收条件、实现方案和风险。
分析后采用 Manual 模式，由我写代码，你逐步指导并检查结果。
```

**需求分析与自动实现**

```text
使用 $requirement-helper 处理这个需求：为订单列表增加状态筛选。
先完成只读分析，再采用 Automatic 模式。
我授权你修改该需求范围内的代码并执行适用验证。
```

**已有项目接入与流程维护**

```text
使用 $p-sop 将当前已有项目接入开发流程管理。
本次只读核对当前范围，并建立必要的状态与资料入口，不修改业务代码。
请复用已有需求、设计和任务文档，说明当前进度、验证缺口及下一步。
```

**按需构建项目进度看板**

```text
根据当前项目的 PRD、技术方案和任务记录，使用 P-SOP 内置看板能力，
生成或更新 psop/PROJECT-DASHBOARD.html。
只更新看板，展示已知进度、可折叠模块、验证缺口与高亮文件路径。
```

## DevHIM CLI 本地试用

需要 Node.js 22 或更新版本。从仓库根目录构建并预览本地安装：

```bash
npm ci
npm run build
node dist/cli.js init --offline --dry-run
```

安装向导先选模式。选择插件后，可在同一层选择 Codex、Claude Code、两者或「导出 ZIP，交给 Agent 安装」。直接安装时再选择项目或全局范围。完整指定选项时可在脚本中运行。`--dry-run` 展示来源、版本、变更和冲突，不写文件。

| 安装模式 | 可选 Agent |
| --- | --- |
| 独立 P-SOP | Codex、Claude Code、Cursor、Qoder、OpenCode |
| DevHIM 插件（P-SOP、Brainstorming、需求助手、项目评估） | Codex、Claude Code |

只装了桌面版或使用其他 Agent 时，可以在希望保存 ZIP 的目录执行：

```bash
devhim init --mode plugin --format zip
```

输出为当前目录的 `devhim-plugin-<Skill版本>.zip`。可加 `--offline` 使用内置快照，或 `--dry-run` 查看目标路径。若已存在同名文件，请选择其他目录或先移走旧包。将 ZIP 附给 Agent，请它按当前宿主支持的方式安装，保留已有配置，并说明启用步骤和四个 Skill 的调用方式。支持插件的宿主可使用清单；仅支持 Skill 的宿主可读取包内的 `skills/`。

默认在线从官方 `Auhyuan/DevHIM` 仓库选择版本号最高的稳定标签（`vX.Y.Z` 或 `X.Y.Z`），忽略预发布标签。一次执行固定一个 Git 提交，预览和实际写入使用同一份内容。仓库尚无稳定标签或网络不可用时会报告原因。显式传入 `--offline` 可安装当前 CLI 内置快照，插件版本随所选内容来源确定。安装后的 Skill 从本地读取。

```bash
devhim init
devhim update
devhim init /path/to/project --scope project --mode skill --tools codex,claude --dry-run
devhim update /path/to/project --scope project --mode skill --tools codex,claude --dry-run
```

安装记录存放在目标目录旁，保存来源、版本、在线提交及受管文件指纹。`update` 显示当前和目标版本，更新原样文件并移除新版已删除的原样文件。遇到本地修改时跳过对应 Agent，保留其他自建文件。旧安装没有指纹时，仅识别与内置快照或目标版本一致的内容；其余差异交由用户处理。Claude 的本地插件市场由同一用户的多个项目共享，插件启用范围遵循所选宿主配置。

本地开发使用 `node dist/cli.js` 代替上述 `devhim`。有新稳定内容时，在官方仓库为对应提交发布新的稳定标签；CLI 本身改变时再发布 npm 包。

安装后按终端提示打开新会话。在 Claude Code 插件中，可用 `/devhim:brainstorming` 直接探索需求。在 Codex 启用 DevHIM 后，从插件中选择 `brainstorming`。

## 各 Skill 的工作方式

### project-evaluation：基于证据判断项目价值

从目标岗位、个人阶段和实际参与方式出发，检查项目结构、代表性业务链路、工程质量与可承担的工作，按 1～5 分评估各维度，并给出证据置信度。

输出包括项目结论、评分依据、可学习内容、求职素材、成长机会和建议投入路线。只有项目描述、缺少仓库证据时，给出初步评估并说明缺失信息。

### brainstorming：从模糊想法收敛到可确认的需求

先复用已有上下文，每轮聚焦最影响方向的问题。需要选择时比较少量可行方向，最后用首期范围、成功标准和待确认事项简短交接。讨论默认保留在会话里。

### requirement-helper：先分析，再按授权交付

采用 `Advisory → Delivery → Verification` 三阶段，并按需求复杂度选择 Light、Standard 或 Deep 分析深度。

- **Advisory**：只读检查上下文，明确目标、验收条件、价值、方案与风险。
- **Manual**：用户编写代码，Agent 提供逐步指导、结果检查与验证建议。
- **Automatic**：获得当前需求的明确修改授权后，Agent 在约定范围内实现与验证。
- **Review**：只读审查方案、补丁、差异或 PR，给出可执行的反馈。

详细规则见 [手动交付](skill/career/requirement-helper/references/manual-delivery.md)、[自动交付](skill/career/requirement-helper/references/automatic-delivery.md)、[审查协议](skill/career/requirement-helper/references/review-protocol.md) 与 [价值评估标准](skill/career/requirement-helper/references/value-rubric.md)。

### P-SOP：让项目状态与交付依据随时可读

支持 `NEW`、`ADOPT`、`CONTINUE`、`RESUME` 四种进入方式，分别对应新项目、已有项目接入、日常继续和中断恢复。

起项或新增需求方向未定时，P-SOP 可提议使用独立的 brainstorming。探索结束后回到需求阶段确认。

使用少量持续维护的文档记录当前目标、需求与验收条件、技术方案、任务、检查结果和剩余事项。默认以 `PROJECT-STATE.md` 保存当前快照，以 `psop/REQ`、`psop/DEV`、`psop/DEV/DATA`、`psop/OPS` 按需组织资料；已有项目可复用原来的文件名称、位置与格式。

状态与看板的“开发周期与中断提醒”固定展示五项：项目起始、项目历时（包含中断时间）、最近一次有效推进、距上次推进、最近一次有效推进内容。已有项目以 Git 最早提交为起始基准；Agent 在更新时用实际时间减最近推进时间计算时长，采用 `NORMAL`、`REMINDER`、`WARNING`、`LONG_GAP` 四档，默认边界为 3／7／15 天，字段下方给出中文说明。有效推进后同时更新时间与内容，不保存历史中断；提醒不自动启动验证或重置项目进度。

产物生成与验证分别授权。独立审查、测试、构建、工具检查和页面预览须由用户明确要求或批准最小验证方案后执行；每项默认一次，通过或能力不足即停止，扩展范围及复测需有明确授权。未执行如实记录，不因质量门禁擅自补跑验证，也不默认生成截图和预览副本。

用户报障或出现需要独立跟踪的产品问题时，按需加载 [缺陷管理](skill/career/P-SOP/references/bug-management.md)。BUGS 集中维护问题和闭环结论，轻量 INDEX 按需拆分，TASK 保存修复与验证证据；已有项目直接复用原记录或外部系统。自测通过不自动关闭缺陷，验收按项目约定机制执行，记录、修复、验证与发布分别遵守有效授权。

用户需要进度页面时，直接使用本 Skill 目录内置的看板规则与模板，生成自包含、可离线查看的 `psop/PROJECT-DASHBOARD.html`。仅请求看板时，不要求已有 PROJECT-STATE.md 或先完成 SOP 接入；只更新约定的 HTML，保留来源与未知项。首屏突出当前状态和下一步；项目结构支持部分、模块折叠，可按需加入默认收起的架构图和部署拓扑。本地文件使用可复制的高亮路径，页面内导航及已核对的网页来源可以保留链接。

技术方案、流程或看板确需图示时，按需加载 [图示表达与维护](skill/career/P-SOP/references/visual-communication.md)。先判断文字、表格或现有结构是否足够，再按问题选择图形；保留来源、关键门禁与异常路径，复杂图优先在原文档内分层。看板突出当前推进条件，区分实现、验证与验收；不额外生成图形副本、登记 JSON 或品牌配置，图形检查仍需有效授权。

详细规则见 [接入与恢复](skill/career/P-SOP/references/adoption-recovery.md)、[流程与门禁](skill/career/P-SOP/references/workflow.md)、[产物与维护](skill/career/P-SOP/references/artifacts.md) 和 [内置看板规则](skill/career/P-SOP/references/dashboard-generation.md)。

## 仓库结构

```text
DevHIM/
├── README.md
└── skill/
    └── career/
        ├── brainstorming/
        │   └── SKILL.md
        ├── project-evaluation/
        │   └── SKILL.md
        ├── requirement-helper/
        │   ├── SKILL.md
        │   ├── agents/openai.yaml
        │   └── references/
        │       ├── automatic-delivery.md
        │       ├── manual-delivery.md
        │       ├── review-protocol.md
        │       └── value-rubric.md
        └── P-SOP/
            ├── SKILL.md
            ├── agents/openai.yaml
            ├── assets/
            │   ├── dashboard-template.html
            │   ├── development-flow.drawio
            │   └── project-state-template.md
            └── references/
                ├── adoption-recovery.md
                ├── artifacts.md
                ├── bug-management.md
                ├── dashboard-generation.md
                ├── time-and-gap.md
                ├── visual-communication.md
                └── workflow.md
```

- `SKILL.md`：声明名称、适用场景、工作流程和执行边界。
- `references/`：按具体任务加载的详细规则与参考说明。
- `assets/`：可复用模板与流程图。
- `agents/openai.yaml`：Agent 界面配置，包含显示名称、简短说明与默认提示词。

## 使用原则

- **事实与证据优先**：结论应能追溯到项目资料或实际检查，缺失信息明确标为未知。
- **授权与范围明确**：只读分析和审查保持只读；代码修改、Git 暂存与提交、推送、部署、SQL 执行及外部数据写入分别遵守实际授权。
- **验证结果如实记录**：区分通过、失败、未执行、未核实和不适用，完成结论须有覆盖当前范围的依据。
- **复用已有约定**：遵守适用的 `AGENTS.md` 和用户指令，保留用户修改，优先复用现有资料。
- **按需维护资料**：文档与模板按任务需要使用，临时产物放在目标项目根目录的 `tmp/` 中，并保持可随时删除。
