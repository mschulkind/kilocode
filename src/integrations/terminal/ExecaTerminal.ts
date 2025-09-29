import type { RooTerminalCallbacks, RooTerminalProcessResultPromise } from "./types.js"
import { BaseTerminal } from "./BaseTerminal.js"
import { ExecaTerminalProcess } from "./ExecaTerminalProcess.js"
import { mergePromise } from "./mergePromise.js"

export class ExecaTerminal extends BaseTerminal {
	constructor(id: number, cwd: string) {
		super("execa", id, cwd)
	}

	/**
	 * Unlike the VSCode terminal, this is never closed.
	 */
	public override isClosed(): boolean {
		return false
	}

	public override runCommand(command: string, callbacks: RooTerminalCallbacks): RooTerminalProcessResultPromise {
		this.busy = true

		const process = new ExecaTerminalProcess(this)
		process.command = command
		this.process = process

		process.on("line", (line) => callbacks.onLine(line, process))
		process.once("completed", (output) => callbacks.onCompleted(output, process))
		process.once("shell_execution_started", (pid) => callbacks.onShellExecutionStarted(pid, process))
		process.once("shell_execution_complete", (details) => callbacks.onShellExecutionComplete(details, process))

		const promise = new Promise<void>((resolve, reject) => {
			process.once("continue", () => resolve())
			process.once("error", (error) => reject(error))
			process.run(command)
		})

		return mergePromise(process, promise)
	}
}
