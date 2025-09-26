# Skill Assessment Quiz

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

This quiz helps assess your current knowledge of KiloCode's documentation validation system and recommends appropriate training paths.

## Instructions
1. **Answer all questions honestly** - this helps us recommend the right training
2. **Don't worry about perfect scores** - the goal is to identify learning opportunities
3. **Take your time** - there's no time limit
4. **Use resources** - you can reference documentation while taking the quiz

## Assessment Categories

- **Basic Knowledge** (Questions 1-10)
- **Practical Skills** (Questions 11-20)
- **Advanced Concepts** (Questions 21-30)
- **Troubleshooting** (Questions 31-40)
- \*\*

## Basic Knowledge (Questions 1-10)

### Question 1

What is the primary purpose of documentation validation?

- *A)*\* To make documents look prettier\\
- *B)*\* To ensure consistency, quality, and maintainability\\
- *C)*\* To reduce file sizes\\
- *D)*\* To add more content

<details>
<summary>Answer</summary>
- *B)** To ensure consistency, quality, and maintainability

Documentation validation checks for syntax errors, style issues, link problems, and content quality to maintain high standards across all documentation.

</details>

### Question 2

Which VS Code extension provides real-time Markdown validation?

- *A)*\* Markdown Preview Enhanced\\
- *B)*\* Markdown All in One\\
- *C)*\* Markdown Shortcuts\\
- *D)*\* Markdown Table Formatter

<details>
<summary>Answer</summary>
- *B)** Markdown All in One

Markdown All in One provides real-time validation, formatting, and other Markdown editing features.

</details>

### Question 3

What command runs full documentation validation?

- *A)*\* `npm run validate`\\
- *B)*\* `pnpm docs:validate`\\
- *C)*\* `yarn docs:check`\\
- *D)*\* `npm test docs`

<details>
<summary>Answer</summary>
- *B)** `pnpm docs:validate`

This command runs the full validation suite on all documentation files.

</details>

### Question 4

What is the correct heading hierarchy in Markdown?

- *A)*\* H1 → H3 → H2 → H4\\
- *B)*\* H1 → H2 → H3 → H4\\
- *C)*\* H2 → H1 → H3 → H4\\
- *D)*\* Any order is fine

<details>
<summary>Answer</summary>
- *B)** H1 → H2 → H3 → H4

Headings should follow a logical hierarchy starting with H1 for the main title.

</details>

### Question 5

Which section is required in every KiloCode document?

- *A)*\* Introduction\\
- *B)*\* Research Context\\
- *C)*\* Summary\\
- *D)*\* Conclusion

<details>
<summary>Answer</summary>
- *B)** Research Context

Every KiloCode document must include a Research Context section to provide background information.

</details>

### Question 6

What does a non-descriptive link warning mean?

- *A)*\* The link is broken\\
- *B)*\* The link text is just a URL\\
- *C)*\* The link is too long\\
- *D)*\* The link is internal

<details>
<summary>Answer</summary>
- *B)** The link text is just a URL

Non-descriptive links use URLs as link text instead of meaningful descriptions.

</details>

### Question 7

Where can you see validation errors in VS Code?

- *A)*\* Output panel\\
- *B)*\* Problems panel\\
- *C)*\* Terminal\\
- *D)*\* Explorer

<details>
<summary>Answer</summary>
- *B)** Problems panel

The Problems panel shows all validation errors, warnings, and other issues.

</details>

### Question 8

What is the purpose of the navigation footer?

- *A)*\* To add page numbers\\
- *B)*\* To provide document navigation links\\
- *C)*\* To show the document title\\
- *D)*\* To add timestamps

<details>
<summary>Answer</summary>
- *B)** To provide document navigation links

The navigation footer helps users navigate between related documents and sections.

</details>

### Question 9

Which command auto-fixes common validation issues?

- *A)*\* `pnpm docs:fix`\\
- *B)*\* `pnpm docs:auto`\\
- *C)*\* `pnpm docs:repair`\\
- *D)*\* `pnpm docs:correct`

<details>
<summary>Answer</summary>
- *A)** `pnpm docs:fix`

This command automatically fixes many common validation issues.

</details>

### Question 10

What is the recommended workflow for documentation validation?

- *A)*\* Validate only before publishing\\
- *B)*\* Validate only when errors occur\\
- *C)*\* Validate early and often\\
- *D)*\* Validate only on Fridays

<details>
<summary>Answer</summary>
- *C)** Validate early and often

Regular validation helps catch and fix issues before they become problems.

</details>
- \*\*

## Practical Skills (Questions 11-20)

### Question 11

You see this error: "Missing required section 'Research Context'". What should you do?

