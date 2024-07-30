const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.copyContentsWithPaths', async function (uri, uris) {
        let selectedFiles = [];

        if (uris && uris.length > 0) {
            // Multiple files selected in explorer
            selectedFiles = uris;
        } else if (uri) {
            // Single file selected in explorer
            selectedFiles = [uri];
        } else if (vscode.window.activeTextEditor) {
            // File open in editor
            selectedFiles = [vscode.window.activeTextEditor.document.uri];
        } else {
            // No selection, use all files in workspace
            selectedFiles = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 1000);
        }

        if (selectedFiles.length === 0) {
            vscode.window.showInformationMessage('No files found or selected.');
            return;
        }

        let result = '';
        const divider = '='.repeat(80) + '\n';

        for (const fileUri of selectedFiles) {
            const filePath = fileUri.fsPath;
            const relativePath = vscode.workspace.asRelativePath(filePath);
            try {
                const fileContent = await fs.readFile(filePath, 'utf8');
                
                result += divider;
                result += `File: ${relativePath}\n`;
                result += divider;
                result += `Content:\n${fileContent}\n\n`;
            } catch (error) {
                console.error(`Error reading file ${filePath}: ${error}`);
            }
        }

        vscode.env.clipboard.writeText(result);
        vscode.window.showInformationMessage(`Copied contents and paths of ${selectedFiles.length} file(s) to clipboard.`);
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};