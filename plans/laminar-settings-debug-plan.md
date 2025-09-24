# Laminar Settings Debug Plan

## Overview

This plan systematically investigates and fixes two critical issues with Laminar settings:

1. **Settings not saving correctly** - Settings go back to blank after saving
2. **gRPC connection test failure** - Test connection doesn't work properly

The plan includes extensive debug logging for rapid iteration and quick turnaround times.

## Research Context

Based on thorough codebase analysis, this plan addresses critical issues in the Laminar observability integration. The research involved examining:

- **Laminar Configuration System**: [docs/laminar/LAMINAR_CONFIG.md](docs/laminar/LAMINAR_CONFIG.md)
- **Laminar Configuration Architecture**: [docs/laminar/LAMINAR_CONFIGURATION_SYSTEM.md](docs/laminar/LAMINar_CONFIGURATION_SYSTEM.md)
- **Laminar Service Layer**: [docs/laminar/LAMINAR_SERVICE_LAYER.md](docs/laminar/LAMINAR_SERVICE_LAYER.md)
- **Laminar Testing System**: [docs/laminar/LAMINAR_TESTING_SYSTEM.md](docs/laminar/LAMINAR_TESTING_SYSTEM.md)
- **UI Layer System**: [docs/ui/UI_LAYER_SYSTEM.md](docs/ui/UI_LAYER_SYSTEM.md)
- **UI Message Flow System**: [docs/ui/UI_MESSAGE_FLOW_SYSTEM.md](docs/ui/UI_MESSAGE_FLOW_SYSTEM.md)
- **Communication Layer System**: [docs/architecture/COMMUNICATION_LAYER_SYSTEM.md](docs/architecture/COMMUNICATION_LAYER_SYSTEM.md)

## Issue Analysis

### Problem 1: Settings Not Saving

**Symptoms**:

- User enters settings in the UI
- Settings appear to save but revert to blank/default values
- Settings don't persist across application restarts

**ROOT CAUSE IDENTIFIED**: `laminarSettings` is **NOT** included in the main `getStateToPostToWebview()` method in `ClineProvider.ts`. The settings are only loaded in specific cases (like `updatePrompt`) but not in the main state synchronization.

**Evidence**:

- `laminarSettings` is missing from the return statement in `ClineProvider.getStateToPostToWebview()` (lines 2093-2238)
- Settings are only loaded via `loadLaminarSettingsFromVSCode()` in specific message handlers
- Main state synchronization doesn't include Laminar settings

**Potential Root Causes**:

1. **CRITICAL**: `laminarSettings` not included in main extension state
2. Webview message handling not properly updating VS Code settings
3. Settings persistence in cached state not working correctly
4. State synchronization issues between webview and extension
5. VS Code configuration update failures

### Problem 2: gRPC Connection Test Failure

**Symptoms**:

- Test connection button shows failure
- gRPC connectivity test specifically fails
- HTTP connectivity may work but gRPC doesn't

**Analysis Based on Code Review**:

- The `LaminarConnectivityTester` uses HTTP fetch to test gRPC ports (lines 283-391)
- gRPC testing is actually TCP connectivity testing, not true gRPC protocol testing
- **CRITICAL ISSUE**: The test **PASSES** even with wrong gRPC ports due to false positive logic

**Root Cause of False Positive**:
Lines 357-377 in `LaminarConnectivityTester.testTcpConnectivity()`:

```typescript
// For other errors, check if it's a protocol error (port open but doesn't speak HTTP)
// This is common for gRPC ports - they accept connections but don't respond to HTTP
if (
	fetchError.message.includes("fetch failed") ||
	fetchError.message.includes("ERR_INVALID_HTTP_RESPONSE") ||
	fetchError.message.includes("HTTP/0.9") ||
	fetchError.message.includes("Invalid response")
) {
	// Port is open but doesn't speak HTTP (likely gRPC)
	return {
		success: true, // ← FALSE POSITIVE!
		details: {
			note: "Port is open but does not respond to HTTP requests (likely gRPC port)",
			error: fetchError.message,
		},
	}
}
```

