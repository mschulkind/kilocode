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
        sed -i '/\*\*Purpose:\*\*/a\\n> **Geology Fun Fact**: Documentation standards are like the geological layers of the Earth - they provide structure, consistency, and help us understand the deeper history of our codebase! 🪨' "$file"
    fi
    
    # Add research context section before navigation footer or at the end
    if grep -q "Navigation Footer" "$file"; then
        # Insert research context before navigation footer
        sed -i '/## Navigation Footer/i\\n## 🔍 Research Context & Next Steps\n\n### When You'\''re Here, You Can:\n\n**Understanding Documentation Standards:**\n- **Next**: Check related standards documentation in the same directory\n- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Documentation Standards Guide](../../DOCUMENTATION_GUIDE.md) for context\n\n**Implementing Documentation Standards:**\n- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)\n- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns\n\n**Applying Standards to Documentation:**\n- **Next**: [Documentation Guide](../../DOCUMENTATION_GUIDE.md) → [Architecture Documentation](../architecture/README.md) → [Orchestrator Documentation](../orchestrator/README.md)\n- **Related**: [Race Condition Analysis](../architecture/race-condition/README.md) for current issues\n\n### No Dead Ends Policy\n\nEvery page provides clear next steps based on your research goals. If you'\''re unsure where to go next, return to [Standards Documentation](README.md) for guidance.\n' "$file"
    else
        # Add at the end of the file
        echo "" >> "$file"
        echo "## 🔍 Research Context & Next Steps" >> "$file"
        echo "" >> "$file"
        echo "### When You're Here, You Can:" >> "$file"
        echo "" >> "$file"
        echo "**Understanding Documentation Standards:**" >> "$file"
        echo "- **Next**: Check related standards documentation in the same directory" >> "$file"
        echo "- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Documentation Standards Guide](../../DOCUMENTATION_GUIDE.md) for context" >> "$file"
        echo "" >> "$file"
        echo "**Implementing Documentation Standards:**" >> "$file"
        echo "- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)" >> "$file"
        echo "- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns" >> "$file"
        echo "" >> "$file"
        echo "**Applying Standards to Documentation:**" >> "$file"
        echo "- **Next**: [Documentation Guide](../../DOCUMENTATION_GUIDE.md) → [Architecture Documentation](../architecture/README.md) → [Orchestrator Documentation](../orchestrator/README.md)" >> "$file"
        echo "- **Related**: [Race Condition Analysis](../architecture/race-condition/README.md) for current issues" >> "$file"
        echo "" >> "$file"
        echo "### No Dead Ends Policy" >> "$file"
        echo "" >> "$file"
        echo "Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to [Standards Documentation](README.md) for guidance." >> "$file"
        echo "" >> "$file"
        echo "---" >> "$file"
        echo "" >> "$file"
        echo "**Navigation**: [← Back to Standards Documentation](README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#research-context--next-steps)" >> "$file"
    fi
}

# Process standards files recursively
find docs/standards/ -name "*.md" -type f | while read file; do
    add_research_context "$file"
done

echo "Standards files improved!"