- *A)*\* Ignore it\\
- *B)*\* Add a Research Context section\\
- *C)*\* Delete the document\\
- *D)*\* Rename an existing section

<details>
<summary>Answer</summary>
- *B)** Add a Research Context section

Add a proper Research Context section with relevant background information.

</details>

### Question 12

You have this link: `[https://example.com](https://example.com)`. How should you fix it?

- *A)*\* Remove the link entirely\\
- *B)*\* Change to `[Example Website](https://example.com)`\\
- *C)*\* Make it bold instead\\
- *D)*\* Add more text around it

<details>
<summary>Answer</summary>
- *B)** Change to `[Example Website](https://example.com)`

Use descriptive text instead of the URL for better accessibility and readability.

</details>

### Question 13

Your document has this structure:

```markdown
# Title

### Subsection

## Section
```

What's wrong?

- *A)*\* Nothing is wrong\\
- *B)*\* Subsection should be H2, not H3\\
- *C)*\* Section should be H1\\
- *D)*\* Title should be H2

<details>
<summary>Answer</summary>
- *B)** Subsection should be H2, not H3

The heading hierarchy should be H1 → H2 → H3, not H1 → H3 → H2.

</details>

### Question 14

You want to check if a specific file has validation errors. What command should you use?

- *A)*\* `pnpm docs:validate docs/specific-file.md`\\
- *B)*\* `pnpm docs:check docs/specific-file.md`\\
- *C)*\* `pnpm docs:test docs/specific-file.md`\\
- *D)*\* `pnpm docs:scan docs/specific-file.md`

<details>
<summary>Answer</summary>
- *A)** `pnpm docs:validate docs/specific-file.md`

You can run validation on specific files by providing the file path.

</details>

### Question 15

You see a warning about "missing navigation footer". What should you add?

- *A)*\* A table of contents\\
- *B)*\* `**Navigation**: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]`\\
- *C)*\* Page numbers\\
- *D)*\* A header with links

<details>
<summary>Answer</summary>
- *B)** `**Navigation**: [← Back to Parent] · [📚 Technical Glossary] · [↑ Table of Contents]`

This is the standard navigation footer format for KiloCode documents.

</details>

### Question 16

You're getting many validation errors. What's the best first step?

- *A)*\* Delete the document\\
- *B)*\* Run auto-fix first\\
- *C)*\* Start over completely\\
- *D)*\* Ignore all errors

<details>
<summary>Answer</summary>
- *B)** Run auto-fix first

Auto-fix can resolve many common issues quickly, then you can address remaining issues manually.

</details>

### Question 17

You want to see detailed validation output. What flag should you use?

- *A)*\* `--verbose`\\
- *B)*\* `--detailed`\\
- *C)*\* `--full`\\
- *D)*\* `--complete`

<details>
<summary>Answer</summary>
- *A)** `--verbose`

The `--verbose` flag provides detailed output for validation commands.

</details>

### Question 18

You have a long document (>500 words) but no table of contents. What should you do?

- *A)*\* Nothing - it's optional\\
- *B)*\* Add a table of contents\\
- *C)*\* Split the document\\
- *D)*\* Make it shorter

<details>
<summary>Answer</summary>
- *B)** Add a table of contents

Long documents should have a table of contents to help with navigation.

</details>

### Question 19

You see this error: "Broken internal link to 'nonexistent-file.md'". What should you do?

- *A)*\* Create the missing file\\
- *B)*\* Update the link to point to an existing file\\
- *C)*\* Remove the link\\
- *D)*\* All of the above

<details>
<summary>Answer</summary>
- *D)** All of the above

Depending on the situation, you might create the file, update the link, or remove it entirely.

</details>

### Question 20

You want to validate only files that have changed since your last commit. What should you do?

- *A)*\* Use `pnpm docs:validate --changed`\\
- *B)*\* Use `pnpm docs:validate --incremental`\\
- *C)*\* Use `pnpm docs:validate --modified`\\
- *D)*\* Use `pnpm docs:validate --recent`

<details>
<summary>Answer</summary>
- *B)** Use `pnpm docs:validate --incremental`

Incremental validation only checks files that have been modified.

</details>
- \*\*

## Advanced Concepts (Questions 21-30)

### Question 21

What is the purpose of custom validation rules?

- *A)*\* To make validation faster\\
- *B)*\* To enforce project-specific standards\\
- *C)*\* To reduce file sizes\\
- *D)*\* To add more features

<details>
<summary>Answer</summary>
- *B)** To enforce project-specific standards

Custom rules allow teams to enforce their specific documentation standards and requirements.

</details>

### Question 22

What is caching in validation context?

- *A)*\* Storing validation results to avoid re-processing\\
- *B)*\* Making files smaller\\
- *C)*\* Speeding up VS Code\\
- *D)*\* Storing backup files

