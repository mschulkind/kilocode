import * as path from "path"
import { randomUUID } from "crypto"

import { CheckpointServiceOptions } from "./types"
import { ShadowCheckpointService } from "./ShadowCheckpointService"
import { CheckpointRestoreOptions, CheckpointDiffOptions } from "../../core/checkpoints"

export class RepoPerTaskCheckpointService extends ShadowCheckpointService {
	public static create({ taskId, workspaceDir, shadowDir, log = console.log }: CheckpointServiceOptions) {
		return new RepoPerTaskCheckpointService(
			taskId,
			path.join(shadowDir, "tasks", taskId, "checkpoints"),
			workspaceDir,
			log,
		)
	}

	public async checkpointSave(force: boolean = false, suppressMessage: boolean = false): Promise<void> {
		const operationId = randomUUID()
		const timestamp = new Date().toISOString()
		const params = { force, suppressMessage }

		console.log(
			`[Checkpoint Tracing] Starting RepoPerTaskCheckpointService.save - ID: ${operationId}, Timestamp: ${timestamp}, TaskId: ${this.taskId}, Params: ${JSON.stringify(params)}`,
		)

		console.log(`[Checkpoint Tracing] Before super.saveCheckpoint call - ID: ${operationId}`)
		await super.saveCheckpoint(`Task: ${this.taskId}, Time: ${Date.now()}`, { allowEmpty: force, suppressMessage })
		console.log(`[Checkpoint Tracing] After super.saveCheckpoint call - ID: ${operationId}`)

		console.log(`[Checkpoint Tracing] Completed RepoPerTaskCheckpointService.save - ID: ${operationId}`)
	}

	public async checkpointRestore(options: CheckpointRestoreOptions): Promise<void> {
		const operationId = randomUUID()
		const timestamp = new Date().toISOString()
		const params = options

		console.log(
			`[Checkpoint Tracing] Starting RepoPerTaskCheckpointService.restore - ID: ${operationId}, Timestamp: ${timestamp}, TaskId: ${this.taskId}, Params: ${JSON.stringify(params)}`,
		)

		console.log(`[Checkpoint Tracing] Before super.restoreCheckpoint call - ID: ${operationId}`)
		await super.restoreCheckpoint(options.commitHash)
		console.log(`[Checkpoint Tracing] After super.restoreCheckpoint call - ID: ${operationId}`)

		console.log(`[Checkpoint Tracing] Completed RepoPerTaskCheckpointService.restore - ID: ${operationId}`)
	}

	public async checkpointDiff(options: CheckpointDiffOptions): Promise<void> {
		const operationId = randomUUID()
		const timestamp = new Date().toISOString()
		const params = options

		console.log(
			`[Checkpoint Tracing] Starting RepoPerTaskCheckpointService.diff - ID: ${operationId}, Timestamp: ${timestamp}, TaskId: ${this.taskId}, Params: ${JSON.stringify(params)}`,
		)

		console.log(`[Checkpoint Tracing] Before super.getDiff call - ID: ${operationId}`)
		await super.getDiff({ from: options.commitHash, to: options.previousCommitHash })
		console.log(`[Checkpoint Tracing] After super.getDiff call - ID: ${operationId}`)

		console.log(`[Checkpoint Tracing] Completed RepoPerTaskCheckpointService.diff - ID: ${operationId}`)
	}
}
