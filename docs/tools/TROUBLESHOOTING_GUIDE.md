# Troubleshooting Guide

## When You're Here

This document is part of the KiloCode project documentation. If you're not familiar with this document's role or purpose, this section helps orient you.

- **Purpose**: This document covers \[DOCUMENT PURPOSE BASED ON FILE PATH].
- **Context**: Use this as a starting point or reference while navigating the project.
- **Navigation**: Use the table of contents below to jump to specific topics.

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

This guide helps you resolve common issues with KiloCode's documentation automation system.

## Common Issues

### 1. Validation Not Running

- *Symptoms:*\*
- No validation errors shown in VS Code
- `pnpm docs:validate` command fails
- No Problems panel entries

- *Diagnosis:*\*

```bash
# Check if remark is installed

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

npx remark --version

# Check configuration

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

cat .remarkrc

# Test with single file

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

npx remark docs/README.md
```

- *Solutions:*\*
1. **Install Dependencies**

   ```bash
   pnpm install
   ```
2. **Check VS Code Extensions**
- Ensure Markdown All in One is installed
- Verify markdownlint extension is active
- Reload VS Code window
3. **Verify Configuration**

   ```bash
   # Check .remarkrc exists and is valid
   cat .remarkrc

   # Test configuration
   npx remark --config .remarkrc docs/
   ```

### 2. Auto-fix Not Working

- *Symptoms:*\*
- Auto-fix on save doesn't work
- Manual fix commands fail
- Validation errors persist

- *Diagnosis:*\*

```bash
# Check VS Code settings

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

grep -A 5 "codeActionsOnSave" .vscode/settings.json

# Test manual fix

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

npx remark --use remark-stringify docs/
```

- *Solutions:*\*
1. **Enable Auto-fix**

   ```json
   {
   	"editor.codeActionsOnSave": {
   		"source.fixAll.markdownlint": "explicit"
   	}
   }
   ```
2. **Check Extension Status**
- Open Extensions panel
- Verify markdownlint is enabled
- Restart VS Code if needed
3. **Manual Fix**

   ```bash
   # Fix specific file
   npx remark --use remark-stringify docs/file.md

   # Fix all files
   npx remark --use remark-stringify docs/
   ```

### 3. Performance Issues

- *Symptoms:*\*
- Slow validation
- VS Code becomes unresponsive
- Long processing times

- *Diagnosis:*\*

```bash
# Check file counts

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

find docs/ -name "*.md" | wc -l

# Check file sizes

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

find docs/ -name "*.md" -exec wc -c {} + | sort -n
```

- *Solutions:*\*
1. **Exclude Large Directories**

   ```json
   {
   	"markdown.validate.ignore": ["**/node_modules/**", "**/dist/**", "**/out/**", "**/large-docs/**"]
   }
   ```
2. **Use Incremental Validation**

   ```bash
   # Only validate changed files
   git diff --name-only HEAD~1 | grep '\.md$' | xargs npx remark
   ```
3. **Optimize Configuration**
- Disable expensive rules for large files
- Use caching for repeated validations
- Process files in parallel

### 4. Link Validation Errors

- *Symptoms:*\*
- False positive broken links
- External links marked as broken
- Internal links not found

- *Diagnosis:*\*

```bash
# Check specific link

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

npx remark-validate-links docs/file.md

# Test external links

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

curl -I https://example.com
```

- *Solutions:*\*
1. **Internal Links**

   ```markdown
   <!-- Use relative paths -->

   [Link Text](./relative/path/file.md)

   <!-- Check file exists -->

   ls -la docs/relative/path/file.md
   ```
2. **External Links**

   ```markdown
   <!-- Use descriptive text -->

   [Example Website](https://example.com)

   <!-- Check if site is accessible -->

   curl -I https://example.com
   ```
3. **Configure Link Validation**
   ```json
   {
   	"remark-validate-links": {
   		"skipExternalLinks": true,
   		"skipInternalLinks": false
   	}
   }
   ```

### 5. Extension Conflicts

- *Symptoms:*\*
- Multiple validation errors
- Conflicting rules
- Inconsistent behavior

- *Diagnosis:*\*

