// kilocode_change - new file
import * as vscode from "vscode";
import { t } from "../../i18n";
import { getKeybindingForCommand } from "../../utils/keybindings";
/**
 * Service that displays welcome messages in newly opened terminals
 */
export class TerminalWelcomeService {
    context;
    disposables = [];
    tipShownThisSession = false;
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        const terminalWelcomeService = new TerminalWelcomeService(context);
        terminalWelcomeService.initialize();
        context.subscriptions.push(terminalWelcomeService);
    }
    initialize() {
        const onDidOpenTerminal = vscode.window.onDidOpenTerminal((terminal) => {
            this.handleTerminalOpened(terminal);
        });
        this.disposables.push(onDidOpenTerminal);
        vscode.window.terminals.forEach((terminal) => {
            this.handleTerminalOpened(terminal);
        });
    }
    handleTerminalOpened(terminal) {
        if (this.tipShownThisSession) {
            return; // Don't show the tip if already shown this session
        }
        this.tipShownThisSession = true; // kilocode_change: Mark as shown for this session
        setTimeout(() => this.showWelcomeMessage(terminal), 500);
    }
    async showWelcomeMessage(terminal) {
        const shortcut = await getKeybindingForCommand("kilo-code.generateTerminalCommand");
        const message = t("kilocode:terminalCommandGenerator.tipMessage", { shortcut });
        vscode.window.showInformationMessage(message);
    }
    dispose() {
        this.disposables.forEach((disposable) => disposable.dispose());
        this.disposables = [];
    }
}
//# sourceMappingURL=TerminalWelcomeService.js.map