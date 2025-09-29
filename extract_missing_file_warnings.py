#!/usr/bin/env python3

import re
import sys

# Read the validation log
with open('docs_validate_clean.log', 'r') as f:
    content = f.read()

# Find files with missing-file warnings
current_file = None
files_with_missing_file = set()

lines = content.split('\n')
for line in lines:
    # Check if this is a file header line (with exact ANSI color codes)
    file_match = re.match(r'^\[4m\[33m(docs/.*\.md)\[39m\[24m$', line)
    if file_match:
        current_file = file_match.group(1)
    
    # Check if this line has a missing-file warning
    if 'missing-file' in line and current_file:
        files_with_missing_file.add(current_file)

# Print the files
files_list = sorted(list(files_with_missing_file))
print(f"Found {len(files_list)} files with missing-file warnings")
for i, file in enumerate(files_list[:30]):  # First 30 files
    print(f"{i+1:2d}: {file}")