**The Problem**: Any port that accepts a TCP connection but doesn't speak HTTP is considered a "successful gRPC port", even if it's completely wrong (like port 80, 443, 22, etc.).

**Potential Root Causes**:

1. **CRITICAL**: False positive logic treats any non-HTTP response as successful gRPC
2. Protocol mismatch: Using HTTP fetch to test gRPC port
3. gRPC port not actually open on server
4. Incorrect gRPC connectivity testing logic
5. Network/firewall blocking gRPC port
6. Laminar server not configured for gRPC

## Debugging Strategy

### Phase 1: Settings Persistence Debug (Priority: HIGH)

#### Step 1.1: Fix Critical State Synchronization Issue

**CRITICAL FIX REQUIRED**: Add `laminarSettings` to main extension state

**File to modify**: `src/core/webview/ClineProvider.ts`

**Fix**: Add `laminarSettings: loadLaminarSettingsFromVSCode()` to the return statement in `getStateToPostToWebview()` method around line 2237.

#### Step 1.2: Add Comprehensive Settings Flow Logging

**Files to modify**:

- `webview-ui/src/components/settings/LaminarSettings.tsx`
- `webview-ui/src/components/settings/SettingsView.tsx`
- `src/core/webview/webviewMessageHandler.ts`
- `src/shared/services/config/laminar-config.ts`
- `src/core/webview/ClineProvider.ts` (for state debugging)

**Debug logging to add**:

1. **UI Component Level** (LaminarSettings.tsx):

```typescript
// Add at component mount
console.log("[LAMINAR SETTINGS DEBUG] Component mounted with props:", {
	laminarSettings: props.laminarSettings,
	timestamp: new Date().toISOString(),
})

// Add to updateField function
console.log("[LAMINAR SETTINGS DEBUG] updateField called:", {
	field,
	value,
	currentSettings: laminarSettings,
	timestamp: new Date().toISOString(),
})

// Add to all input handlers
console.log("[LAMINAR SETTINGS DEBUG] Input changed:", {
	field: "apiKey",
	oldValue: localApiKey,
	newValue: value,
	timestamp: new Date().toISOString(),
})
```

2. **Settings View Level** (SettingsView.tsx):

```typescript
// Add to handleSubmit function
console.log("[LAMINAR SETTINGS DEBUG] handleSubmit called with laminarSettings:", {
	laminarSettings: cachedState.laminarSettings,
	timestamp: new Date().toISOString(),
})

// Add to setCachedStateField calls
console.log("[LAMINAR SETTINGS DEBUG] setCachedStateField called:", {
	field: "laminarSettings",
	value,
	previousValue: cachedState.laminarSettings,
	timestamp: new Date().toISOString(),
})
```

3. **Webview Message Handler** (webviewMessageHandler.ts):

```typescript
// Add to laminarSettings case
console.log("[LAMINAR SETTINGS DEBUG] laminarSettings message received:", {
	messageType: "laminarSettings",
	values: message.values,
	timestamp: new Date().toISOString(),
})

// Add before each VS Code config update
console.log("[LAMINAR SETTINGS DEBUG] Updating VS Code config:", {
	key: "apiKey",
	value: laminarSettings.apiKey,
	target: "global",
	timestamp: new Date().toISOString(),
})

// Add after config update
console.log("[LAMINAR SETTINGS DEBUG] VS Code config updated:", {
	key: "apiKey",
	success: true,
	timestamp: new Date().toISOString(),
})
```

4. **Configuration Loading** (laminar-config.ts):

```typescript
// Add to loadLaminarConfig function
console.log("[LAMINAR SETTINGS DEBUG] loadLaminarConfig called:", {
	timestamp: new Date().toISOString(),
	callStack: new Error().stack,
})

// Add VS Code settings dump with more detail
console.log("[LAMINAR SETTINGS DEBUG] VS Code settings detailed dump:", {
	allSettings: vscode.workspace.getConfiguration("kilo-code.laminar"),
	individualSettings: {
		apiKey: vscodeSettings.get<string>("apiKey"),
		baseUrl: vscodeSettings.get<string>("baseUrl"),
		httpPort: vscodeSettings.get<number>("httpPort"),
		grpcPort: vscodeSettings.get<number>("grpcPort"),
		recordIO: vscodeSettings.get<boolean>("recordIO"),
		enabled: vscodeSettings.get<boolean>("enabled"),
	},
	timestamp: new Date().toISOString(),
})
```

