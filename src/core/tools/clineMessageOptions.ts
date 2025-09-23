import { Task } from "../task/Task"

/**
 * getClineMessageOptions
 *
 * Lightweight helper to produce options passed to Task.say()/ask() for message posting.
 * This is intentionally minimal — it mirrors the previous fallback used to unblock
 * compilation. It can be extended to include richer metadata later.
 */
export async function getClineMessageOptions(
	cline: Task,
): Promise<{ isNonInteractive?: boolean; metadata?: Record<string, unknown> }> {
	// Prefer non-interactive for system-generated messages where available.
	// If the task instance exposes contextual metadata that should be attached,
	// it can be added here.
	const isNonInteractive = true

	// Example metadata surface - keep minimal to avoid coupling.
	const metadata: Record<string, unknown> = {
		taskId: (cline as any)?.taskId,
		instanceId: (cline as any)?.instanceId,
	}

	return { isNonInteractive, metadata }
}
