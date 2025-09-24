# Laminar Configuration Guide

> **Development Fun Fact**: Documentation is like code comments for humans - it explains the "why" behind the "what"! 💻
- *Complete guide for configuring Laminar observability in your projects*\*

## Quick Start Example

Here's a complete example of all Laminar configuration options:

```bash
# Required: Your Laminar API key

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

export LMNR_API_KEY="lmnr_prod_1234567890abcdef"

# Optional: Custom server configuration

> **Engineering Fun Fact**: Just as engineers use systematic approaches to solve complex problems, this documentation provides structured guidance for understanding and implementing solutions! 🔧

export LMNR_BASE_URL="https://api.lmnr.ai"
export LMNR_HTTP_PORT="443"
export LMNR_GRPC_PORT="8443"

# Optional: Control behavior

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

export LMNR_ENABLED="true"
export LMNR_RECORD_IO="true"
```

## Configuration Settings

### Required Settings

#### `LMNR_API_KEY`

Your Laminar project API key for authentication.

```bash
export LMNR_API_KEY="your-laminar-api-key-here"
```
- *How to get your API key:*\*
1. Sign up at [Laminar](https://www.lmnr.ai)
2. Create a new project
3. Go to Project Settings → API Keys
4. Copy your project API key

### Optional Settings

#### `LMNR_ENABLED`

Enable or disable Laminar integration entirely.

```bash
export LMNR_ENABLED="true"  # Default: true
```
- *Values:*\*
- `"true"` - Enable Laminar (default)
- `"false"` - Disable Laminar completely
- *Use cases:*\*
- Disable in development environments
- Temporarily turn off tracing
- Privacy-sensitive deployments

#### `LMNR_RECORD_IO`

Control whether input/output data is recorded in spans.

```bash
export LMNR_RECORD_IO="true"  # Default: true
```
- *Values:*\*
- `"true"` - Record I/O data (default)
- `"false"` - Don't record I/O data
- *Considerations:*\*
- Set to `"false"` for privacy-sensitive data
- Reduces trace size and storage costs
- May limit debugging capabilities

#### `LMNR_BASE_URL`

Base URL for the Laminar API server.

```bash
export LMNR_BASE_URL="https://api.lmnr.ai"  # Default
```
- *Examples:*\*
- Production: `https://api.lmnr.ai`
- Self-hosted: `https://laminar.yourcompany.com`
- Local development: `http://localhost:8000`

#### `LMNR_HTTP_PORT`

HTTP port for Laminar API communication.

```bash
export LMNR_HTTP_PORT="443"  # Default
```
- *Common values:*\*
- Standard HTTPS: `443`
- Custom HTTPS: `8443`
- HTTP (development): `80` or `8000`

#### `LMNR_GRPC_PORT`

gRPC port for Laminar API communication.

```bash
export LMNR_GRPC_PORT="8443"  # Default
```
- *Common values:*\*
- Standard gRPC: `8443`
- Custom gRPC: `9443`
- Development: `50051`

## Environment-Specific Examples

### Development Environment

```bash
# .env.development

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

LMNR_API_KEY="dev_project_key_123"
LMNR_BASE_URL="http://localhost:8000"
LMNR_HTTP_PORT="8000"
LMNR_GRPC_PORT="8443"
LMNR_ENABLED="true"
LMNR_RECORD_IO="true"
```

### Staging Environment

```bash
# .env.staging

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

LMNR_API_KEY="staging_project_key_456"
LMNR_BASE_URL="https://staging-laminar.company.com"
LMNR_HTTP_PORT="443"
LMNR_GRPC_PORT="8443"
LMNR_ENABLED="true"
LMNR_RECORD_IO="false"  # Disable I/O recording for privacy
```

### Production Environment

```bash
# .env.production

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

LMNR_API_KEY="prod_project_key_789"
LMNR_BASE_URL="https://api.lmnr.ai"
LMNR_HTTP_PORT="443"
LMNR_GRPC_PORT="8443"
LMNR_ENABLED="true"
LMNR_RECORD_IO="false"  # Disable I/O recording for privacy
```

## Project Integration

### Adding Laminar to Your Project
1. **Install the package:**

```bash
npm install @lmnr-ai/lmnr
```
2. **Add environment variables:**

```bash
# Create .env file in your project root

> **Architecture Fun Fact**: Like a well-designed building, good documentation has a solid foundation, clear structure, and intuitive navigation! 🏗️

echo 'LMNR_API_KEY="your-api-key"' >> .env
echo 'LMNR_ENABLED="true"' >> .env
echo 'LMNR_RECORD_IO="true"' >> .env
```
3. **Initialize in your application:**

```typescript
// In your main application file (e.g., src/main.ts)
import { Laminar } from "@lmnr-ai/lmnr"

async function initialize() {
	// Load environment variables first
	await Laminar.initialize({
		projectApiKey: process.env.LMNR_API_KEY,
		baseUrl: process.env.LMNR_BASE_URL,
		httpPort: parseInt(process.env.LMNR_HTTP_PORT || "443"),
		grpcPort: parseInt(process.env.LMNR_GRPC_PORT || "8443"),
	})

	// Rest of your app initialization...
}
```

### Loading Environment Variables

If you're using a `.env` file, make sure to load it:

```bash
# Install dotenv if needed

> **System Fun Fact**: Every complex system is just a collection of simple parts working together - documentation helps us understand how! ⚙️

npm install dotenv
```

```typescript
// At the top of your main file
import "dotenv/config"

// Or manually load
import { config } from "dotenv"
config()
```

## Troubleshooting

### Common Issues
1. **"Laminar service failed to initialize"**
- Check that `LMNR_API_KEY` is set correctly
- Verify the API key is valid and not expired
- Check network connectivity to Laminar servers
2. **"Cannot connect to Laminar server"**
- Verify `LMNR_BASE_URL` is correct
- Check `LMNR_HTTP_PORT` and `LMNR_GRPC_PORT` values
- Ensure firewall allows outbound connections
3. **"Traces not appearing in dashboard"**
- Verify `LMNR_ENABLED` is `"true"`
- Check that your code is creating spans
- Verify API key has correct permissions

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
export DEBUG="laminar:*"
export LMNR_RECORD_IO="true"
```

### Testing Configuration

Test your configuration setup:

```typescript
// Add this temporarily to verify configuration
console.log("Laminar Config:", {
	apiKey: process.env.LMNR_API_KEY ? "***" : "NOT SET",
	baseUrl: process.env.LMNR_BASE_URL || "https://api.lmnr.ai",
	enabled: process.env.LMNR_ENABLED !== "false",
	recordIO: process.env.LMNR_RECORD_IO !== "false",
})
```

## Security Considerations
1. **API Key Security:**
- Never commit API keys to version control
- Use environment variables or secure key management
- Rotate keys regularly
2. **Network Security:**
- Use HTTPS for production environments
- Validate SSL certificates
- Use private networks when possible
3. **Data Privacy:**
- Set `LMNR_RECORD_IO="false"` for sensitive data
- Review what data is being traced
- Implement data retention policies

## Migration Guide

### From Default Configuration
1. Add environment variables to your deployment
2. Test in development environment first
3. Deploy to staging for validation
4. Roll out to production

### From Custom Configuration
1. Document current settings
2. Migrate to environment variables
3. Update deployment scripts
4. Test thoroughly before deploying

## Support

For additional help:
- Check [Laminar Documentation](https://docs.lmnr.ai)
- Review [Kilo Code Laminar Integration](LAMINAR_PORT.md)
- Open an issue in the project repository
- Contact Laminar support for API-related questions
- \*\*
- *Last Updated*\*: September 2025 **Version**: 1.0.0

## 🔍 Research Context & Next Steps

### When You're Here, You Can:
- *Understanding Laminar Observability:*\*
- **Next**: Check related Laminar documentation in the same directory
- **Related**: [Technical Glossary](../GLOSSARY.md) for terminology,
  [Laminar Documentation](README.md) for context
- *Implementing Observability Features:*\*
- **Next**: [Repository Development Guide](../architecture/repository/DEVELOPMENT_GUIDE.md) →
  [Testing Infrastructure](../architecture/repository/TESTING_INFRASTRUCTURE.md)
- **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns
- *Troubleshooting Observability Issues:*\*
- **Next**: [Race Condition Analysis](../architecture/race-condition/README.md) →
  [Root Cause Analysis](../architecture/race-condition/ROOT_CAUSE_ANALYSIS.md)
- **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for
  common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go
next, return to [Laminar Documentation](README.md) for guidance.

## Navigation Footer
- \*\*
- *Navigation*\*: [← Back to Laminar Documentation](README.md) ·
  [📚 Technical Glossary](../GLOSSARY.md) · [↑ Table of Contents](#-research-context--next-steps)
