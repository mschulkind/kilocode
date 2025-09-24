# External Dependencies

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

**Purpose:** Comprehensive catalog of all external dependencies, libraries, and conventions for
using them in the KiloCode project.

> **Biology Fun Fact**: External dependencies are like symbiotic relationships in nature - each
> library provides specific functionality (like how mitochondria provide energy), and together they
> create a thriving ecosystem! 🧬

<details><summary>Table of Contents</summary>

- [Executive Summary](#executive-summary)
- [AI/ML & Language Models](#aiml--language-models)
- [Model Context Protocol (MCP)](#model-context-protocol-mcp)
- [Cloud & Authentication](#cloud--authentication)
- [Code Analysis & Processing](#code-analysis--processing)
- [File Processing & Formats](#file-processing--formats)
- [UI & Frontend (Webview)](#ui--frontend-webview)
- [Development Tools & Build](#development-tools--build)
- [Utilities & Helpers](#utilities--helpers)
- [Dependency Management](#dependency-management)
- [Security & Conventions](#security--conventions)
- Navigation Footer

</details>

## Executive Summary

## Research Context

**Purpose:** \[Describe the purpose and scope of this document]

**Background:** \[Provide relevant background information]

**Research Questions:** \[List key questions this document addresses]

**Methodology:** \[Describe the approach or methodology used]

**Findings:** \[Summarize key findings or conclusions]

---

_The KiloCode project utilizes over 100 external dependencies across multiple categories, from AI/ML
libraries to UI frameworks, with strict version management and security conventions._

**Key Statistics:**

- **Total Dependencies**: 100+ external libraries
- **AI/ML Libraries**: 10+ language model integrations
- **UI Components**: 20+ React and UI libraries
- **Build Tools**: 15+ development and build utilities
- **Security Overrides**: 5+ security-critical dependency overrides

## AI/ML & Language Models

### Primary AI Providers

| Library                        | Version | Purpose                            | Usage Pattern                         |
| ------------------------------ | ------- | ---------------------------------- | ------------------------------------- |
| `@anthropic-ai/sdk`            | ^0.51.0 | Anthropic Claude API integration   | Primary AI provider for Claude models |
| `@anthropic-ai/bedrock-sdk`    | ^0.22.0 | AWS Bedrock Anthropic integration  | Cloud AI deployment via AWS           |
| `@anthropic-ai/vertex-sdk`     | ^0.11.3 | Google Cloud Anthropic integration | Enterprise AI deployment via GCP      |
| `openai`                       | ^5.12.2 | OpenAI API integration             | GPT models support and integration    |
| `@google/genai`                | ^1.0.0  | Google Gemini API integration      | Gemini models support                 |
| `@mistralai/mistralai`         | ^1.9.18 | Mistral AI integration             | Mistral models support                |
| `@lmstudio/sdk`                | ^1.1.1  | LM Studio integration              | Local model support                   |
| `@cerebras/cerebras_cloud_sdk` | ^1.35.0 | Cerebras AI integration            | Specialized AI models                 |
| `ollama`                       | ^0.5.17 | Ollama local models                | Local AI deployment and management    |
| `tiktoken`                     | ^1.0.21 | Token counting and encoding        | Token management and counting         |

### AI Integration Patterns

**Provider Abstraction:**

```typescript
// Common interface for all AI providers
interface AIProvider {
	generateResponse(prompt: string, options: GenerationOptions): Promise<AIResponse>
	streamResponse(prompt: string, options: GenerationOptions): AsyncIterable<AIChunk>
}

// Provider factory pattern
class ProviderFactory {
	static createProvider(type: ProviderType): AIProvider {
		switch (type) {
			case "anthropic":
				return new AnthropicProvider()
			case "openai":
				return new OpenAIProvider()
			case "google":
				return new GoogleProvider()
			// ... other providers
		}
	}
}
```

**Token Management:**

```typescript
// Token counting and management
import { encoding_for_model } from "tiktoken"

const encoding = encoding_for_model("gpt-4")
const tokenCount = encoding.encode(prompt).length
```

## Model Context Protocol (MCP)

### MCP Integration Libraries

| Library                     | Version | Purpose                     | Usage Pattern                  |
| --------------------------- | ------- | --------------------------- | ------------------------------ |
| `@modelcontextprotocol/sdk` | 1.12.0  | MCP protocol implementation | Core MCP functionality         |
| `@qdrant/js-client-rest`    | ^1.14.0 | Vector database integration | Semantic search and embeddings |

### MCP Implementation Patterns

**Server Integration:**

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

const server = new Server({
	name: "kilocode-mcp-server",
	version: "1.0.0",
})

// Tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "write_file",
				description: "Write content to a file",
				inputSchema: {
					type: "object",
					properties: {
						path: { type: "string" },
						content: { type: "string" },
					},
				},
			},
		],
	}
})
```

**Vector Database Integration:**

```typescript
import { QdrantClient } from "@qdrant/js-client-rest"

const client = new QdrantClient({ url: "http://localhost:6333" })

// Embedding storage and retrieval
async function storeEmbedding(id: string, vector: number[], payload: any) {
	await client.upsert("codebase", {
		points: [
			{
				id,
				vector,
				payload,
			},
		],
	})
}
```

## Cloud & Authentication

### Cloud Services

| Library                           | Version  | Purpose                     | Usage Pattern                   |
| --------------------------------- | -------- | --------------------------- | ------------------------------- |
| `@aws-sdk/client-bedrock-runtime` | ^3.812.0 | AWS Bedrock integration     | Cloud AI services via AWS       |
| `@aws-sdk/credential-providers`   | ^3.806.0 | AWS authentication          | Cloud credentials management    |
| `google-auth-library`             | ^9.15.1  | Google Cloud authentication | GCP integration and auth        |
| `socket.io-client`                | ^4.8.1   | Real-time communication     | WebSocket connections           |
| `jwt-decode`                      | ^4.0.0   | JWT token handling          | Authentication token management |

### Authentication Patterns

**JWT Token Handling:**

```typescript
import { jwtDecode } from "jwt-decode"

interface TokenPayload {
	sub: string
	exp: number
	iat: number
}

const token = localStorage.getItem("auth_token")
const payload = jwtDecode<TokenPayload>(token)

if (payload.exp * 1000 < Date.now()) {
	// Token expired, refresh or redirect to login
}
```

**AWS Credentials:**

```typescript
import { fromNodeProviderChain } from "@aws-sdk/credential-providers"
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime"

const credentials = fromNodeProviderChain()
const client = new BedrockRuntimeClient({
	region: "us-east-1",
	credentials,
})
```

## Code Analysis & Processing

### Code Processing Libraries

| Library             | Version | Purpose                     | Usage Pattern                    |
| ------------------- | ------- | --------------------------- | -------------------------------- |
| `tree-sitter-wasms` | ^0.1.12 | Code parsing                | AST generation for code analysis |
| `web-tree-sitter`   | ^0.25.6 | Tree-sitter web integration | Browser-based code parsing       |
| `shiki`             | ^3.6.0  | Syntax highlighting         | Code display and highlighting    |
| `diff`              | ^5.2.0  | Text diff algorithms        | Change detection and comparison  |
| `diff-match-patch`  | ^1.0.5  | Advanced diff algorithms    | Text comparison and merging      |

### Code Analysis Patterns

**Tree-sitter Integration:**

```typescript
import { initParser } from "web-tree-sitter"

const parser = await initParser()
parser.setLanguage(await Parser.Language.load("tree-sitter-javascript.wasm"))

const tree = parser.parse(code)
const rootNode = tree.rootNode

// Traverse AST
function traverse(node: any) {
	if (node.type === "function_declaration") {
		console.log("Found function:", node.childForFieldName("name")?.text)
	}

	for (const child of node.children) {
		traverse(child)
	}
}
```

**Syntax Highlighting:**

```typescript
import { codeToHtml } from "shiki"

const html = await codeToHtml(code, {
	lang: "typescript",
	theme: "github-dark",
	transformers: [
		{
			name: "add-line-numbers",
			line(node, line) {
				node.properties["data-line"] = line
			},
		},
	],
})
```

## File Processing & Formats

### File Processing Libraries

| Library           | Version | Purpose               | Usage Pattern                           |
| ----------------- | ------- | --------------------- | --------------------------------------- |
| `cheerio`         | ^1.0.0  | HTML parsing          | Web content processing and scraping     |
| `jsdom`           | ^26.0.0 | DOM manipulation      | HTML processing and testing             |
| `pdf-parse`       | ^1.1.1  | PDF parsing           | Document processing and text extraction |
| `mammoth`         | ^1.9.1  | Word document parsing | Office document support                 |
| `exceljs`         | ^4.4.0  | Excel file processing | Spreadsheet manipulation                |
| `fast-xml-parser` | ^5.0.0  | XML parsing           | Structured data processing              |
| `gray-matter`     | ^4.0.3  | Front matter parsing  | Markdown metadata extraction            |

### File Processing Patterns

**PDF Processing:**

```typescript
import * as pdfParse from "pdf-parse"

const pdfBuffer = fs.readFileSync("document.pdf")
const pdfData = await pdfParse(pdfBuffer)

console.log("PDF Text:", pdfData.text)
console.log("Page Count:", pdfData.numpages)
```

**Excel Processing:**

```typescript
import * as ExcelJS from "exceljs"

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile("data.xlsx")

const worksheet = workbook.getWorksheet("Sheet1")
worksheet.eachRow((row, rowNumber) => {
	console.log(`Row ${rowNumber}:`, row.values)
})
```

**Markdown Front Matter:**

```typescript
import matter from "gray-matter"

const fileContent = fs.readFileSync("post.md", "utf8")
const { data, content } = matter(fileContent)

console.log("Front matter:", data)
console.log("Content:", content)
```

## UI & Frontend (Webview)

### React Ecosystem

| Library                 | Version  | Purpose                 | Usage Pattern                  |
| ----------------------- | -------- | ----------------------- | ------------------------------ |
| `react`                 | ^18.3.1  | UI framework            | Core React components          |
| `react-dom`             | ^18.3.1  | React DOM rendering     | UI rendering and hydration     |
| `@tanstack/react-query` | ^5.68.0  | Data fetching           | Server state management        |
| `@radix-ui/*`           | Various  | UI component primitives | Accessible component library   |
| `tailwindcss`           | ^4.0.0   | CSS framework           | Utility-first styling          |
| `lucide-react`          | ^0.518.0 | Icon library            | Consistent iconography         |
| `mermaid`               | ^11.4.1  | Diagram generation      | Visual diagram creation        |
| `react-markdown`        | ^9.0.3   | Markdown rendering      | Content display and formatting |

### UI Component Patterns

**Radix UI Integration:**

```typescript
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>Open Dialog</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>Dialog description</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

**React Query Integration:**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

function useTasks() {
	return useQuery({
		queryKey: ["tasks"],
		queryFn: fetchTasks,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

function useCreateTask() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
		},
	})
}
```

**Mermaid Diagram Integration:**

```typescript
import { Mermaid } from 'mermaid'

const diagram = `
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
`

<Mermaid chart={diagram} />
```

## Development Tools & Build

### Build System

| Library      | Version | Purpose             | Usage Pattern                      |
| ------------ | ------- | ------------------- | ---------------------------------- |
| `turbo`      | ^2.5.6  | Build system        | Monorepo orchestration and caching |
| `esbuild`    | ^0.25.0 | JavaScript bundler  | Fast builds and bundling           |
| `vite`       | 6.3.5   | Frontend build tool | Webview development and HMR        |
| `typescript` | ^5.4.5  | Type system         | Type checking and compilation      |
| `vitest`     | ^3.2.3  | Testing framework   | Unit testing and coverage          |
| `playwright` | ^1.53.1 | E2E testing         | Browser testing and automation     |

### Build Patterns

**Turbo Configuration:**

```json
{
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"outputs": ["dist/**"],
			"inputs": ["src/**", "package.json"]
		},
		"test": {
			"dependsOn": ["^build"],
			"inputs": ["src/**", "test/**"]
		}
	}
}
```

**ESBuild Configuration:**

```typescript
import { build } from "esbuild"

await build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	platform: "node",
	target: "node20",
	format: "cjs",
	outfile: "dist/extension.js",
	external: ["vscode"],
	sourcemap: true,
})
```

**Vite Configuration:**

```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
	plugins: [react()],
	build: {
		target: "esnext",
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom"],
					ui: ["@radix-ui/react-dialog", "@radix-ui/react-select"],
				},
			},
		},
	},
})
```

## Utilities & Helpers

### Utility Libraries

| Library           | Version  | Purpose             | Usage Pattern                       |
| ----------------- | -------- | ------------------- | ----------------------------------- |
| `lodash.debounce` | ^4.0.8   | Function debouncing | Performance optimization for events |
| `lru-cache`       | ^11.1.0  | LRU caching         | Memory-efficient caching            |
| `p-limit`         | ^6.2.0   | Concurrency control | Rate limiting and concurrency       |
| `p-wait-for`      | ^5.0.2   | Async waiting       | Promise utilities and waiting       |
| `uuid`            | ^11.1.0  | UUID generation     | Unique identifier generation        |
| `zod`             | ^3.25.61 | Schema validation   | Type-safe validation                |

### Utility Patterns

**Debounced Operations:**

```typescript
import debounce from 'lodash.debounce'

const debouncedSearch = debounce((query: string) => {
  performSearch(query)
}, 300)

// Use in React component
function SearchInput() {
  const [query, setQuery] = useState('')

  useEffect(() => {
    debouncedSearch(query)
  }, [query])

  return <input value={query} onChange={e => setQuery(e.target.value)} />
}
```

**LRU Cache Usage:**

```typescript
import { LRUCache } from "lru-cache"

const cache = new LRUCache<string, any>({
	max: 1000,
	ttl: 1000 * 60 * 5, // 5 minutes
})

function getCachedData(key: string) {
	let data = cache.get(key)
	if (!data) {
		data = fetchData(key)
		cache.set(key, data)
	}
	return data
}
```

**Concurrency Control:**

```typescript
import pLimit from "p-limit"

const limit = pLimit(3) // Max 3 concurrent operations

const tasks = urls.map((url) => limit(() => fetch(url)))

const results = await Promise.all(tasks)
```

**Schema Validation:**

```typescript
import { z } from "zod"

const TaskSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1),
	completed: z.boolean(),
	createdAt: z.date(),
})

type Task = z.infer<typeof TaskSchema>

function validateTask(data: unknown): Task {
	return TaskSchema.parse(data)
}
```

## Dependency Management

### Package Manager Configuration

**pnpm Workspace Setup:**

```yaml
# pnpm-workspace.yaml

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻

packages:
    - src
    - webview-ui
    - apps/*
    - packages/*

onlyBuiltDependencies:
    - "@tailwindcss/oxide"
    - "@vscode/vsce-sign"
    - core-js
    - esbuild
    - keytar
    - puppeteer-chromium-resolver
```

**Security Overrides:**

```json
{
	"pnpm": {
		"overrides": {
			"tar-fs": ">=2.1.3",
			"esbuild": ">=0.25.0",
			"brace-expansion": ">=2.0.2",
			"form-data": ">=4.0.4",
			"bluebird": ">=3.7.2"
		}
	}
}
```

### Version Management

**Version Pinning Strategy:**

- **Exact versions** for critical dependencies (security, build tools)
- **Caret ranges** (^) for most dependencies to allow patch updates
- **Workspace dependencies** for internal packages using `workspace:^`

**Example Package.json:**

```json
{
	"dependencies": {
		"react": "^18.3.1", // Allow patch updates
		"typescript": "5.8.3", // Exact version for build tool
		"@roo-code/types": "workspace:^" // Workspace dependency
	}
}
```

## Security & Conventions

### Security Considerations

**Regular Security Audits:**

```bash
# Run security audit

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

pnpm audit

# Fix vulnerabilities

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

pnpm audit --fix

# Check for outdated packages

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

pnpm outdated
```

**Dependency Security:**

- **Pin critical versions** for security-sensitive packages
- **Override vulnerable dependencies** in pnpm.overrides
- **Regular updates** for security patches
- **Automated security scanning** in CI/CD

### Performance Optimizations

**Bundle Optimization:**

- **Tree-shaking** for unused code elimination
- **Code splitting** for lazy loading
- **Compression** for production builds
- **Source maps** for debugging

**Runtime Optimization:**

- **Tree-sitter WASM** for fast code parsing
- **LRU caching** for frequently accessed data
- **Debounced operations** for UI responsiveness
- **Concurrency limits** for API requests

### Development Conventions

**Import Conventions:**

```typescript
// External libraries first
import React from "react"
import { useState } from "react"

// Internal modules
import { Task } from "@roo-code/types"
import { TaskService } from "../services/TaskService"

// Relative imports last
import "./styles.css"
```

**Error Handling:**

```typescript
// Consistent error handling patterns
try {
	const result = await riskyOperation()
	return result
} catch (error) {
	console.error("Operation failed:", error)
	throw new Error(`Failed to perform operation: ${error.message}`)
}
```

**Type Safety:**

```typescript
// Use Zod for runtime validation
import { z } from "zod"

const ConfigSchema = z.object({
	apiUrl: z.string().url(),
	timeout: z.number().positive(),
	retries: z.number().int().min(0).max(5),
})

type Config = z.infer<typeof ConfigSchema>
```

<a id="navigation-footer"></a>

- Back: [`REPOSITORY_OVERVIEW.md`](REPOSITORY_OVERVIEW.md) · Root: [`README.md`](../README.md) ·
  Source: `/docs/architecture/EXTERNAL_DEPENDENCIES.md#L1`

## Navigation Footer

---

**Navigation**: [docs](../) · [architecture](../docs/architecture/) ·
[↑ Table of Contents](#external-dependencies)