```bash
# Check installed extensions

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

code --list-extensions | grep -i markdown

# Check for conflicting settings

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

grep -r "markdown" .vscode/
```

- *Solutions:*\*
1. **Disable Conflicting Extensions**
- Keep only Markdown All in One and markdownlint
- Disable other markdown extensions temporarily
2. **Resolve Settings Conflicts**

   ```json
   {
   	"markdownlint.config": {
   		"MD013": false,
   		"MD033": false
   	}
   }
   ```
3. **Reset Configuration**

   ```bash
   # Backup current settings
   cp .vscode/settings.json .vscode/settings.json.backup

   # Reset to defaults
   git checkout .vscode/settings.json
   ```

## Advanced Troubleshooting

### 1. Debug Mode

- *Enable Debug Logging:*\*

```bash
# Set debug environment

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

export DEBUG=remark*

# Run validation with debug output

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

npx remark docs/ --verbose
```

- *VS Code Debug:*\*
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Developer: Toggle Developer Tools"
3. Check Console for error messages
4. Look for "remark" or "markdownlint" entries

### 2. Configuration Issues

- *Check .remarkrc:*\*

```bash
# Validate JSON syntax

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

cat .remarkrc | jq .

# Test configuration

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

npx remark --config .remarkrc docs/
```

- *Check Package.json:*\*

```bash
# Verify scripts exist

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

grep -A 10 "docs:" package.json

# Check dependencies

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

pnpm list | grep remark
```

### 3. File System Issues

- *Permissions:*\*

```bash
# Check file permissions

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

ls -la docs/

# Fix permissions if needed

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

chmod -R 644 docs/
```

- *Encoding Issues:*\*

```bash
# Check file encoding

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

file docs/file.md

# Convert if needed

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

iconv -f ISO-8859-1 -t UTF-8 docs/file.md > docs/file-utf8.md
```

## Getting Help

### 1. Self-Diagnosis

- *Check These First:*\*
- \[ ] Dependencies installed: `pnpm install`
- \[ ] VS Code extensions active
- \[ ] Configuration files valid
- \[ ] File permissions correct
- \[ ] No conflicting extensions

### 2. Log Analysis

- *VS Code Logs:*\*
1. Help → Toggle Developer Tools
2. Console tab
3. Look for error messages
4. Check network requests

- *Terminal Logs:*\*

```bash
# Run with verbose output

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

npx remark docs/ --verbose

# Check for specific errors

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

npx remark docs/ 2>&1 | grep -i error
```

### 3. Team Support

- *Before Asking for Help:*\*
1. Check this troubleshooting guide
2. Try the suggested solutions
3. Gather error messages and logs
4. Document steps to reproduce

- *When Asking for Help:*\*
- Include error messages
- Describe what you were trying to do
- Share relevant configuration
- Mention what you've already tried

## Prevention

### 1. Regular Maintenance

- *Weekly:*\*
- Run `pnpm docs:validate`
- Check for new validation errors
- Update outdated links
- Review team feedback

- *Monthly:*\*
- Review configuration settings
- Update dependencies
- Check extension compatibility
- Optimize performance

### 2. Best Practices

- *File Management:*\*
- Use consistent naming
- Keep files organized
- Regular cleanup
- Version control properly

- *Configuration:*\*
- Document custom settings
- Test changes before committing
- Keep configurations simple
- Regular backups

### 3. Team Training

- *New Members:*\*
- Complete onboarding checklist
- Review best practices
- Practice with sample files
- Ask questions early

- *Regular Updates:*\*
- Share new features
- Update procedures
- Review common issues
- Improve processes

## Related Documentation
- [Remark Workflow Overview](./REMARK_WORKFLOW_OVERVIEW.md)
- [Validation Errors Guide](./VALIDATION_ERRORS_GUIDE.md)
- [IDE Integration Guide](./IDE_INTEGRATION_GUIDE.md)
- [Documentation Best Practices](./DOCUMENTATION_BEST_PRACTICES.md)
- [Documentation Guide](../../DOCUMENTATION_GUIDE.md)

## Navigation Footer
- \*\*

- *Navigation*\*: [docs](../) · [tools](./) ·
  [↑ Table of Contents](#troubleshooting-guide)
