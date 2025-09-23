# Kilo Code Project Brief

## Project Overview

Kilo Code is an LLM-powered coding agent plugin designed for Visual Studio Code (VSCode). It serves as an AI assistant that helps developers with coding tasks, providing intelligent suggestions, code generation, and automation within the VSCode environment.

## Current Status

- **Customization Phase**: The project is currently being customized for personal use by the developer.
- **Improvement Focus**: Active efforts to fix bugs, enhance functionality, and improve overall performance.
- **Development State**: Contains lots of testing code and rough implementations as part of ongoing development and experimentation.

## Goals and Objectives

- **Personal Customization**: Adapt the plugin to meet specific workflow needs and preferences.
- **Quality Improvements**: Identify and resolve issues, optimize performance, and enhance user experience.
- **Feature Enhancements**: Add new capabilities and refine existing ones based on usage and feedback.
- **Stability**: Move from rough/testing state to a more polished and reliable tool.

## Key Features

- AI-powered code assistance and generation
- Integration with VSCode's development environment
- Support for multiple programming languages and frameworks
- Customizable settings and configurations
- [NOTE: Add specific features here - e.g., code completion, refactoring, debugging assistance, etc.]

## Architecture

- **Platform**: VSCode Extension
- **Frontend**: Webview UI (likely React-based, given the webview-ui/ directory)
- **Backend**: Node.js/TypeScript core (src/ directory)
- **Packages**: Modular components in packages/ (e.g., types, shared utilities)
- **Build System**: Uses pnpm for package management, with workspaces
- **Testing**: Vitest framework for unit and integration tests
- [NOTE: Provide more details on architecture - e.g., how the LLM integration works, data flow, key components]

## Technologies Used

- **Languages**: TypeScript, JavaScript
- **Frameworks**: VSCode Extension API, possibly React for UI
- **Tools**: pnpm, Vitest, ESLint, Prettier
- **LLM Providers**: Support for multiple AI models (anthropic, openai, etc., based on providers/)
- [NOTE: Confirm and list all technologies]

## Development Environment

- **IDE**: Visual Studio Code
- **Version Control**: Git
- **CI/CD**: GitHub Actions (based on .github/ directory)
- **Linting/Formatting**: ESLint, Prettier
- **Testing**: Vitest with coverage requirements

## Current Challenges

- Rough/testing code that needs cleanup
- Ongoing bug fixes and improvements
- Balancing customization with maintainability
- [NOTE: Add specific challenges or pain points]

## Roadmap

- Complete personal customizations
- Stabilize core functionality
- Expand feature set based on needs
- Improve testing coverage and reliability
- [NOTE: Add planned milestones or future goals]

## Notes for ConPort Integration

This expanded brief provides a foundation for importing into ConPort's Product Context. The flexible JSON structure can accommodate additional fields as the project evolves. Key areas for ongoing updates include feature lists, architecture details, and roadmap items.
