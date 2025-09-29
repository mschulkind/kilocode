/**
 * DocumentTypeDetector Test Suite
 *
 * Tests for the context-aware document type detection system that identifies
 * document types based on path, content, and structure.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { DocumentTypeDetector, DocumentType, DocumentTypeConfig } from "../DocumentTypeDetector.js"

describe("DocumentTypeDetector", () => {
	let detector: DocumentTypeDetector

	beforeEach(() => {
		detector = new DocumentTypeDetector()
	})

	describe("constructor", () => {
		it("should initialize with default configuration", () => {
			expect(detector.getConfig()).toBeDefined()
			expect(detector.getConfig().types).toHaveProperty("navigation")
			expect(detector.getConfig().types).toHaveProperty("technical")
			expect(detector.getConfig().types).toHaveProperty("planning")
		})

		it("should allow custom configuration", () => {
			const customConfig: DocumentTypeConfig = {
				types: {
					custom: {
						name: "Custom Type",
						pathPatterns: ["**/custom/**"],
						contentPatterns: ["custom content"],
						structurePatterns: ["# Custom Header"],
						priority: 1,
					},
				},
				fallback: "custom",
			}

			const customDetector = new DocumentTypeDetector(customConfig)
			const config = customDetector.getConfig()
			expect(config.types.custom).toEqual(customConfig.types.custom)
			expect(config.fallback).toBe("custom")
		})
	})

	describe("detectType", () => {
		it("should detect navigation documents by path", () => {
			const result = detector.detectType("/docs/README.md", "", "")
			expect(result.type).toBe("navigation")
			expect(result.confidence).toBeGreaterThanOrEqual(0.8)
			expect(result.reasons).toContain("path-pattern")
		})

		it("should detect technical documents by path", () => {
			const result = detector.detectType("/docs/api/reference.md", "", "")
			expect(result.type).toBe("technical")
			expect(result.confidence).toBeGreaterThan(0.7)
			expect(result.reasons).toContain("path-pattern")
		})

		it("should detect planning documents by path", () => {
			const result = detector.detectType("/plans/project-plan.md", "", "")
			expect(result.type).toBe("planning")
			expect(result.confidence).toBeGreaterThan(0.7)
			expect(result.reasons).toContain("path-pattern")
		})

		it("should detect document type by content", () => {
			const content = `
# API Reference

## Endpoints

### GET /users
Returns a list of users.

### POST /users
Creates a new user.
      `

			const result = detector.detectType("/docs/some-file.md", content, "")
			expect(result.type).toBe("technical")
			expect(result.confidence).toBeGreaterThanOrEqual(0.4)
			expect(result.reasons).toContain("content-pattern")
		})

		it("should detect document type by structure", () => {
			const content = `
# Project Roadmap

## Timeline
- Week 1: Planning
- Week 2: Implementation
- Week 3: Testing

## Milestones
- Planning phase complete
- Implementation phase complete
- Testing phase complete

## Objectives
- Improve user experience
- Increase performance
      `

			const result = detector.detectType("/docs/project.md", content, "")
			expect(result.type).toBe("planning")
			expect(result.confidence).toBeGreaterThan(0.5)
			expect(result.reasons).toContain("content-pattern")
		})

		it("should combine multiple detection methods for higher confidence", () => {
			const content = `
# Getting Started

## Quick Start
Follow these steps to get started.

## Installation
1. Clone the repository
2. Install dependencies
3. Run the application

## Configuration
Set up your configuration file.
      `

			const result = detector.detectType("/docs/README.md", content, "")
			expect(result.type).toBe("navigation")
			expect(result.confidence).toBeGreaterThanOrEqual(0.8)
			expect(result.reasons.length).toBeGreaterThan(1)
		})

		it("should fallback to general type when no patterns match", () => {
			const content = `
# Random Document

Some random content that doesn't match any patterns.
      `

			const result = detector.detectType("/random/file.md", content, "")
			expect(result.type).toBe("general")
			expect(result.confidence).toBeLessThan(0.5)
		})

		it("should handle empty content gracefully", () => {
			const result = detector.detectType("/docs/file.md", "", "")
			expect(result.type).toBeDefined()
			expect(result.confidence).toBeGreaterThanOrEqual(0)
		})

		it("should handle malformed paths gracefully", () => {
			const result = detector.detectType("", "", "")
			expect(result.type).toBeDefined()
			expect(result.confidence).toBeGreaterThanOrEqual(0)
		})
	})

	describe("getTypeInfo", () => {
		it("should return type information for valid types", () => {
			const navInfo = detector.getTypeInfo("navigation")
			expect(navInfo).toBeDefined()
			expect(navInfo?.name).toBe("Navigation Document")
			expect(navInfo?.description).toBeDefined()
		})

		it("should return null for invalid types", () => {
			const invalidInfo = detector.getTypeInfo("invalid-type")
			expect(invalidInfo).toBeNull()
		})
	})

	describe("getAllTypes", () => {
		it("should return all configured types", () => {
			const types = detector.getAllTypes()
			expect(types).toContain("navigation")
			expect(types).toContain("technical")
			expect(types).toContain("planning")
			expect(types).toContain("general")
		})
	})

	describe("updateConfig", () => {
		it("should update configuration", () => {
			const newConfig: DocumentTypeConfig = {
				types: {
					custom: {
						name: "Custom Type",
						pathPatterns: ["**/custom/**"],
						contentPatterns: [],
						structurePatterns: [],
						priority: 1,
					},
				},
				fallback: "custom",
			}

			detector.updateConfig(newConfig)
			const config = detector.getConfig()
			expect(config.types.custom).toEqual(newConfig.types.custom)
			expect(config.fallback).toBe("custom")
		})

		it("should validate configuration", () => {
			const invalidConfig = {
				types: {},
				fallback: "invalid-type",
			}

			expect(() => {
				detector.updateConfig(invalidConfig as any)
			}).toThrow()
		})
	})

	describe("path-based detection", () => {
		it("should detect README files as navigation", () => {
			const testPaths = ["/README.md", "/docs/README.md", "/src/README.md", "README.md"]

			testPaths.forEach((path) => {
				const result = detector.detectType(path, "", "")
				expect(result.type).toBe("navigation")
			})
		})

		it("should detect API documentation as technical", () => {
			const testPaths = ["/docs/api/reference.md", "/api/docs.md", "/docs/reference/api.md", "/api-guide.md"]

			testPaths.forEach((path) => {
				const result = detector.detectType(path, "", "")
				expect(result.type).toBe("technical")
			})
		})

		it("should detect planning documents", () => {
			const testPaths = ["/plans/project-plan.md", "/docs/roadmap.md", "/planning/strategy.md", "/roadmap.md"]

			testPaths.forEach((path) => {
				const result = detector.detectType(path, "", "")
				expect(result.type).toBe("planning")
			})
		})
	})

	describe("content-based detection", () => {
		it("should detect API documentation by content keywords", () => {
			const apiContent = `
# API Documentation

## Authentication
All API requests require authentication.

## Endpoints

### Users
- GET /users - List users
- POST /users - Create user
- PUT /users/:id - Update user
- DELETE /users/:id - Delete user

## Response Format
All responses are in JSON format.
      `

			const result = detector.detectType("/docs/api.md", apiContent, "")
			expect(result.type).toBe("technical")
			expect(result.confidence).toBeGreaterThanOrEqual(0.5)
		})

		it("should detect getting started guides", () => {
			const gettingStartedContent = `
# Getting Started

Welcome to our application! This guide will help you get up and running quickly.

## Installation
1. Download the application
2. Install dependencies
3. Configure settings
4. Start the application

## First Steps
After installation, you can:
- Create your first project
- Explore the interface
- Read the documentation
      `

			const result = detector.detectType("/docs/guide.md", gettingStartedContent, "")
			expect(result.type).toBe("navigation")
			expect(result.confidence).toBeGreaterThan(0.6)
		})

		it("should detect project plans", () => {
			const planContent = `
# Project Plan

## Objectives
The main objectives of this project are:
- Improve user experience
- Increase performance
- Add new features

## Timeline
- Phase 1 (Week 1-2): Planning and design
- Phase 2 (Week 3-6): Implementation
- Phase 3 (Week 7-8): Testing and deployment

## Resources
- Development team: 3 developers
- Budget: $50,000
- Timeline: 8 weeks
      `

			const result = detector.detectType("/docs/project.md", planContent, "")
			expect(result.type).toBe("planning")
			expect(result.confidence).toBeGreaterThan(0.6)
		})
	})

	describe("structure-based detection", () => {
		it("should detect navigation structure", () => {
			const navStructure = `
# Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
      `

			const result = detector.detectType("/docs/index.md", navStructure, "")
			expect(result.type).toBe("navigation")
			expect(result.confidence).toBeGreaterThan(0.6)
		})

		it("should detect technical documentation structure", () => {
			const techStructure = `
# Function Reference

## Classes

### UserManager
Manages user operations.

#### Methods
- createUser(data)
- updateUser(id, data)
- deleteUser(id)

## Functions

### validateEmail(email)
Validates email format.
      `

			const result = detector.detectType("/docs/reference.md", techStructure, "")
			expect(result.type).toBe("technical")
			expect(result.confidence).toBeGreaterThan(0.6)
		})
	})

	describe("confidence scoring", () => {
		it("should provide higher confidence for multiple matching patterns", () => {
			const highConfidenceContent = `
# API Reference

## Endpoints

### Authentication
All requests require a valid API key.

### Users API
- GET /users
- POST /users
- PUT /users/:id
- DELETE /users/:id

## Response Format
All responses are in JSON format.
      `

			const result = detector.detectType("/docs/api/reference.md", highConfidenceContent, "")
			expect(result.confidence).toBeGreaterThan(0.8)
		})

		it("should provide lower confidence for weak matches", () => {
			const weakContent = `
# Some Document

This document doesn't strongly match any patterns.
      `

			const result = detector.detectType("/random/file.md", weakContent, "")
			expect(result.confidence).toBeLessThan(0.6)
		})
	})

	describe("edge cases", () => {
		it("should handle very long content", () => {
			const longContent = "# Document\n" + "Content line\n".repeat(10000)
			const result = detector.detectType("/docs/long.md", longContent, "")
			expect(result.type).toBeDefined()
			expect(result.confidence).toBeGreaterThanOrEqual(0)
		})

		it("should handle content with special characters", () => {
			const specialContent = `
# Document with Special Characters

## Section 1: @#$%^&*()
Some content with special characters.

## Section 2: Unicode 🚀
Content with unicode characters.
      `

			const result = detector.detectType("/docs/special.md", specialContent, "")
			expect(result.type).toBeDefined()
			expect(result.confidence).toBeGreaterThanOrEqual(0)
		})

		it("should handle malformed markdown", () => {
			const malformedContent = `
# Document

## Unclosed heading
Content without proper closing

### Another heading
More content

## Missing closing
      `

			const result = detector.detectType("/docs/malformed.md", malformedContent, "")
			expect(result.type).toBeDefined()
			expect(result.confidence).toBeGreaterThanOrEqual(0)
		})
	})
})
