#!/bin/bash

# Batch fix all remaining heading issues in architecture docs
cd /home/matt/code/system/kilocode2

# Fix the remaining system overview headings
find docs/architecture -name "*.md" -exec sed -i 's|#1-task-engine|#1-task-engine-srccoretask--fully-documented|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#2-webview-system|#2-webview-system-webview-ui--fully-documented|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#3-message-queue-system|#3-message-queue-system-srccorequeue--partially-researched|g' {} \;

# Fix any remaining compound word issues
find docs/architecture -name "*.md" -exec sed -i 's|#build-deployment-systems|#build--deployment-systems|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#testing-quality-assurance|#testing--quality-assurance|g' {} \;

# Fix any remaining phase issues
find docs/architecture -name "*.md" -exec sed -i 's|#phase-1-foundation-month-1-2|#phase-1-foundation-month-1-2|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#phase-2-core-features-month-3-4|#phase-2-core-features-month-3-4|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#phase-3-optimization-month-5-6|#phase-3-optimization-month-5-6|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#phase-4-monitoring-month-7-8|#phase-4-monitoring-month-7-8|g' {} \;

# Fix any remaining level issues
find docs/architecture -name "*.md" -exec sed -i 's|#level-1-2-request-race-condition|#level-1-2-request-race-condition|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#level-2-multiple-request-race-condition|#level-2-multiple-request-race-condition|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#level-3-system-wide-race-condition|#level-3-system-wide-race-condition|g' {} \;

# Fix any remaining approach issues
find docs/architecture -name "*.md" -exec sed -i 's|#approach-1-simple-lock-based-synchronization|#approach-1-simple-lock-based-synchronization|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#hybrid-approach-lock--call-tracking|#hybrid-approach-lock--call-tracking|g' {} \;

# Fix any remaining state machine issues
find docs/architecture -name "*.md" -exec sed -i 's|#systemstart--activesession|#systemstart--activesession|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#activesession--taskcompleted|#activesession--taskcompleted|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#activesession--racecondition|#activesession--racecondition|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#racecondition--synchronizedexecution|#racecondition--synchronizedexecution|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#synchronizedexecution--normalexecution|#synchronizedexecution--normalexecution|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#normalexecution--racecondition|#normalexecution--racecondition|g' {} \;

# Fix any remaining application issues
find docs/architecture -name "*.md" -exec sed -i 's|#kilocode-docs|#kilocode-docs|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#web-docs|#web-docs|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#web-evals|#web-evals|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#web-roo-code|#web-roo-code|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#playwright-e2e|#playwright-e2e|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#vscode-e2e|#vscode-e2e|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#vscode-nightly|#vscode-nightly|g' {} \;

# Fix any remaining workspace package issues
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codetypes|#roo-codetypes|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codebuild|#roo-codebuild|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codecloud|#roo-codecloud|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codeevals|#roo-codeevals|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codeipc|#roo-codeipc|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codetelemetry|#roo-codetelemetry|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codeconfig-eslint|#roo-codeconfig-eslint|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#roo-codeconfig-typescript|#roo-codeconfig-typescript|g' {} \;

# Fix any remaining repository structure issues
find docs/architecture -name "*.md" -exec sed -i 's|#core-extension-src|#core-extension-src|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#webview-ui|#webview-ui|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#workspace-packages|#workspace-packages|g' {} \;
find docs/architecture -name "*.md" -exec sed -i 's|#applications|#applications|g' {} \;

# Fix any remaining external integration issues
find docs/architecture -name "*.md" -exec sed -i 's|#monitoring--analytics|#monitoring--analytics|g' {} \;

# Fix any remaining development infrastructure issues
find docs/architecture -name "*.md" -exec sed -i 's|#development--infrastructure|#development--infrastructure|g' {} \;

echo "Batch fixes completed!"
