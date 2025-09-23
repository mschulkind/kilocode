# State Machines Documentation 🦕

**Purpose:** Index and navigation for all state machine documents in this directory.

<details><summary>Table of Contents</summary>

- [Overview](#overview)
- [Start Here](#start-here)
- [Core State Machines](#core-state-machines)
- [Combined and Specialized](#combined-and-specialized)
- [Related documentation](#related-documentation)

</details>

## Overview

Welcome to the tectonic layers of our runtime. This index describes each state machine doc and how to use them together during design, debugging, and implementation.

## Start Here

- [Combined State Machine](COMBINED_STATE_MACHINE.md)
  Explains how Task, Session, and Recursive Call state machines interact. Use this to understand systemic behavior across boundaries. Shows transitions from normal execution to race conditions and back.
- [Race Condition State Machine](RACE_CONDITION_STATE_MACHINE.md)
  Focuses on the problem area and the synchronized solution. Clarifies failure modes and the expected stabilized path under synchronization.

## Core State Machines

- [Task State Machine](TASK_STATE_MACHINE.md)
  Individual task lifecycle states (CREATED → … → COMPLETED/FAILED). Essential for reasoning about when tasks may pause, spawn children, or resume.
- [Session State Machine](SESSION_STATE_MACHINE.md)
  Chat session lifecycle and inactivity/return-to-activity behavior. Explains how navigation and inactivity impact execution eligibility.
- [Recursive Call State Machine](RECURSIVE_CALL_STATE_MACHINE.md)
  Execution and synchronization of recursive API calls. Documents concurrent states and the intended single-call path.

## Combined and Specialized

- [Combined State Machine](COMBINED_STATE_MACHINE.md)
  A system-level view of interactions, ideal for onboarding and cross-team reviews.
- [Race Condition State Machine](RACE_CONDITION_STATE_MACHINE.md)
  The dedicated problem/solution chart with notes for implementation.

## Related documentation

- [API Duplication Race Condition Analysis](../API_DUPLICATION_RACE_CONDITION_ANALYSIS.md)
  Master narrative and navigation hub for the duplicate-API-request issue family.
- [Orchestrator Documentation](../orchestrator/README.md)
  Parent/child task orchestration concepts and lifecycle.

---

<a id="navigation-footer"></a>

- Back: [../README.md](../README.md) · Root: [../README.md](../README.md) · Source: `/docs/architecture/state-machines/README.md#L1`