5. **Extension State Loading** (ClineProvider.ts):

```typescript
// Add to getStateToPostToWebview method
console.log("[LAMINAR SETTINGS DEBUG] getStateToPostToWebview called:", {
	timestamp: new Date().toISOString(),
	includesLaminarSettings: "laminarSettings" in returnObject,
})

// Add state synchronization logging
console.log("[LAMINAR SETTINGS DEBUG] State synchronization:", {
	laminarSettingsFromVSCode: loadLaminarSettingsFromVSCode(),
	timestamp: new Date().toISOString(),
})
```

#### Step 1.3: Manual Testing Steps

**PREREQUISITE**: Apply the critical fix from Step 1.1 before testing

1. **Open VS Code Developer Tools**:

    - Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac)
    - Go to Console tab
    - Clear console logs

2. **Navigate to Settings**:

    - Open Kilo Code settings
    - Go to Experimental tab
    - Enable Laminar Observability

3. **Test Settings Entry**:

    - Enter API key: `test-key-12345`
    - Enter base URL: `https://test.lmnr.ai`
    - Change HTTP port to: `8080`
    - Change gRPC port to: `9443`
    - Toggle Record I/O off

4. **Monitor Console Logs**:

    - Watch for all `[LAMINAR SETTINGS DEBUG]` messages
    - Note any errors or unexpected values
    - Check if settings are being sent to extension
    - Verify `getStateToPostToWebview` includes laminarSettings

5. **Save Settings**:

    - Click Save button
    - Watch console for save flow logs
    - Check if VS Code settings are updated
    - Verify state synchronization logs

6. **Verify Persistence**:
    - Close and reopen settings
    - Check if values are restored
    - Restart VS Code and check again
    - Verify settings persist across restarts

#### Step 1.4: State Synchronization Debug

**Add state comparison logging**:

```typescript
// In SettingsView.tsx
useEffect(() => {
	console.log("[LAMINAR SETTINGS DEBUG] State change detected:", {
		previousState: prevState,
		currentState: cachedState,
		laminarSettingsChanged: !deepEqual(prevState?.laminarSettings, cachedState.laminarSettings),
		timestamp: new Date().toISOString(),
	})
}, [cachedState.laminarSettings])
```

### Phase 2: gRPC Connection Test Debug (Priority: HIGH)

#### Step 2.1: Fix gRPC Protocol Testing Issue

**CRITICAL FIX REQUIRED**: Fix false positive logic in gRPC testing

**File to modify**: `src/services/laminar/LaminarConnectivityTester.ts`

**Issue**: Lines 357-377 have false positive logic that treats ANY non-HTTP response as successful gRPC, even for completely wrong ports.

**Current Problematic Logic**:

```typescript
// Lines 357-377: FALSE POSITIVE LOGIC
if (fetchError.message.includes("fetch failed") || fetchError.message.includes("ERR_INVALID_HTTP_RESPONSE")) {
	return { success: true } // ← This passes for ANY port that doesn't speak HTTP!
}
```

**Fix Options**:

1. **Option A**: Use proper gRPC client library for testing
2. **Option B**: Implement basic TCP socket connection test
3. **Option C**: Remove false positive logic and require actual gRPC response
4. **Option D**: Add port validation (only accept common gRPC ports like 8443, 9443, 50051)

#### Step 2.2: Enhanced Connection Test Logging

**Files to modify**:

- `src/services/laminar/LaminarConnectivityTester.ts`
- `src/core/webview/webviewMessageHandler.ts`
- `webview-ui/src/components/settings/LaminarSettings.tsx`

**Debug logging to add**:

1. **Connection Test Entry Point** (LaminarSettings.tsx):

```typescript
// Add to handleTestConnection function
console.log("[LAMINAR CONNECTION DEBUG] Test connection initiated:", {
	testValues: {
		...testValues,
		apiKey: testValues.apiKey ? testValues.apiKey.substring(0, 8) + "..." : "undefined",
		apiKeyLength: testValues.apiKey?.length || 0,
	},
	timestamp: new Date().toISOString(),
})
```

