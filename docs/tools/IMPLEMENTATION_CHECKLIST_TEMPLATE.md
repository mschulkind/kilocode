# Implementation Checklist Template

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

- *Purpose:*\* A standardized template for creating detailed, granular task breakdowns for
  implementing complex projects with precise tracking and accountability.

> **Cartography Fun Fact**: Like mapping a complex terrain, we'll chart each step of our
> implementation journey with precise coordinates and clear landmarks! 🗺️

## Template Overview

This template provides a structured format for creating implementation checklists that can be
reproduced for any project or work set. It includes progress tracking, task management, and
accountability features.

## Document Structure

### 1. Header Section

- **Title**: `[Project Name]: [Phase Name] Implementation Checklist`
- **Purpose**: Brief description of the project scope and focus
- **Fun Fact**: Optional motivational or thematic element

### 2. Progress Summary

- **Research Context**: Template placeholders for project context
- **Summary Table**: Task tracking with status, timestamps, and progress
- **Overall Progress**: Aggregate statistics

### 3. Implementation Rules

- **Task ID Convention**: Unique identifier system
- **Task Workflow**: Step-by-step process for each task
- **Commit Message Format**: Standardized commit structure
- **Testing Requirements**: Quality assurance guidelines

### 4. Task Organization

- **Task Overview**: High-level project information
- **Weekly/Phase Breakdown**: Organized task groupings
- **Individual Task Details**: Detailed task specifications

## Template Usage

### Creating a New Implementation Checklist
1. **Copy this template** to your project directory: `context/<proj_name>/phase1.md`
- Extract `<proj_name>` from your plan filename: `<proj_name>_PLAN.md`
- Example: If plan is `API_GATEWAY_PLAN.md`, use `context/api-gateway/phase1.md`
2. **Replace placeholders** with project-specific information
3. **Define task structure** based on your project needs
4. **Set up tracking** using the provided format
5. **Follow implementation rules** throughout execution

### Customization Guidelines

- **Task IDs**: Use `TNNN` format (T001, T002, etc.)
- **Timestamps**: Use ISO 8601 format (2025-01-27T10:30:00Z)
- **Status Values**: `⏳ Pending`, `🔄 In Progress`, `✅ Done`, `❌ Blocked`
- **Progress**: Use percentage (0-100%)

## Template Sections

### Header Template

```markdown
# [Project Name]: [Phase Name] Implementation Checklist

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

- *Purpose:** [Brief description of project scope and focus]

> **[Thematic Fun Fact]**: [Motivational or thematic element] [Emoji]

## Progress Summary

## Research Context

- *Purpose:** [Describe the purpose and scope of this document]

- *Background:** [Provide relevant background information]

- *Research Questions:** [List key questions this document addresses]

- *Methodology:** [Describe the approach or methodology used]

- *Findings:** [Summarize key findings or conclusions]
- --

| Task ID                          | Task Name | Status     | Started | Completed | Est. Time |
Actual Time | Progress |
| -------------------------------- | --------- | ---------- | ------- | --------- | --------- |
----------- | -------- |
| [T001](#t001--task-11-task-name) | Task Name | ⏳ Pending | -       | -         | 2h        | -
| 0%       |

- *Overall Progress:** 0/X tasks completed (0%) | **Time Invested:** 0h (Actual) vs 0h (Estimated) |
- *Remaining:** 0h (Est.)
```

### Implementation Rules Template

```markdown
## Implementation Rules

- *Task ID convention:** Each task has a local unique ID `TNNN` (e.g., T001). IDs are unique within
this plan only and may be reused in other plans.

- *For Each Task:**
1. **Set status to In Progress** in this file
2. **Add Started timestamp** in ISO 8601 format (e.g., 2025-01-27T13:55:00Z)
3. **Update the summary table** with started timestamp and In Progress status
4. **Update subtask checkboxes in real-time** as individual subtasks are completed (not just when
   the whole task is done)
5. **Complete all subtasks** listed under the task
6. **Run tests/validation** to verify correctness
7. **Add Completed timestamp** in ISO 8601 format and set status to Done
8. **Update the summary table** with actual completion time and final status
9. **Commit and push** with the prescribed commit message format
10. **Review and update** cross-links and references if impacted

- *Important Notes:**

- **Subtask tracking**: Update individual subtask checkboxes `[ ]` → `[x]` as soon as each subtask
  is completed
- **Git tracking**: The `context/` directory is gitignored, so this task list file itself should NOT
  be committed to git
- **Progress visibility**: The summary table at the top provides an at-a-glance view of all task
  statuses

- *Commit Message Format (must include Task ID):**
```

[type](TNNN): brief-description
- specific change 1
- specific change 2
- specific change 3

Implements: TNNN · Phase Task X.Y: Task Name

```

- *Testing Requirements:**
- Each task must be testable and verifiable
- All code must run without errors
- All configurations must be validated
- All documentation must be updated
```

### Task Overview Template

