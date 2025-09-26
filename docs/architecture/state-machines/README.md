# State Machines Documentation 🦕

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

- *Purpose:*\* Index and navigation for all state machine documents in this directory.

<details><summary>Table of Contents</summary>
- [Overview](#overview)
- [Start Here](#start-here)
- [Core State Machines](#core-state-machines)
- [Combined and Specialized](#combined-and-specialized)
- [Related documentation](#related-documentation)

</details>

## Overview

## Research Context

- *Purpose:*\* \[Describe the purpose and scope of this document]

- *Background:*\* \[Provide relevant background information]

- *Research Questions:*\* \[List key questions this document addresses]

- *Methodology:*\* \[Describe the approach or methodology used]

- *Findings:*\* \[Summarize key findings or conclusions]
- \*\*

Welcome to the tectonic layers of our runtime. This index describes each state machine doc and how
to use them together during design, debugging, and implementation.

## Start Here
- [Combined State Machine](COMBINED_STATE_MACHINE.md) Explains how Task, Session, and Recursive Call
  state machines interact. Use this to understand systemic behavior across boundaries. Shows
  transitions from normal execution to race conditions and back.
- [Race Condition State Machine](RACE_CONDITION_STATE_MACHINE.md) Focuses on the problem area and
  the synchronized solution. Clarifies failure modes and the expected stabilized path under
  synchronization.

## Core State Machines
- [Task State Machine](TASK_STATE_MACHINE.md) Individual task lifecycle states (CREATED → … →
  COMPLETED/FAILED). Essential for reasoning about when tasks may pause, spawn children, or resume.
- [Session State Machine](SESSION_STATE_MACHINE.md) Chat session lifecycle and
  inactivity/return-to-activity behavior. Explains how navigation and inactivity impact execution
  eligibility.
- [Recursive Call State Machine](RECURSIVE_CALL_STATE_MACHINE.md) Execution and synchronization of
  recursive API calls. Documents concurrent states and the intended single-call path.

## Combined and Specialized
- [Combined State Machine](COMBINED_STATE_MACHINE.md) A system-level view of interactions, ideal for
  onboarding and cross-team reviews.
- [Race Condition State Machine](RACE_CONDITION_STATE_MACHINE.md) The dedicated problem/solution
  chart with notes for implementation.

## Related documentation
- [API Duplication Race Condition Analysis](../API_DUPLICATION_RACE_CONDITION_ANALYSIS.md) Master
  narrative and navigation hub for the duplicate-API-request issue family.
- [Orchestrator Documentation](../../orchestrator/README.md) Parent/child task orchestration concepts
  and lifecycle.
- \*\*

<a id="navigation-footer"></a>
- Back: [Architecture Documentation](../README.md) · Root: [Architecture Documentation](../README.md) · Source:
  `/docs/architecture/state-machines/README.md#L1`

## No Dead Ends Policy

This document follows the "No Dead Ends" principle - every path leads to useful information.
- Each section provides clear navigation to related content
- All internal links are validated and point to existing documents
- Cross-references include context for better understanding

## Navigation
- [← Architecture Overview](../README.md)
- [← State Machines Overview](README.md)
- [← Main Documentation](../README.md)
- [← Project Root](../../README.md)
