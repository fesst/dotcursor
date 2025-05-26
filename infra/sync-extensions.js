#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CURSOR_DIR = path.join(process.env.HOME, '.cursor');
const EXTENSIONS_DIR = path.join(CURSOR_DIR, 'extensions');
const EXTENSIONS_JSON = path.join(CURSOR_DIR, 'extensions.json');
const LOG_FILE = path.join(CURSOR_DIR, 'infra', 'extension-sync.log');

// Logging function
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;

    // Log to console
    console.log(logMessage.trim());

    // Log to file
    fs.appendFileSync(LOG_FILE, logMessage);
}

// Main sync function
function syncExtensions() {
    try {
        log('Starting extension sync process');

        // Read the current extensions.json
        let extensionsConfig;
        try {
            extensionsConfig = JSON.parse(fs.readFileSync(EXTENSIONS_JSON, 'utf8'));
            log('Successfully read extensions.json');
        } catch (error) {
            log(`Error reading extensions.json: ${error.message}`, 'ERROR');
            process.exit(1);
        }

        // Get all installed extensions
        const installedExtensions = new Set();
        try {
            const extensions = fs.readdirSync(EXTENSIONS_DIR);
            for (const ext of extensions) {
                // Skip non-extension directories and files
                if (ext.startsWith('.') || !ext.includes('.')) continue;

                // Extract the extension ID (publisher.name)
                const match = ext.match(/^([^.]+)\.([^-]+)/);
                if (match) {
                    const [_, publisher, name] = match;
                    installedExtensions.add(`${publisher}.${name}`);
                }
            }
            log(`Found ${installedExtensions.size} installed extensions`);
        } catch (error) {
            log(`Error reading extensions directory: ${error.message}`, 'ERROR');
            process.exit(1);
        }

        // Update recommendations list
        const currentRecommendations = new Set(extensionsConfig.recommendations || []);
        const allRecommendations = new Set([...currentRecommendations, ...installedExtensions]);
        const newExtensions = Array.from(installedExtensions).filter(ext => !currentRecommendations.has(ext));

        // Sort recommendations alphabetically
        extensionsConfig.recommendations = Array.from(allRecommendations).sort();

        // Write back to extensions.json
        try {
            fs.writeFileSync(
                EXTENSIONS_JSON,
                JSON.stringify(extensionsConfig, null, 2) + '\n',
                'utf8'
            );
            log('Successfully updated extensions.json');

            if (newExtensions.length > 0) {
                log(`Added new extensions: ${newExtensions.join(', ')}`);
            } else {
                log('No new extensions to add');
            }
        } catch (error) {
            log(`Error writing extensions.json: ${error.message}`, 'ERROR');
            process.exit(1);
        }

        // If in a git repository, add the changes
        try {
            const gitStatus = execSync('git status --porcelain', { cwd: CURSOR_DIR }).toString();
            if (gitStatus.includes('extensions.json')) {
                execSync('git add extensions.json', { cwd: CURSOR_DIR });
                log('Added extensions.json to git staging');
            }
        } catch (error) {
            // Ignore git errors - not in a git repository or git not installed
            log('Not in a git repository or git not installed', 'WARN');
        }

        log('Extension sync completed successfully');
    } catch (error) {
        log(`Unexpected error: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

// Run the sync
syncExtensions();
