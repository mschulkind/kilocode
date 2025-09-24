# Duplicate API Requests Troubleshooting (Short)

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

Purpose: Fast, field-ready triage for multiple spinners / jumbled responses.

## Triage Flow

## Research Context
- *Purpose:*\* \[Describe the purpose and scope of this document]
- *Background:*\* \[Provide relevant background information]
- *Research Questions:*\* \[List key questions this document addresses]
- *Methodology:*\* \[Describe the approach or methodology used]
- *Findings:*\* \[Summarize key findings or conclusions]
- \*\*
1. Observe symptoms
- Multiple spinners at once
- Responses out of order / corrupted XML
- Often after subtask completion
2. Collect quick data
- Check DevTools/console for JSON logs with `Task.recursivelyMakeClineRequests`
- Capture reasons: main-loop | subtask-completion | user-request
- Note timestamps for overlaps
3. Identify scenario
- Two-request race: main-loop + subtask-completion close together
- Three-request race: add user-request after premature green text
4. Confirm lock status
- If lock enabled: expect no overlaps, only queued waits
- If lock disabled: expect overlaps (bug)

## Quick Fixes
- Enable lock feature flag for `recursivelyMakeClineRequests`
- Restart the chat session if corruption occurred
- If three-request variant triggered, avoid immediate resend; wait for UI to settle

## Where It Breaks
- Parent and subtask both calling `recursivelyMakeClineRequests` concurrently
- Introduced by navigation recovery change (`continueParentTask`)

## Minimal Commands / Checks
- Grep for call starts:

```bash
rg 'Task.recursivelyMakeClineRequests".*"start"' src webview-ui | cat
```
- Verify single active span per task in Laminar
- Inspect UI flags: `sendingDisabled`, `isStreaming` transitions

## Instrumentation Essentials
- Use the SHORT debug implementation: `API_DUPLICATION_DEBUG_IMPLEMENTATION_SHORT.md`
- Tag every call with `reason`
- Record `start`, `end`, `duration_ms`, `queue_wait_ms`

## Known Triggers
- Subtask completes and parent continues in background (same chat)
- Subtask prematurely thinks it's done (green text), then user resends
- Navigation away/back resumes parent (intended), but can overlap without lock

## Decision Tree
- Overlap detected?
- Yes → Lock missing/misconfigured → Enable lock, retest
- No → Investigate jumbled UI rendering, ordering logic, or tool result routing
- Triple overlap?
- Yes → Confirm premature completion; educate UI flow; add guard to suppress extra calls when
  `green end` recently emitted

## Preventive Measures
- Keep lock permanently for recursive calls
- Add idempotent guards on parent resume when already running
- CI test for overlap (see `TESTING_STRATEGY.md`)

## Links
- \[Root Cause Analysis of Duplicate API Requests]race-condition/ROOT\_CAUSE\_ANALYSIS.md)
- \[Code Flow and Execution Analysis]race-condition/CODE\_FLOW\_ANALYSIS.md)
- \[Solution Options and Synchronization Strategies]race-condition/SOLUTION\_RECOMMENDATIONS.md)
- \[Testing Strategy and Validation Plan]race-condition/TESTING\_STRATEGY.md)
- \[Prevention and Monitoring Measures]race-condition/PREVENTION\_MEASURES.md)

## 🔍 Research Context & Next Steps

### When You're Here, You Can:
- *Understanding Architecture:*\*
- **Next**: Check related architecture documentation in the same directory
- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Architecture Documentation](README.md) for context
- *Implementing Architecture Features:*\*
- **Next**: [Repository Development Guide](../repository/DEVELOPMENT_GUIDE.md) →
  [Testing Infrastructure](../repository/TESTING_INFRASTRUCTURE.md)
- **Related**: [Orchestrator Documentation](../../../../../../../orchestrator/README.md) for integration patterns
- *Troubleshooting Architecture Issues:*\*
- **Next**: \[Race Condition Analysis]../race-condition/README.md) →
  \[Root Cause Analysis]race-condition/ROOT\_CAUSE\_ANALYSIS.md)
- **Related**: [Orchestrator Error Handling](../../../../../../../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Architecture Documentation](README.md) for guidance.

## No Dead Ends Policy

This document is designed to provide value and connect to the broader KiloCode ecosystem:
- **Purpose**: \[Brief description of document purpose]
- **Connections**: Links to related documents and resources
- **Next Steps**: Clear guidance on how to use this information
- **Related Documentation**: References to complementary materials

For questions or suggestions about this documentation, please refer to the [Documentation Guide](../../../../../../../DOCUMENTATION_GUIDE.md) or [Architecture Overview](../../../../../../../../architecture/README.md).

## Navigation Footer
- \*\*
- *Navigation*\*: [← Back to Architecture Documentation](README.md) ·
  [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
