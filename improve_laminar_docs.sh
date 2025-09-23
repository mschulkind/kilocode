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
        sed -i '/\*\*Purpose:\*\*/a\\n> **Quantum Physics Fun Fact**: Laminar observability is like quantum entanglement - it creates instant connections between distant parts of the system, allowing us to observe the entire state from any single point! ⚛️' "$file"
    fi
    
    # Add research context section before navigation footer or at the end
    if grep -q "Navigation Footer" "$file"; then
        # Insert research context before navigation footer
        sed -i '/## Navigation Footer/i\\n## 🔍 Research Context & Next Steps\n\n### When You'\''re Here, You Can:\n\n**Understanding Laminar Observability:**\n- **Next**: Check related Laminar documentation in the same directory\n- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Laminar Documentation](README.md) for context\n\n**Implementing Observability Features:**\n- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)\n- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns\n\n**Troubleshooting Observability Issues:**\n- **Next**: [Race Condition Analysis](../architecture/race-condition/README.md) → [Root Cause Analysis](../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md)\n- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues\n\n### No Dead Ends Policy\n\nEvery page provides clear next steps based on your research goals. If you'\''re unsure where to go next, return to [Laminar Documentation](README.md) for guidance.\n' "$file"
    else
        # Add at the end of the file
        echo "" >> "$file"
        echo "## 🔍 Research Context & Next Steps" >> "$file"
        echo "" >> "$file"
        echo "### When You're Here, You Can:" >> "$file"
        echo "" >> "$file"
        echo "**Understanding Laminar Observability:**" >> "$file"
        echo "- **Next**: Check related Laminar documentation in the same directory" >> "$file"
        echo "- **Related**: [Technical Glossary](../../GLOSSARY.md) for terminology, [Laminar Documentation](README.md) for context" >> "$file"
        echo "" >> "$file"
        echo "**Implementing Observability Features:**" >> "$file"
        echo "- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) → [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)" >> "$file"
        echo "- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns" >> "$file"
        echo "" >> "$file"
        echo "**Troubleshooting Observability Issues:**" >> "$file"
        echo "- **Next**: [Race Condition Analysis](../architecture/race-condition/README.md) → [Root Cause Analysis](../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md)" >> "$file"
        echo "- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues" >> "$file"
        echo "" >> "$file"
        echo "### No Dead Ends Policy" >> "$file"
        echo "" >> "$file"
        echo "Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to [Laminar Documentation](README.md) for guidance." >> "$file"
        echo "" >> "$file"
        echo "---" >> "$file"
        echo "" >> "$file"
        echo "**Navigation**: [← Back to Laminar Documentation](README.md) · [📚 Technical Glossary](../../GLOSSARY.md) · [↑ Table of Contents](#research-context--next-steps)" >> "$file"
    fi
}

# Process laminar files
for file in docs/laminar/*.md; do
    if [[ -f "$file" ]]; then
        add_research_context "$file"
    fi
done

echo "Laminar files improved!"