2. **Webview Message Handler** (webviewMessageHandler.ts):

```typescript
// Add to testLaminarConnection case
console.log("[LAMINAR CONNECTION DEBUG] Test connection message received:", {
	messageType: "testLaminarConnection",
	values: message.values,
	timestamp: new Date().toISOString(),
})

// Add connection test result logging
console.log("[LAMINAR CONNECTION DEBUG] Connection test completed:", {
	success: result.success,
	error: result.error,
	details: result.details,
	timestamp: new Date().toISOString(),
})
```

3. **Connectivity Tester** (LaminarConnectivityTester.ts):

```typescript
// Add to testConnectionWithConfig
console.log("[LAMINAR CONNECTION DEBUG] testConnectionWithConfig started:", {
	config: {
		...config,
		apiKey: config.apiKey ? config.apiKey.substring(0, 8) + "..." : "undefined",
	},
	timestamp: new Date().toISOString(),
})

// Add to each test phase
console.log("[LAMINAR CONNECTION DEBUG] HTTP connectivity test starting:", {
	baseUrl: config.baseUrl,
	httpPort: config.httpPort,
	timestamp: new Date().toISOString(),
})

console.log("[LAMINAR CONNECTION DEBUG] gRPC connectivity test starting:", {
	baseUrl: config.baseUrl,
	grpcPort: config.grpcPort,
	timestamp: new Date().toISOString(),
})
```

#### Step 2.2: Network-Level Debugging

**Add network diagnostic logging**:

```typescript
// In testTcpConnectivity function
console.log("[LAMINAR CONNECTION DEBUG] TCP connectivity test details:", {
	hostname,
	port,
	testUrl: `http://${hostname}:${port}`,
	timeout: 5000,
	timestamp: new Date().toISOString(),
})

// Add fetch error analysis
console.log("[LAMINAR CONNECTION DEBUG] Fetch error analysis:", {
	errorName: fetchError?.name,
	errorMessage: fetchError?.message,
	errorType: typeof fetchError,
	errorConstructor: fetchError?.constructor?.name,
	isAbortError: fetchError?.name === "AbortError",
	isConnectionRefused: fetchError?.message?.includes("ECONNREFUSED"),
	isNetworkError: fetchError instanceof TypeError,
	timestamp: new Date().toISOString(),
})
```

#### Step 2.3: Manual gRPC Test Steps

**PREREQUISITE**: Apply the gRPC testing fix from Step 2.1 before testing

1. **Test with Known Working Server**:

    - Use `https://api.lmnr.ai` as base URL
    - Port 443 for HTTP, 8443 for gRPC
    - Enter a valid API key

2. **Test with Local Server**:

    - Use `http://localhost` as base URL
    - Port 8000 for HTTP, 8443 for gRPC
    - Check if local Laminar server is running

3. **Test Network Connectivity**:

    - Use browser to test: `https://api.lmnr.ai/health`
    - Use telnet to test: `telnet api.lmnr.ai 8443`
    - Check firewall/network settings

4. **Monitor Debug Logs**:
    - Watch for `[LAMINAR CONNECTION DEBUG]` messages
    - Check for HTTP vs gRPC test results
    - Check for specific error messages
    - Verify test parameters are correct
    - **CRITICAL**: Test with obviously wrong gRPC ports (like 22, 80, 443) to verify they now FAIL
    - Note if gRPC test now properly fails for incorrect ports

### Phase 3: Root Cause Analysis

#### Step 3.1: Settings Persistence Analysis

**Check these specific issues**:

1. **VS Code Configuration Target**:

    - Verify using `ConfigurationTarget.Global` vs `ConfigurationTarget.Workspace`
    - Check if workspace settings override global settings

2. **Settings Schema Mismatch**:

    - Verify `package.json` schema matches actual usage
    - Check for typos in configuration keys

3. **State Management Issues**:

    - Check if cached state is properly updated
    - Verify state synchronization between components

4. **Webview Message Flow**:
    - Confirm messages are sent from webview to extension
    - Verify message handlers are called correctly

