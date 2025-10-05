import * as vscode from "vscode";
export class GhostGutterAnimation {
    state = "hide";
    decorationWait;
    decorationActive;
    isEnabled = true;
    constructor(context) {
        this.decorationWait = vscode.window.createTextEditorDecorationType({
            gutterIconPath: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "logo-outline-black.gif"),
            gutterIconSize: "30px",
            isWholeLine: false,
        });
        this.decorationActive = vscode.window.createTextEditorDecorationType({
            gutterIconPath: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "logo-outline-yellow.gif"),
            gutterIconSize: "30px",
            isWholeLine: false,
        });
    }
    updateSettings(settings) {
        this.isEnabled = settings?.showGutterAnimation !== false;
        if (!this.isEnabled) {
            this.clearDecorations();
        }
    }
    clearDecorations() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(this.decorationActive, []);
            editor.setDecorations(this.decorationWait, []);
        }
    }
    getPosition(editor) {
        const position = editor.selection.active;
        const document = editor.document;
        const lineEndPosition = new vscode.Position(position.line, document.lineAt(position.line).text.length);
        return new vscode.Range(lineEndPosition, lineEndPosition);
    }
    update() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        if (!this.isEnabled || this.state == "hide") {
            this.clearDecorations();
            return;
        }
        const position = this.getPosition(editor);
        if (this.state == "wait") {
            editor.setDecorations(this.decorationActive, []);
            editor.setDecorations(this.decorationWait, [position]);
            return;
        }
        editor.setDecorations(this.decorationWait, []);
        editor.setDecorations(this.decorationActive, [position]);
    }
    wait() {
        this.state = "wait";
        this.update();
    }
    active() {
        this.state = "active";
        this.update();
    }
    hide() {
        this.state = "hide";
        this.update();
    }
    dispose() {
        const editor = vscode.window.activeTextEditor;
        editor?.setDecorations(this.decorationActive, []);
        editor?.setDecorations(this.decorationWait, []);
        this.decorationWait.dispose();
        this.decorationActive.dispose();
    }
}
//# sourceMappingURL=GhostGutterAnimation.js.map