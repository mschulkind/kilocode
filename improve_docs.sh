#!/bin/bash

# Function to add research context section to a file
add_research_context() {
    local file="$1"
    local dir_name=$(dirname "$file")
    local base_name=$(basename "$file" .md)
    
    # Skip if already has research context
    if grep -q "Research Context & Next Steps" "$file"; then
        return 0
    fi
    
    # Skip README files (they already have good navigation)
    if [[ "$base_name" == "README" ]]; then
        return 0
    fi
    
    # Skip glossary
    if [[ "$base_name" == "GLOSSARY" ]]; then
        return 0
    fi
    
    # Skip documentation guide
    if [[ "$base_name" == "DOCUMENTATION_GUIDE" ]]; then
        return 0
    fi
    
    echo "Improving: $file"
    
    # Add fun fact if not present
    if ! grep -q "Fun Fact" "$file"; then
        # Add a fun fact after the purpose line
        sed -i '/\*\*Purpose:\*\*/a\\n> **Dinosaur Fun Fact**: This documentation is like a dinosaur fossil - each layer reveals more about the ancient (code) history, helping us understand how the system evolved! 🦕' "$file"
    fi
    
    # Add research context section before navigation footer
    if grep -q "Navigation Footer" "$file"; then
        # Insert research context before navigation footer
        sed -i '/## Navigation Footer/i\\n## 🔍 Research Context & Next Steps\n\n### When You'\''re Here, You Can:\n\n**Understanding This System:**\n- **Next**: Check related documentation in the same directory\n- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Architecture Documentation](../README.md) for context\n\n**Implementing Features:**\n- **Next**: [Repository Development Guide](../repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](../repository/TESTING_INFRASTRUCTURE.md)\n- **Related**: [Orchestrator Documentation](../../orchestrator/README.md) for integration patterns\n\n**Troubleshooting Issues:**\n- **Next**: [Race Condition Analysis](../race-condition/README.md) → [Root Cause Analysis](../race-condition/ROOT_CAUSE_ANALYSIS.md)\n- **Related**: [Orchestrator Error Handling](../../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues\n\n### No Dead Ends Policy\n\nEvery page provides clear next steps based on your research goals. If you'\''re unsure where to go next, return to [Architecture Documentation](../README.md) for guidance.\n' "$file"
    fi
    
    # Update navigation footer to use new format
    sed -i 's/Back: \[`INDEX\.md`\](INDEX\.md)/Back: [← Back to Architecture Documentation](..\/README.md)/g' "$file"
    sed -i 's/Root: \[`\.\.\/INDEX\.md`\](\.\.\/INDEX\.md)/Root: [📚 Technical Glossary](..\/..\/GLOSSARY.md)/g' "$file"
    sed -i 's/Source: `\/docs\/architecture\/[^`]*`/Source: [↑ Table of Contents](#research-context--next-steps)/g' "$file"
}

# Process all architecture files
for file in docs/architecture/*.md; do
    if [[ -f "$file" ]]; then
        add_research_context "$file"
    fi
done

echo "Architecture files improved!"