#### Step 3.2: gRPC Connection Analysis

**Check these specific issues**:

1. **Port Accessibility**:

    - Verify gRPC port is actually open on server
    - Check if server supports gRPC protocol

2. **Network Configuration**:

    - Test with different network configurations
    - Check firewall rules blocking gRPC port

3. **Protocol Implementation**:

    - Verify gRPC test is using correct protocol
    - Check if server expects specific gRPC setup

4. **Error Handling**:
    - Analyze specific error messages
    - Check if errors are properly categorized

### Phase 4: Fix Implementation

#### Step 4.1: Settings Persistence Fixes

**CRITICAL FIX**: Add laminarSettings to main extension state

**File**: `src/core/webview/ClineProvider.ts`

**Fix**: Add to return statement in `getStateToPostToWebview()` method (around line 2237):

```typescript
return {
	// ... existing properties ...
	openRouterUseMiddleOutTransform,
	featureRoomoteControlEnabled,
	laminarSettings: loadLaminarSettingsFromVSCode(), // ADD THIS LINE
}
```

**Additional fixes based on findings**:

1. **Fix Configuration Target**:

```typescript
// If workspace settings are overriding global
await config.update("apiKey", laminarSettings.apiKey, vscode.ConfigurationTarget.Workspace)
```

2. **Fix State Synchronization**:

```typescript
// Ensure proper state updates
setCachedStateField("laminarSettings", {
	...laminarSettings,
	[field]: value,
})
```

3. **Fix Message Handling**:

```typescript
// Add error handling to message processing
try {
	await config.update(key, value, target)
	console.log(`[LAMINAR SETTINGS DEBUG] Successfully updated ${key}`)
} catch (error) {
	console.error(`[LAMINAR SETTINGS DEBUG] Failed to update ${key}:`, error)
}
```

#### Step 4.2: gRPC Connection Fixes

**CRITICAL FIX**: Replace HTTP fetch with proper gRPC testing

**File**: `src/services/laminar/LaminarConnectivityTester.ts`

**Fix Option A - Proper gRPC Client**:

```typescript
// Use proper gRPC client for testing instead of HTTP fetch
const grpcClient = new GrpcClient(hostname, grpcPort)
const result = await grpcClient.testConnection()
```

**Fix Option B - Basic TCP Socket**:

```typescript
// Replace HTTP fetch with TCP socket connection test
private async testTcpSocketConnectivity(hostname: string, port: number): Promise<ConnectivityTestResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = 5000

    socket.setTimeout(timeout)

    socket.on('connect', () => {
      socket.destroy()
      resolve({
        success: true,
        details: { hostname, port, note: "TCP connection successful" }
      })
    })

    socket.on('error', (error) => {
      resolve({
        success: false,
        error: `TCP connection failed: ${error.message}`,
        details: { hostname, port }
      })
    })

    socket.on('timeout', () => {
      socket.destroy()
      resolve({
        success: false,
        error: "Connection timed out",
        details: { hostname, port }
      })
    })

    socket.connect(port, hostname)
  })
}
```

**Fix Option C - Remove False Positive Logic**:

```typescript
// REMOVE the false positive logic entirely
// Lines 357-377 should be deleted or modified to be more restrictive

// Instead of treating ANY non-HTTP response as success, be more specific:
if (fetchError.message.includes("Invalid response") && (port === 8443 || port === 9443 || port === 50051)) {
	// Only common gRPC ports
	return {
		success: true,
		details: {
			hostname,
			port,
			note: "Port accepts connections and is a common gRPC port",
			error: fetchError.message,
		},
	}
}
// All other errors should be treated as failures
```

**Fix Option D - Add Port Validation**:

```typescript
// Add port validation before testing
const commonGrpcPorts = [8443, 9443, 50051, 443, 80] // Add other valid ports
if (!commonGrpcPorts.includes(port)) {
	return {
		success: false,
		error: `Port ${port} is not a common gRPC port`,
		details: { hostname, port, validPorts: commonGrpcPorts },
	}
}
```

### Phase 5: Validation and Testing

#### Step 5.1: Settings Persistence Validation

