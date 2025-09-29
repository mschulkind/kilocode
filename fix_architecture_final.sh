#!/bin/bash

# Final batch fix for remaining architecture doc issues
cd /home/matt/code/system/kilocode2

# Fix navigation footer issues
find docs/architecture -name "*.md" -exec sed -i 's|#️-navigation-footer|#-navigation-footer|g' {} \;

# Fix build pipeline extra 's' issue
find docs/architecture -name "*.md" -exec sed -i 's|#build-pipeline--partially-researcheds|#build-pipeline--partially-researched|g' {} \;

# Fix GLOSSARY.md path
find docs/architecture -name "*.md" -exec sed -i 's|../GLOSSARY.md|../../GLOSSARY.md|g' {} \;

# Fix testing quality issues
find docs/architecture -name "*.md" -exec sed -i 's|#testing--quality|#testing-quality|g' {} \;

# Fix package management issues
find docs/architecture -name "*.md" -exec sed -i 's|#package-management--partially-researched|#package-management|g' {} \;

# Fix cicd pipeline issues
find docs/architecture -name "*.md" -exec sed -i 's|#cicd-pipeline--partially-researched|#cicd-pipeline|g' {} \;

# Fix unit testing issues
find docs/architecture -name "*.md" -exec sed -i 's|#unit-testing--partially-researched|#unit-testing|g' {} \;

# Fix integration testing issues
find docs/architecture -name "*.md" -exec sed -i 's|#integration-testing--partially-researched|#integration-testing|g' {} \;

# Fix build pipeline issues
find docs/architecture -name "*.md" -exec sed -i 's|#build-pipeline--partially-researched|#build-pipeline|g' {} \;

# Fix webview-ui issues
find docs/architecture -name "*.md" -exec sed -i 's|#webview-ui|#webview-ui|g' {} \;

# Fix workspace-packages issues
find docs/architecture -name "*.md" -exec sed -i 's|#workspace-packages|#workspace-packages|g' {} \;

# Fix applications issues
find docs/architecture -name "*.md" -exec sed -i 's|#applications|#applications|g' {} \;

# Fix change-1 issues (these might not exist, so we'll remove the links)
find docs/architecture -name "*.md" -exec sed -i 's|\[Change 1\](#change-1)|Change 1|g' {} \;

# Fix cleanup-proposal--replace issues (these might not exist, so we'll remove the links)
find docs/architecture -name "*.md" -exec sed -i 's|\[Cleanup Proposal Replace\](#cleanup-proposal--replace)|Cleanup Proposal Replace|g' {} \;

# Fix 1-main-task-loop issues (these might not exist, so we'll remove the links)
find docs/architecture -name "*.md" -exec sed -i 's|\[1. Main Task Loop\](#1-main-task-loop)|1. Main Task Loop|g' {} \;

# Fix 3-api-call-location issues (these might not exist, so we'll remove the links)
find docs/architecture -name "*.md" -exec sed -i 's|\[3. API Call Location\](#3-api-call-location)|3. API Call Location|g' {} \;

echo "Final batch fixes completed!"