<details>
<summary>Answer</summary>
- *A)** Storing validation results to avoid re-processing

Caching stores validation results so unchanged files don't need to be re-validated.

</details>

### Question 23

What is incremental validation?

- *A)*\* Validating files one at a time\\
- *B)*\* Validating only changed files\\
- *C)*\* Validating with reduced rules\\
- *D)*\* Validating in the background

<details>
<summary>Answer</summary>
- *B)** Validating only changed files

Incremental validation only processes files that have been modified since the last validation.

</details>

### Question 24

What is the purpose of pre-commit hooks in documentation?

- *A)*\* To automatically fix errors\\
- *B)*\* To prevent invalid documentation from being committed\\
- *C)*\* To backup files before committing\\
- *D)*\* To add timestamps to files

<details>
<summary>Answer</summary>
- *B)** To prevent invalid documentation from being committed

Pre-commit hooks run validation before allowing commits, ensuring only valid documentation is committed.

</details>

### Question 25

What is the difference between errors and warnings in validation?

- *A)*\* Errors are more serious than warnings\\
- *B)*\* Warnings are more serious than errors\\
- *C)*\* They are the same thing\\
- *D)*\* Errors are auto-fixable, warnings are not

<details>
<summary>Answer</summary>
- *A)** Errors are more serious than warnings

Errors are critical issues that must be fixed, while warnings are suggestions for improvement.

</details>

### Question 26

What is the purpose of validation reports?

- *A)*\* To show file sizes\\
- *B)*\* To provide detailed analysis of validation results\\
- *C)*\* To backup validation data\\
- *D)*\* To speed up validation

<details>
<summary>Answer</summary>
- *B)** To provide detailed analysis of validation results

Validation reports provide comprehensive analysis of validation results, trends, and recommendations.

</details>

### Question 27

What is the purpose of performance monitoring in validation?

- *A)*\* To make validation prettier\\
- *B)*\* To track and optimize validation speed and resource usage\\
- *C)*\* To count files\\
- *D)*\* To add timestamps

<details>
<summary>Answer</summary>
- *B)** To track and optimize validation speed and resource usage

Performance monitoring helps identify bottlenecks and optimize validation performance.

</details>

### Question 28

What is the purpose of link validation?

- *A)*\* To make links prettier\\
- *B)*\* To ensure all links work and are properly formatted\\
- *C)*\* To count links\\
- *D)*\* To add more links

<details>
<summary>Answer</summary>
- *B)** To ensure all links work and are properly formatted

Link validation checks that all links are accessible and follow proper formatting standards.

</details>

### Question 29

What is the purpose of content quality analysis?

- *A)*\* To count words\\
- *B)*\* To assess readability, consistency, and structure\\
- *C)*\* To make content shorter\\
- *D)*\* To add more content

<details>
<summary>Answer</summary>
- *B)** To assess readability, consistency, and structure

Content quality analysis evaluates how well-written and structured the documentation is.

</details>

### Question 30

What is the purpose of automated reporting?

- *A)*\* To replace manual validation\\
- *B)*\* To provide regular insights into documentation quality and trends\\
- *C)*\* To make validation faster\\
- *D)*\* To backup files

<details>
<summary>Answer</summary>
- *B)** To provide regular insights into documentation quality and trends

Automated reporting provides regular insights into documentation quality, trends, and areas for improvement.

</details>
- \*\*

## Troubleshooting (Questions 31-40)

### Question 31

Validation is not running in VS Code. What should you check first?

- *A)*\* File permissions\\
- *B)*\* VS Code extensions are installed and enabled\\
- *C)*\* File encoding\\
- *D)*\* File size

<details>
<summary>Answer</summary>
- *B)** VS Code extensions are installed and enabled

First check that the required Markdown extensions are installed and active.

</details>

### Question 32

Auto-fix is not working. What should you try?

- *A)*\* Restart VS Code\\
- *B)*\* Check markdownlint extension is active\\
- *C)*\* Try manual fix commands\\
- *D)*\* All of the above

<details>
<summary>Answer</summary>
- *D)** All of the above

Try all these solutions as they address different potential causes.

</details>

### Question 33

You're getting false positive link errors. What should you do?

- *A)*\* Ignore all link errors\\
- *B)*\* Check link validation configuration\\
- *C)*\* Remove all links\\
- *D)*\* Disable link validation

<details>
<summary>Answer</summary>
- *B)** Check link validation configuration

Review the link validation settings to ensure they're configured correctly for your environment.

</details>

### Question 34

Validation is very slow. What should you try?

- *A)*\* Disable all validation\\
- *B)*\* Use incremental validation\\
- *C)*\* Exclude large directories\\
- *D)*\* Both B and C