1. **Test All Settings Fields**:

    - API Key: Enter, save, verify persistence
    - Base URL: Change, save, verify persistence
    - Ports: Modify, save, verify persistence
    - Toggles: Change, save, verify persistence

2. **Test Edge Cases**:

    - Empty values
    - Special characters in API key
    - Invalid URLs
    - Out-of-range port numbers

3. **Test Persistence Scenarios**:
    - Save and immediately reopen settings
    - Save and restart VS Code
    - Save and switch workspaces

#### Step 5.2: Connection Test Validation

1. **Test Different Server Configurations**:

    - Production server (api.lmnr.ai)
    - Local development server
    - Custom server configuration

2. **Test Network Conditions**:

    - Good network connection
    - Slow network connection
    - Network with firewall restrictions

3. **Test Error Scenarios**:
    - Invalid API key
    - Server down
    - Network timeout
    - Invalid port numbers

## Implementation Checklist

### Phase 1: Settings Persistence Debug

- [ ] **Step 1.1**: Fix critical state synchronization issue
    - [ ] Add `laminarSettings: loadLaminarSettingsFromVSCode()` to `ClineProvider.getStateToPostToWebview()` return statement
    - [ ] Verify fix resolves settings persistence issue
- [ ] **Step 1.2**: Add comprehensive settings flow logging
    - [ ] UI Component Level logging (LaminarSettings.tsx)
    - [ ] Settings View Level logging (SettingsView.tsx)
    - [ ] Webview Message Handler logging (webviewMessageHandler.ts)
    - [ ] Configuration Loading logging (laminar-config.ts)
    - [ ] Extension State Loading logging (ClineProvider.ts)
- [ ] **Step 1.3**: Manual testing steps
    - [ ] Open VS Code Developer Tools
    - [ ] Navigate to Settings and enable Laminar
    - [ ] Test settings entry with debug monitoring
    - [ ] Save settings and verify persistence
    - [ ] Verify settings persist across restarts
- [ ] **Step 1.4**: State synchronization debug
    - [ ] Add state comparison logging
    - [ ] Monitor state changes in real-time

### Phase 2: gRPC Connection Test Debug

- [ ] **Step 2.1**: Fix gRPC protocol testing issue
    - [ ] Replace HTTP fetch with proper gRPC testing in `LaminarConnectivityTester.ts`
    - [ ] Choose between TCP socket, gRPC client, or protocol error acceptance
    - [ ] Verify fix resolves gRPC connection test failures
- [ ] **Step 2.2**: Enhanced connection test logging
    - [ ] Connection test entry point logging
    - [ ] Webview message handler logging
    - [ ] Connectivity tester logging
- [ ] **Step 2.3**: Network-level debugging
    - [ ] Add network diagnostic logging
    - [ ] Enhanced error analysis
- [ ] **Step 2.4**: Manual gRPC test steps
    - [ ] Test with known working server
    - [ ] Test with local server
    - [ ] Test network connectivity
    - [ ] Monitor debug logs
    - [ ] Verify gRPC test now succeeds

### Phase 3: Root Cause Analysis

- [ ] **Step 3.1**: Settings persistence analysis
    - [ ] Check VS Code configuration target
    - [ ] Verify settings schema match
    - [ ] Analyze state management issues
    - [ ] Verify webview message flow
- [ ] **Step 3.2**: gRPC connection analysis
    - [ ] Check port accessibility
    - [ ] Analyze network configuration
    - [ ] Verify protocol implementation
    - [ ] Analyze error handling

### Phase 4: Fix Implementation

- [ ] **Step 4.1**: Settings persistence fixes
    - [ ] **CRITICAL**: Add `laminarSettings: loadLaminarSettingsFromVSCode()` to `ClineProvider.getStateToPostToWebview()`
    - [ ] Fix configuration target if needed
    - [ ] Fix state synchronization if needed
    - [ ] Fix message handling if needed
- [ ] **Step 4.2**: gRPC connection fixes
    - [ ] **CRITICAL**: Replace HTTP fetch with proper gRPC testing in `LaminarConnectivityTester.ts`
    - [ ] Choose appropriate fix option (TCP socket, gRPC client, or protocol error acceptance)
    - [ ] Improve error detection if needed
    - [ ] Add fallback testing if needed

