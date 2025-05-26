const fs = require('fs');
const path = require('path');

const CURSOR_DIR = path.join(process.env.HOME, '.cursor');
const EXTENSIONS_DIR = path.join(CURSOR_DIR, 'extensions');
const EXTENSIONS_JSON = path.join(CURSOR_DIR, 'extensions.json');

// Read the current extensions.json
let extensionsConfig;
try {
    extensionsConfig = JSON.parse(fs.readFileSync(EXTENSIONS_JSON, 'utf8'));
} catch (error) {
    console.error('Error reading extensions.json:', error);
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
} catch (error) {
    console.error('Error reading extensions directory:', error);
    process.exit(1);
}

// Update recommendations list
const currentRecommendations = new Set(extensionsConfig.recommendations || []);
const allRecommendations = new Set([...currentRecommendations, ...installedExtensions]);

// Sort recommendations alphabetically
extensionsConfig.recommendations = Array.from(allRecommendations).sort();

// Write back to extensions.json
try {
    fs.writeFileSync(
        EXTENSIONS_JSON,
        JSON.stringify(extensionsConfig, null, 2) + '\n',
        'utf8'
    );
    console.log('Successfully updated extensions.json');
    console.log('Added extensions:', Array.from(installedExtensions).filter(ext => !currentRecommendations.has(ext)));
} catch (error) {
    console.error('Error writing extensions.json:', error);
    process.exit(1);
}