<details>
<summary>Answer</summary>
- *D)** Both B and C

Use incremental validation and exclude large directories to improve performance.

</details>

### Question 35

You're getting conflicting validation errors. What should you do?

- *A)*\* Ignore all errors\\
- *B)*\* Check for conflicting extensions or settings\\
- *C)*\* Delete the file\\
- *D)*\* Use a different editor

<details>
<summary>Answer</summary>
- *B)** Check for conflicting extensions or settings

Conflicting errors often indicate conflicting extensions or configuration settings.

</details>

### Question 36

You can't see validation errors in the Problems panel. What should you check?

- *A)*\* File permissions\\
- *B)*\* Problems panel is open and configured correctly\\
- *C)*\* File encoding\\
- *D)*\* File size

<details>
<summary>Answer</summary>
- *B)** Problems panel is open and configured correctly

Ensure the Problems panel is open and configured to show validation errors.

</details>

### Question 37

You're getting memory errors during validation. What should you do?

- *A)*\* Add more RAM\\
- *B)*\* Reduce batch size or use incremental validation\\
- *C)*\* Disable validation\\
- *D)*\* Use a different computer

<details>
<summary>Answer</summary>
- *B)** Reduce batch size or use incremental validation

Memory errors suggest the validation is processing too many files at once.

</details>

### Question 38

You're getting encoding errors. What should you check?

- *A)*\* File permissions\\
- *B)*\* File encoding (should be UTF-8)\\
- *C)*\* File size\\
- *D)*\* File location

<details>
<summary>Answer</summary>
- *B)** File encoding (should be UTF-8)

Encoding errors typically indicate files are not in UTF-8 format.

</details>

### Question 39

You're getting permission errors. What should you do?

- *A)*\* Run as administrator\\
- *B)*\* Check file permissions\\
- *C)*\* Move files to a different location\\
- *D)*\* All of the above

<details>
<summary>Answer</summary>
- *B)** Check file permissions

First check and fix file permissions before trying other solutions.

</details>

### Question 40

You're getting inconsistent validation results. What should you do?

- *A)*\* Ignore the inconsistency\\
- *B)*\* Check for multiple validation tools running\\
- *C)*\* Clear caches and restart\\
- *D)*\* Both B and C

<details>
<summary>Answer</summary>
- *D)** Both B and C

Inconsistent results often indicate multiple tools running or cached data issues.

</details>
- \*\*

## Scoring and Recommendations

### Scoring

- **40-36 points**: Expert level - Consider advanced training and mentoring others
- **35-31 points**: Advanced level - Focus on specialized training modules
- **30-26 points**: Intermediate level - Complete intermediate training modules
- **25-21 points**: Basic level - Complete basic training modules
- **20 or fewer**: Beginner level - Start with basic training and practice

### Recommended Training Paths

#### Beginner (0-20 points)
1. [Basic Validation Training](./BASIC_VALIDATION_TRAINING.md)
2. [VS Code Integration Training](./VSCODE_INTEGRATION_TRAINING.md)
3. Retake this quiz after completing training

#### Basic (21-25 points)
1. [Basic Validation Training](./BASIC_VALIDATION_TRAINING.md)
2. [VS Code Integration Training](./VSCODE_INTEGRATION_TRAINING.md)
3. [Team Workflow Training](./TEAM_WORKFLOW_TRAINING.md)

#### Intermediate (26-30 points)
1. [Custom Validation Rules Training](./CUSTOM_VALIDATION_RULES_TRAINING.md)
2. [Performance Optimization Training](./PERFORMANCE_OPTIMIZATION_TRAINING.md)
3. [Link Management Training](./LINK_MANAGEMENT_TRAINING.md)

#### Advanced (31-35 points)
1. [Troubleshooting Mastery](./TROUBLESHOOTING_MASTERY_TRAINING.md)
2. [Content Quality Training](./CONTENT_QUALITY_TRAINING.md)
3. Consider becoming a training facilitator

#### Expert (36-40 points)
1. Review any areas where you missed questions
2. Consider advanced specialized training
3. Help mentor other team members
4. Contribute to training material improvements

## Next Steps
1. **Review your answers** - Look at any questions you got wrong
2. **Follow the recommended training path** - Based on your score
3. **Practice regularly** - Use the interactive exercises
4. **Retake the quiz** - After completing training to measure progress
5. **Help others** - Share your knowledge with team members

## Resources
- [Training Materials Index](./TRAINING_MATERIALS_INDEX.md)
- [Validation Errors Guide](./VALIDATION_ERRORS_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
- [Interactive Exercises](./practice/)

## Navigation Footer

- *Navigation*\*: [← Back to Training Index](./TRAINING_MATERIALS_INDEX.md) · [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#skill-assessment-quiz)