### Phase 5: Validation and Testing

- [ ] **Step 5.1**: Settings persistence validation
    - [ ] Test all settings fields
    - [ ] Test edge cases
    - [ ] Test persistence scenarios
- [ ] **Step 5.2**: Connection test validation
    - [ ] Test different server configurations
    - [ ] Test network conditions
    - [ ] Test error scenarios

## Manual Testing Protocol

### Settings Persistence Test

1. **Open VS Code Developer Tools**:

    ```
    Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
    ```

2. **Navigate to Kilo Code Settings**:

    - Open Command Palette (`Ctrl+Shift+P`)
    - Type "Kilo Code Settings"
    - Select "Open Kilo Code Settings"

3. **Enable Laminar Observability**:

    - Go to "Experimental" tab
    - Toggle "Laminar Observability" to enabled
    - Verify settings section appears

4. **Test Settings Entry**:

    - Enter API Key: `test-debug-key-12345`
    - Change Base URL to: `https://debug.lmnr.ai`
    - Change HTTP Port to: `8080`
    - Change gRPC Port to: `9443`
    - Toggle Record I/O to OFF

5. **Monitor Console Logs**:

    - Watch for `[LAMINAR SETTINGS DEBUG]` messages
    - Note any errors or unexpected values
    - Verify all input changes are logged

6. **Save Settings**:

    - Click "Save" button
    - Watch for save flow debug messages
    - Check for VS Code config update confirmations

7. **Verify Persistence**:
    - Close settings panel
    - Reopen settings
    - Verify all values are restored correctly
    - Restart VS Code and check again

### gRPC Connection Test

1. **Prepare Test Environment**:

    - Ensure valid API key is entered
    - Set base URL to `https://api.lmnr.ai`
    - Set HTTP port to `443`
    - Set gRPC port to `8443`

2. **Monitor Connection Test**:

    - Click "Test Connection" button
    - Watch console for `[LAMINAR CONNECTION DEBUG]` messages
    - Note HTTP vs gRPC test results

3. **Analyze Test Results**:

    - Check if HTTP connectivity succeeds
    - Check if gRPC connectivity fails
    - Note specific error messages
    - Verify test parameters are correct

4. **Test Different Configurations**:
    - Test with localhost server
    - Test with different ports
    - Test with invalid API key
    - Test with server down scenario

## Expected Debug Output

### Settings Persistence Debug Output

```
[LAMINAR SETTINGS DEBUG] Component mounted with props: {laminarSettings: {...}, timestamp: "2025-01-21T..."}
[LAMINAR SETTINGS DEBUG] updateField called: {field: "apiKey", value: "test-key", timestamp: "2025-01-21T..."}
[LAMINAR SETTINGS DEBUG] handleSubmit called with laminarSettings: {laminarSettings: {...}, timestamp: "2025-01-21T..."}
[LAMINAR SETTINGS DEBUG] laminarSettings message received: {messageType: "laminarSettings", values: {...}, timestamp: "2025-01-21T..."}
[LAMINAR SETTINGS DEBUG] Updating VS Code config: {key: "apiKey", value: "test-key", target: "global", timestamp: "2025-01-21T..."}
[LAMINAR SETTINGS DEBUG] VS Code config updated: {key: "apiKey", success: true, timestamp: "2025-01-21T..."}
```

### gRPC Connection Debug Output

```
[LAMINAR CONNECTION DEBUG] Test connection initiated: {testValues: {...}, timestamp: "2025-01-21T..."}
[LAMINAR CONNECTION DEBUG] testConnectionWithConfig started: {config: {...}, timestamp: "2025-01-21T..."}
[LAMINAR CONNECTION DEBUG] HTTP connectivity test starting: {baseUrl: "https://api.lmnr.ai", httpPort: 443, timestamp: "2025-01-21T..."}
[LAMINAR CONNECTION DEBUG] gRPC connectivity test starting: {baseUrl: "https://api.lmnr.ai", grpcPort: 8443, timestamp: "2025-01-21T..."}
[LAMINAR CONNECTION DEBUG] TCP connectivity test details: {hostname: "api.lmnr.ai", port: 8443, testUrl: "http://api.lmnr.ai:8443", timestamp: "2025-01-21T..."}
[LAMINAR CONNECTION DEBUG] Fetch error analysis: {errorName: "TypeError", errorMessage: "fetch failed", timestamp: "2025-01-21T..."}
```

