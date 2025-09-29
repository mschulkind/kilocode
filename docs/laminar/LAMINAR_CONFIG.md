# Laminar Configuration Guide

## Table of Contents

* [When You're Here](#when-youre-here)
* [Quick Start Example](#quick-start-example)
* [Configuration Settings](#configuration-settings)
* [Environment-Specific Examples](#environment-specific-examples)
* [Project Integration](#project-integration)
* [Troubleshooting](#troubleshooting)
* [Security Considerations](#security-considerations)
* [Migration Guide](#migration-guide)
* [Research Context & Next Steps](#research-context--next-steps)
* [Navigation](#navigation)

## When You're Here

This document provides comprehensive configuration guidance for Laminar observability integration in Kilo Code, including environment setup, configuration options, and troubleshooting.

* **Purpose**: Laminar configuration and setup guide
* **Audience**: Developers setting up Laminar observability
* **Prerequisites**: Basic understanding of environment variables and configuration
* **Related Documents**: [Laminar Documentation](README.md), [Technical Glossary](../GLOSSARY.md)

## Quick Start Example

### Basic Configuration

```bash
# Required: Laminar API key
export LMNR_API_KEY="your-api-key-here"

# Optional: Enable Laminar (default: true)
export LMNR_ENABLED=true

# Optional: Record I/O operations (default: false)
export LMNR_RECORD_IO=false
```

### Environment File

Create a `.env` file in your project root:

```bash
# Laminar Configuration
LMNR_API_KEY=your-api-key-here
LMNR_ENABLED=true
LMNR_RECORD_IO=false
LMNR_BASE_URL=https://api.laminar.dev
LMNR_HTTP_PORT=8080
LMNR_GRPC_PORT=9090
```

## Configuration Settings

### Required Settings

#### LMNR_API_KEY

Your Laminar API key for authentication.

```bash
export LMNR_API_KEY="lmnr_1234567890abcdef"
```

**Note**: Keep this key secure and never commit it to version control.

### Optional Settings

#### LMNR_ENABLED

Enable or disable Laminar observability.

```bash
# Enable Laminar (default)
export LMNR_ENABLED=true

# Disable Laminar
export LMNR_ENABLED=false
```

#### LMNR_RECORD_IO

Record input/output operations for detailed tracing.

```bash
# Record I/O operations
export LMNR_RECORD_IO=true

# Skip I/O recording (default)
export LMNR_RECORD_IO=false
```

#### LMNR_BASE_URL

Laminar API base URL.

```bash
# Production (default)
export LMNR_BASE_URL=https://api.laminar.dev

# Development
export LMNR_BASE_URL=https://dev-api.laminar.dev
```

#### LMNR_HTTP_PORT

HTTP port for Laminar service.

```bash
# Default port
export LMNR_HTTP_PORT=8080

# Custom port
export LMNR_HTTP_PORT=3000
```

#### LMNR_GRPC_PORT

gRPC port for Laminar service.

```bash
# Default port
export LMNR_GRPC_PORT=9090

# Custom port
export LMNR_GRPC_PORT=4000
```

## Environment-Specific Examples

### Development Environment

```bash
# Development configuration
export LMNR_API_KEY="dev_key_1234567890abcdef"
export LMNR_ENABLED=true
export LMNR_RECORD_IO=true
export LMNR_BASE_URL=https://dev-api.laminar.dev
export LMNR_HTTP_PORT=8080
export LMNR_GRPC_PORT=9090
```

### Staging Environment

```bash
# Staging configuration
export LMNR_API_KEY="staging_key_1234567890abcdef"
export LMNR_ENABLED=true
export LMNR_RECORD_IO=false
export LMNR_BASE_URL=https://staging-api.laminar.dev
export LMNR_HTTP_PORT=8080
export LMNR_GRPC_PORT=9090
```

### Production Environment

```bash
# Production configuration
export LMNR_API_KEY="prod_key_1234567890abcdef"
export LMNR_ENABLED=true
export LMNR_RECORD_IO=false
export LMNR_BASE_URL=https://api.laminar.dev
export LMNR_HTTP_PORT=8080
export LMNR_GRPC_PORT=9090
```

## Project Integration

### Adding Laminar to Your Project

1. **Install Dependencies**:
   ```bash
   npm install @laminar/observability
   ```

2. **Create Configuration File**:
   ```typescript
   // config/laminar.ts
   export const laminarConfig = {
     apiKey: process.env.LMNR_API_KEY,
     enabled: process.env.LMNR_ENABLED === 'true',
     recordIO: process.env.LMNR_RECORD_IO === 'true',
     baseUrl: process.env.LMNR_BASE_URL || 'https://api.laminar.dev',
     httpPort: parseInt(process.env.LMNR_HTTP_PORT || '8080'),
     grpcPort: parseInt(process.env.LMNR_GRPC_PORT || '9090'),
   };
   ```

3. **Initialize Laminar**:
   ```typescript
   // src/laminar.ts
   import { LaminarService } from '@laminar/observability';
   import { laminarConfig } from '../config/laminar';

   export const laminar = new LaminarService(laminarConfig);
   ```

### Loading Environment Variables

#### Using dotenv

```typescript
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Access configuration
const apiKey = process.env.LMNR_API_KEY;
```

#### Using process.env

```typescript
// Direct access to environment variables
const config = {
  apiKey: process.env.LMNR_API_KEY,
  enabled: process.env.LMNR_ENABLED === 'true',
  recordIO: process.env.LMNR_RECORD_IO === 'true',
};
```

## Troubleshooting

### Common Issues

#### Missing API Key

**Error**: `LMNR_API_KEY is required`

**Solution**: Set the API key environment variable:
```bash
export LMNR_API_KEY="your-api-key-here"
```

#### Connection Refused

**Error**: `Connection refused to Laminar API`

**Solution**: Check the base URL and network connectivity:
```bash
# Verify base URL
echo $LMNR_BASE_URL

# Test connectivity
curl -I $LMNR_BASE_URL/health
```

#### Invalid Configuration

**Error**: `Invalid configuration provided`

**Solution**: Validate all configuration values:
```typescript
// Validate configuration
const isValid = (config) => {
  return config.apiKey && 
         typeof config.enabled === 'boolean' &&
         typeof config.recordIO === 'boolean';
};
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Enable debug mode
export LMNR_DEBUG=true

# Set log level
export LMNR_LOG_LEVEL=debug
```

### Testing Configuration

Test your configuration:

```typescript
// Test configuration
import { LaminarService } from '@laminar/observability';

const testConfig = async () => {
  try {
    const laminar = new LaminarService(config);
    await laminar.healthCheck();
    console.log('Configuration is valid');
  } catch (error) {
    console.error('Configuration error:', error);
  }
};
```

## Security Considerations

### API Key Security

- **Never commit API keys** to version control
- **Use environment variables** for sensitive configuration
- **Rotate keys regularly** for security
- **Use different keys** for different environments

### Network Security

- **Use HTTPS** for production environments
- **Validate SSL certificates** for secure connections
- **Implement rate limiting** to prevent abuse
- **Monitor API usage** for suspicious activity

### Data Privacy

- **Review I/O recording settings** based on data sensitivity
- **Implement data filtering** for sensitive information
- **Follow privacy regulations** (GDPR, CCPA, etc.)
- **Audit data collection** regularly

## Migration Guide

### From Default Configuration

If you're upgrading from default configuration:

1. **Backup current configuration**
2. **Update environment variables**
3. **Test new configuration**
4. **Deploy gradually**

### From Custom Configuration

If you have custom configuration:

1. **Review current settings**
2. **Map to new configuration format**
3. **Update environment variables**
4. **Test thoroughly**
5. **Deploy with rollback plan**

## Research Context & Next Steps

### When You're Here, You Can:

* **Understanding Laminar Observability:**
  * **Next**: Check related Laminar documentation in the same directory
  * **Related**: [Technical Glossary](../GLOSSARY.md) for terminology, [Laminar Documentation](README.md) for context

* **Implementing Observability Features:**
  * **Next**: [Repository Development Guide](../README.md) → [Testing Infrastructure](../../testing/TESTING_STRATEGY.md)
  * **Related**: [Orchestrator Documentation](../orchestrator/README.md) for integration patterns

* **Troubleshooting Observability Issues:**
  * **Next**: [Race Condition Analysis](../README.md) → [Root Cause Analysis](DUPLICATE_API_REQUESTS_TROUBLESHOOTING.md)
  * **Related**: [Orchestrator Error Handling](../orchestrator/ORCHESTRATOR_ERROR_HANDLING.md) for common issues

### No Dead Ends Policy

Every page provides clear next steps based on your research goals. If you're unsure where to go next, return to [Laminar Documentation](README.md) for guidance.

## Navigation

* **Back**: [Laminar Subsystems Index](LAMINAR_SUBSYSTEMS_INDEX.md) · **Root**: [Laminar Documentation](README.md) · **Source**: `/docs/laminar/LAMINAR_CONFIG.md#L1`
* **Technical Glossary**: [GLOSSARY.md](../GLOSSARY.md) · **Table of Contents**: [#research-context--next-steps](#research-context--next-steps)
