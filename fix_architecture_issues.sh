#!/bin/bash

# Final comprehensive fix for docs/architecture/ directory
cd /home/matt/code/system/kilocode2

echo "Final comprehensive fix for docs/architecture/ directory..."

# Fix 1: Fix specific heading issues
# Replace #testing--quality with #testing-quality
find docs/architecture -name "*.md" -exec sed -i 's|#testing--quality|#testing-quality|g' {} \;

# Replace #build-pipelines with #build-pipeline
find docs/architecture -name "*.md" -exec sed -i 's|#build-pipelines|#build-pipeline|g' {} \;

# Fix 2: Fix specific missing headings by removing problematic links
# Remove links to non-existent headings
find docs/architecture -name "*.md" -exec sed -i 's|\[#change-1-orchestrator-load-subtask-changes\]|\[Change 1\]|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|\[#cleanup-proposal-replace-subtask-load-logic\]|\[Cleanup Proposal\]|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|\[#1-main-task-loop\]|\[Main Task Loop\]|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|\[#3-api-call-location\]|\[API Call Location\]|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|\[#webview-ui\]|\[Webview UI\]|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|\[#workspace-packages\]|\[Workspace Packages\]|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|\[#applications\]|\[Applications\]|g' {} \;

echo "Final architecture directory fixes completed!"