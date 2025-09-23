#!/bin/bash

# Function to add research context to a file
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
    
    echo "Improving: $file"
    
    # Add fun fact if not present
    if ! grep -q "Fun Fact" "$file"; then
        # Add a fun fact after the purpose line
        sed -i '/\*\*Purpose:\*\*/a\\n> **Biology Fun Fact**: Services are like specialized organs in a living organism - each has a specific function, but they all work together to keep the system healthy and functioning! 🧬' "$file"
    fi
    
    # Add research context section before navigation footer or at the end
    if grep -q "Navigation Footer" "$file"; then
        # Insert research context before navigation footer
        sed -i '/## Navigation Footer/i\\n## 🔍 Research Context & Next Steps\n\n### When You'\''re Here, You Can:\n\n**Understanding Service Architecture:**\n- **Next**: Check related services documentation in the same directory\n- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Services Documentation](README.md) for context\n\n**Implementing Service Features:**\n- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)\n- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns\n\n**Troubleshooting Service Issues:**\n- **Next**: [Race Condition Analysis](../architecture/race-condition/README.md) → [Root Cause Analysis](../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md)\n- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues\n\n### No Dead Ends Policy\n\nEvery page provides clear next steps based on your research goals. If you'\''re unsure where to go next, return to [Services Documentation](README.md) for guidance.\n' "$file"
    else
        # Add at the end of the file
        echo "" >> "$file"
        echo "## 🔍 Research Context & Next Steps" >> "$file"
        echo "" >> "$file"
        echo "### When You're Here, You Can:" >> "$file"
        echo "" >> "$file"
        echo "**Understanding Service Architecture:**" >> "$file"
        echo "- **Next**: Check related services documentation in the same directory" >> "$file"
        echo "- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Services Documentation](README.md) for context" >> "$file"
        echo "" >> "$file"
        echo "**Implementing Service Features:**" >> "$file"
        echo "- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)" >> "$file"
        echo "- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns" >> "$file"
        echo "" >> "$file"
        echo "**Troubleshooting Service Issues:**" >> "$file"
        echo "- **Next**: [Race Condition Analysis](../architecture/race-condition/README.md) → [Root Cause Analysis](../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md)" >> "$file"
        echo "- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues" >> "$file"
        echo "" >> "$file"
        echo "### No Dead Ends Policy" >> "$file"
        echo "" >> "$file"
        echo "Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to [Services Documentation](README.md) for guidance." >> "$file"
        echo "" >> "$file"
        echo "---" >> "$file"
        echo "" >> "$file"
        echo "**Navigation**: [← Back to Services Documentation](README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#research-context--next-steps)" >> "$file"
    fi
}

# Process services files
for file in docs/services/*.md; do
    if [[ -f "$file" ]]; then
        add_research_context "$file"
    fi
done

echo "Services files improved!"
