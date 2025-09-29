// kilocode_change - new file
import * as vscode from "vscode"
import { TerminalWelcomeService } from "./TerminalWelcomeService.js"

export const registerWelcomeService = (context: vscode.ExtensionContext): void => {
	TerminalWelcomeService.register(context)
}