## Success Criteria

### Settings Persistence Success

- [ ] All settings fields save correctly
- [ ] Settings persist across VS Code restarts
- [ ] Settings sync properly between webview and extension
- [ ] No errors in settings flow debug logs

### gRPC Connection Test Success

- [ ] HTTP connectivity test passes
- [ ] gRPC connectivity test provides meaningful results
- [ ] Error messages are clear and actionable
- [ ] Test works with valid server configurations

## Timeline

- **Phase 1**: 1-2 hours (Settings persistence debug - CRITICAL FIX IDENTIFIED)
- **Phase 2**: 2-3 hours (gRPC connection debug - CRITICAL FIX IDENTIFIED)
- **Phase 3**: 0.5-1 hours (Root cause analysis - COMPLETED)
- **Phase 4**: 1-2 hours (Fix implementation - CRITICAL FIXES IDENTIFIED)
- **Phase 5**: 1-2 hours (Validation and testing)

**Total Estimated Time**: 5.5-10 hours

**Note**: Both critical issues have been identified through code analysis, significantly reducing debugging time. The main fixes are:

1. Add `laminarSettings` to `ClineProvider.getStateToPostToWebview()`
2. Replace HTTP fetch with proper gRPC testing in `LaminarConnectivityTester`

## Notes

- All debug logging should use consistent prefixes for easy filtering
- Debug logs should include timestamps and operation IDs
- Manual testing steps should be documented for reproducibility
- Fixes should be implemented incrementally with validation at each step
- Consider adding unit tests for critical functionality after fixes are complete

## Quick Fix Summary

### Critical Issue #1: Settings Not Persisting

**Root Cause**: `laminarSettings` missing from main extension state
**Fix**: Add `laminarSettings: loadLaminarSettingsFromVSCode()` to `ClineProvider.getStateToPostToWebview()` return statement (line ~2237)

### Critical Issue #2: gRPC Connection Test Passing Incorrectly

**Root Cause**: False positive logic treats ANY non-HTTP response as successful gRPC (lines 357-377)
**Fix**: Remove or restrict the false positive logic in `LaminarConnectivityTester.testTcpConnectivity()` that returns `success: true` for any port that doesn't speak HTTP

## False Positive Testing Protocol

### Test the False Positive Issue

To verify the gRPC test false positive issue, test with these ports:

1. **Test with Wrong Ports** (should FAIL but currently PASS):

    - Port 22 (SSH) - should fail but currently passes
    - Port 80 (HTTP) - should fail but currently passes
    - Port 443 (HTTPS) - should fail but currently passes
    - Port 8080 (HTTP Alt) - should fail but currently passes

2. **Test with Correct Ports** (should PASS):

    - Port 8443 (standard gRPC) - should pass
    - Port 9443 (alternative gRPC) - should pass
    - Port 50051 (gRPC default) - should pass

3. **Expected Behavior After Fix**:
    - Wrong ports should return `success: false`
    - Correct ports should return `success: true`
    - Debug logs should show proper error categorization

## Related Documentation

- [Laminar Configuration Guide](docs/laminar/LAMINAR_CONFIG.md)
- [Laminar Configuration System](docs/laminar/LAMINAR_CONFIGURATION_SYSTEM.md)
- [Laminar Service Layer](docs/laminar/LAMINAR_SERVICE_LAYER.md)
- [Laminar Testing System](docs/laminar/LAMINAR_TESTING_SYSTEM.md)
- [UI Layer System](docs/ui/UI_LAYER_SYSTEM.md)
- [UI Message Flow System](docs/ui/UI_MESSAGE_FLOW_SYSTEM.md)
- [Communication Layer System](docs/architecture/COMMUNICATION_LAYER_SYSTEM.md)
