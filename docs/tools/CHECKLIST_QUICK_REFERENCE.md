# Implementation Checklist Quick Reference

## Table of Contents

* [Implementation Checklist Quick Reference](#implementation-checklist-quick-reference)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Template Location](#template-location)
* [Quick Setup](#quick-setup)
* [1. Copy Template](#1-copy-template)
* [2. Customize Header](#2-customize-header)
* [3. Define Tasks](#3-define-tasks)
* [Status Values](#status-values)
* [Task ID Format](#task-id-format)
* [Commit Message Format](#commit-message-format)
* [Progress Tracking Rules](#progress-tracking-rules)
* [For Each Task:](#for-each-task)
* [Timestamp Format](#timestamp-format)
* [Common Task Patterns](#common-task-patterns)
* [Setup Tasks](#setup-tasks)
* [Implementation Tasks](#implementation-tasks)
* [Documentation Tasks](#documentation-tasks)
* [Testing Tasks](#testing-tasks)
* [Success Criteria Template](#success-criteria-template)
* [File Organization](#file-organization)
* [Directory Structure](#directory-structure)
* [Naming Convention](#naming-convention)
* [Best Practices](#best-practices)
* [Task Design](#task-design)
* [Progress Updates](#progress-updates)
* [Quality Assurance](#quality-assurance)
* [Common Mistakes to Avoid](#common-mistakes-to-avoid)
* [Quick Commands](#quick-commands)
* [Create New Checklist](#create-new-checklist)
* [Update Progress](#update-progress)
* [Complete Task](#complete-task)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation Footer](#navigation-footer)
* [Implementation Checklist Quick Reference](#implementation-checklist-quick-reference)
* [Table of Contents](#table-of-contents)
* [When You're Here](#when-youre-here)
* [Research Context](#research-context)
* [Technical Overview](#technical-overview)
* [Background](#background)
* [Methodology](#methodology)
* [Template Location](#template-location)
* [Quick Setup](#quick-setup)
* [1. Copy Template](#1-copy-template)
* [2. Customize Header](#2-customize-header)
* [3. Define Tasks](#3-define-tasks)
* [Status Values](#status-values)
* [Task ID Format](#task-id-format)
* [Commit Message Format](#commit-message-format)
* [Progress Tracking Rules](#progress-tracking-rules)
* [For Each Task:](#for-each-task)
* [Timestamp Format](#timestamp-format)
* [Common Task Patterns](#common-task-patterns)
* [Setup Tasks](#setup-tasks)
* [Implementation Tasks](#implementation-tasks)
* [Documentation Tasks](#documentation-tasks)
* [Testing Tasks](#testing-tasks)
* [Success Criteria Template](#success-criteria-template)
* [File Organization](#file-organization)
* [Directory Structure](#directory-structure)
* [Naming Convention](#naming-convention)
* [Best Practices](#best-practices)
* [Task Design](#task-design)
* [Progress Updates](#progress-updates)
* [Quality Assurance](#quality-assurance)
* [Common Mistakes to Avoid](#common-mistakes-to-avoid)
* [Quick Commands](#quick-commands)
* [Create New Checklist](#create-new-checklist)
* [Update Progress](#update-progress)
* [Complete Task](#complete-task)
* [No Dead Ends Policy](#no-dead-ends-policy)
* [Navigation Footer](#navigation-footer)

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this
document's role or purpose, this section helps orient you.

* **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
* **Context**: Use this as a starting point or reference while navigating the project.
* **Navigation**: Use the table of contents below to jump to specific topics.

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems,
> this documentation provides structured guidance for understanding and implementing solutions! 🔧

* *Purpose:*\* Quick reference for creating and using implementation checklists.

## Research Context

### Technical Overview

**Component**: \[Component name]
**Version**: \[Version number]
**Architecture**: \[Architecture description]
**Dependencies**: \[Key dependencies]

### Background

\[Background information about the topic]

### Methodology

\[Research or development methodology used]

## Template Location

```
docs/tools/IMPLEMENTATION_CHECKLIST_TEMPLATE.md
```

## Quick Setup

### 1. Copy Template

```bash
# Extract project name from plan filename

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️
# If plan is API_GATEWAY_PLAN.md, project name is api-gateway

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

cp docs/tools/IMPLEMENTATION_CHECKLIST_TEMPLATE.md context/[proj_name]/phase1.md
```

### 2. Customize Header

```markdown
# [Project Name]: [Phase Name] Implementation Checklist

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why"
behind the "what"! 💻

- *Purpose:** [Brief description]

> **[Fun Fact]**: [Motivational element] [Emoji]
```

### 3. Define Tasks

```markdown
### T[NNN] · Task X.Y: [Task Name]

- *Status:** ⏳ Pending **Estimated Time:** [X] hours

- *Subtasks:**
- [ ] [Specific action 1]
- [ ] [Specific action 2]
- [ ] [Test/validate]

- *Deliverables:**
- [Output 1]
- [Output 2]
```

## Status Values

* ⏳ Pending
* 🔄 In Progress
* ✅ Done
* ❌ Blocked

## Task ID Format

* `T001`, `T002`, `T003`, etc.
* Unique within each checklist
* Can be reused across different projects

## Commit Message Format

```
[type](TNNN): brief-description
- specific change 1
- specific change 2

Implements: TNNN · [Phase] Task X.Y: Task Name
```

## Progress Tracking Rules

### For Each Task:

1. Set status to "In Progress"
2. Add started timestamp (ISO 8601)
3. Update summary table
4. Check off subtasks as completed
5. Run tests/validation
6. Add completed timestamp
7. Update summary table
8. Commit with task ID
9. Update cross-references

### Timestamp Format

```
2025-01-27T10:30:00Z
```

## Common Task Patterns

### Setup Tasks

* Environment configuration
* Dependency installation
* Project structure creation
* Basic testing

### Implementation Tasks

* Core feature development
* Integration work
* Configuration setup
* Testing implementation

### Documentation Tasks

* User guides
* API documentation
* Process documentation
* Troubleshooting guides

### Testing Tasks

* Unit test creation
* Integration testing
* Performance testing
* Security testing

## Success Criteria Template

```markdown
## Success Criteria Checklist

- *[Phase] Success Metrics:**
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Performance metric]
- [ ] [Team adoption metric]

- *Documentation Updates:**
- [ ] [Doc update 1]
- [ ] [Doc update 2]
```

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

* **Project Name**: Extract from plan filename `<proj_name>_PLAN.md`
* **Examples**:
* `API_GATEWAY_PLAN.md` → `context/api-gateway/`
* `USER_DASHBOARD_PLAN.md` → `context/user-dashboard/`
* `CI_CD_PIPELINE_PLAN.md` → `context/ci-cd-pipeline/`

## Best Practices

### Task Design

* Break into specific, actionable subtasks
* Include testing/validation steps
* Add clear deliverables
* Estimate time realistically

### Progress Updates

* Update checkboxes in real-time
* Keep summary table current
* Record actual time spent
* Document lessons learned

### Quality Assurance

* Test each task completion
* Validate configurations
* Update documentation
* Review with team

## Common Mistakes to Avoid

❌ **Too vague:** "Implement feature" ✅ **Specific:** "Create user authentication endpoint with JWT
validation"

❌ **No testing:** Missing validation steps ✅ **Testable:** Include unit tests, integration tests,
manual testing

❌ **No deliverables:** Unclear outputs ✅ **Clear outputs:** Specify files, configurations,
documentation created

❌ **Unrealistic estimates:** 1 hour for complex task ✅ **Realistic:** Break complex tasks into
smaller pieces

## Quick Commands

### Create New Checklist

```bash
# Extract project name from plan filename

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️
# If plan is API_GATEWAY_PLAN.md, project name is api-gateway

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid
foundation, clear structure, and intuitive navigation! 🏗️

cp docs/tools/IMPLEMENTATION_CHECKLIST_TEMPLATE.md context/[proj_name]/phase1.md

# Edit with your project details

> **System Fun Fact**: Every complex system is just a collection of simple parts working together -
documentation helps us understand how! ⚙️

code context/[proj_name]/phase1.md
```

### Update Progress

1. Change status: `⏳ Pending` → `🔄 In Progress`
2. Add timestamp: `2025-01-27T10:30:00Z`
3. Check off subtasks: `[ ]` → `[x]`
4. Update summary table

### Complete Task

1. Change status: `🔄 In Progress` → `✅ Done`
2. Add completion timestamp
3. Update summary table
4. Commit with task ID

## No Dead Ends Policy

This document connects to:

For more information, see:

* [Documentation Structure](../README.md)
* [Additional Resources](../tools/README.md)

## Navigation Footer

* \*\*

* *Navigation*\*: [← Back to Documentation Tools](../tools/) ·
  [📚 Technical Glossary](../GLOSSARY.md) ·
  [↑ Table of Contents](#implementation-checklist-quick-reference)
