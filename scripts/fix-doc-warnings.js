#!/usr/bin/env node

/**
 * Systematic Documentation Warning Fixer
 *
 * Fixes common documentation warnings automatically:
 * 1. Fix research-context--next-steps anchor links
 * 2. Add missing navigation footer headings
 * 3. Fix list item indentation
 * 4. Fix other common heading anchor issues
 */

import { readFileSync, writeFileSync } from "fs"
import { glob } from "glob"
import path from "path"

const projectRoot = process.cwd()

async function fixDocumentationWarnings() {
	console.log("🔧 Starting systematic documentation warning fixes...")

	// Get all markdown files
	const files = await glob("docs/**/*.md", { cwd: projectRoot })

	let totalFixed = 0

	for (const file of files) {
		const filePath = path.join(projectRoot, file)
		const content = readFileSync(filePath, "utf8")
		let newContent = content
		let fileFixed = 0

		// Fix 1: research-context--next-steps anchor links
		if (newContent.includes("#research-context--next-steps")) {
			newContent = newContent.replace(/#research-context--next-steps/g, "#-research-context--next-steps")
			fileFixed++
		}

		// Fix 2: Add missing navigation footer headings
		if (newContent.includes("**Navigation**:") && !newContent.includes("## Navigation Footer")) {
			// Find the navigation line and add heading before it
			const navMatch = newContent.match(/(\n---\n\n\*\*Navigation\*\*:)/)
			if (navMatch) {
				newContent = newContent.replace(navMatch[1], "\n## Navigation Footer\n\n" + navMatch[1])
				fileFixed++
			}
		}

		// Fix 3: Fix list item indentation (3 spaces -> 1 space)
		if (file.includes("UI_CHAT_TASK_WINDOW.md")) {
			newContent = newContent.replace(/^   -/gm, "-")
			fileFixed++
		}

		// Fix 4: Fix other common heading anchor issues
		const headingFixes = [
			["#glossary", "#glossary"],
			["#documentation-automation-setup", "#documentation-automation-setup-guide"],
			["#duplicate-api-requests-troubleshooting", "#duplicate-api-requests-troubleshooting-guide"],
			["#duplicate-api-requests-root-cause-analysis", "#duplicate-api-requests---root-cause-analysis"],
			["#upstream-downstream-integration", "#upstreamdownstream-integration-guide"],
			["#orchestrator-lifecycle", "#orchestrator-task-lifecycle"],
			["#orchestrator-security-governance", "#orchestrator-security--governance"],
			["#5-documentation-map", "#documentation-map"],
			["#-navigation-map", "#️-navigation-map"],
			["#ui-chat-task-window", "#ui_chat_task_window"],
			["#onboarding-checklist", "#onboarding-checklist"],
			["#state-planning-tools", "#state--planning-tools"],
			["#integration-points", "#key-integration-points"],
			["#synchronization-implementation", "#synchronization-implementation"],
			["#state-management-tracking", "#state-management-tracking"],
			["#code-reference-matrix", "#code-reference-matrix"],
			["#implementation-timeline", "#implementation-timeline"],
			["#key-components", "#key-components"],
			["#tool-lifecycle-tracing", "#tool-lifecycle-tracing"],
			["#user-context-integration", "#user-context-integration"],
			["#session-tracking", "#session-tracking"],
			["#privacy-compliance", "#privacy-compliance"],
			["#error-handling", "#error-handling"],
			["#navigation", "#navigation"],
			["#architecture", "#architecture"],
			["#m-call-tracing", "#m-call-tracing"],
			["#costllm-call-tracing", "#costllm-call-tracing"],
			["#model-informationperformance-capture", "#model-informationperformance-capture"],
			["#experience-design", "#experience-design"],
			["#journey-validation", "#journey-validation"],
			["#implementation-examples", "#implementation-examples"],
			["#problem-description", "#problem-description"],
			["#root-cause-analysis", "#root-cause-analysis"],
			["#solution-recommendations", "#solution-recommendations"],
			["#testing-strategy", "#testing-strategy"],
			["#prevention-measures", "#prevention-measures"],
		]

		for (const [wrong, correct] of headingFixes) {
			if (newContent.includes(wrong)) {
				newContent = newContent.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), correct)
				fileFixed++
			}
		}

		// Write back if changed
		if (newContent !== content) {
			writeFileSync(filePath, newContent, "utf8")
			console.log(`✅ Fixed ${fileFixed} issues in ${file}`)
			totalFixed += fileFixed
		}
	}

	console.log(`\n🎉 Fixed ${totalFixed} issues across ${files.length} files`)
}

// Run the fixer
fixDocumentationWarnings().catch(console.error)