```markdown
## Task Overview

- *[Phase Name] Duration:** [Timeframe] ([X] tasks total) **Focus:** [Brief description of phase
focus] **Goal:** [Specific, measurable goal for this phase]
```

### Individual Task Template

```markdown
### T[NNN] · Task X.Y: [Task Name]

- *Status:** ⏳ Pending **Started:** - **Completed:** - **Estimated Time:** [X] hours

- *Subtasks:**
- [ ] [Specific subtask 1]
- [ ] [Specific subtask 2]
- [ ] [Specific subtask 3]
- [ ] [Test/validation subtask]
- [ ] [Documentation subtask]

- *Deliverables:**
- [Deliverable 1]
- [Deliverable 2]
- [Deliverable 3]

- *Links:**
- [Implementation Plan](../../plans/[PLAN_NAME].md#section)
- [Related Documentation](../[DOC_NAME].md)
```

### Success Criteria Template

```markdown
## Success Criteria Checklist

- *[Phase Name] Success Metrics:**
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]
- [ ] [Team adoption metric]
- [ ] [Performance metric]

- *Documentation Updates:**
- [ ] [Documentation update 1]
- [ ] [Documentation update 2]
- [ ] [Documentation update 3]
```

### Next Steps Template

```markdown
## Next Steps

After completing [Phase Name]:
1. **Review [Phase Name] results** against success criteria
2. **Plan [Next Phase] implementation** based on lessons learned
3. **Update [Documentation] Guide** with new processes
4. **Begin [Next Phase]** with [focus area]

- *[Next Phase] Focus:** [Brief description]
- [Focus area 1]
- [Focus area 2]
- [Focus area 3]
- [Focus area 4]


## No Dead Ends Policy

This document connects to:
- [Related Document 1](./related-doc-1.md) - [Brief description]
- [Related Document 2](./related-doc-2.md) - [Brief description]
- [Related Document 3](./related-doc-3.md) - [Brief description]

For more information, see:
- [Category Overview](../category/)
- [Related Resources](../resources/)


## Navigation Footer
- --

- *Navigation**: [← Back to Implementation Plan](../../plans/[PLAN_NAME].md) ·
[📚 Technical Glossary](../GLOSSARY.md) ·
[↑ Table of Contents](#phase-name-implementation-checklist)
```

## Best Practices

### Task Design

- **Granular**: Break tasks into specific, actionable subtasks
- **Testable**: Each task should have clear success criteria
- **Time-bound**: Include realistic time estimates
- **Dependencies**: Note any task dependencies clearly

### Progress Tracking

- **Real-time Updates**: Update checkboxes as work progresses
- **Status Consistency**: Use consistent status values throughout
- **Timestamp Accuracy**: Record actual start/completion times
- **Progress Visibility**: Keep summary table current

### Documentation

- **Clear Descriptions**: Write task names and descriptions clearly
- **Comprehensive Subtasks**: Include all necessary steps
- **Deliverable Focus**: Specify what will be produced
- **Link Maintenance**: Keep cross-references current

### Quality Assurance

- **Testing Requirements**: Include validation steps
- **Review Process**: Build in review checkpoints
- **Error Handling**: Plan for common issues
- **Documentation Updates**: Keep docs current with changes

## Example Customizations

### For Software Development
- Add code review subtasks
- Include testing and deployment steps
- Add performance benchmarks
- Include security considerations

### For Documentation Projects
- Add content review steps
- Include style guide compliance
- Add accessibility checks
- Include user testing

### For Infrastructure Projects
- Add environment setup steps
- Include monitoring configuration
- Add backup and recovery steps
- Include security hardening

### For Process Implementation
- Add training and adoption steps
- Include change management
- Add feedback collection
- Include success measurement

## File Organization

### Directory Structure

```
context/
├── <proj_name>/
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── <other-project>/
    └── phase1.md
```

### Naming Convention

- **Project Name**: Extract from plan filename `<proj_name>_PLAN.md`
- **Examples**:
- `API_GATEWAY_PLAN.md` → `context/api-gateway/`
- `USER_DASHBOARD_PLAN.md` → `context/user-dashboard/`
- `CI_CD_PIPELINE_PLAN.md` → `context/ci-cd-pipeline/`

### File Placement

- **Checklists**: `context/<proj_name>/phase1.md`, `phase2.md`, etc.
- **Plans**: `plans/<proj_name>_PLAN.md`
- **Templates**: `docs/tools/IMPLEMENTATION_CHECKLIST_TEMPLATE.md`

## Maintenance Guidelines

### During Implementation
- Update progress regularly
- Document lessons learned
- Adjust estimates based on actual time
- Update dependencies as needed

### After Completion
- Archive completed checklists
- Extract best practices
- Update templates based on learnings
- Share insights with team
- \*\*

- *Navigation*\*: [← Back to Documentation Tools](../tools/) ·
  [📚 Technical Glossary](../GLOSSARY.md) ·
  [↑ Table of Contents](#implementation-checklist-template)
