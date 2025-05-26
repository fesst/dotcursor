# Cursor Configuration

This directory contains global configuration files for Cursor IDE, migrated from Neovim configuration.

## Configuration Files

- `settings.json` - Main Cursor settings
- `extensions.json` - Recommended extensions
- `.gitignore` - Git ignore rules for Cursor files

## Features

- Vim mode with custom keybindings

## Infrastructure

The `infra` directory contains scripts and tools for managing Cursor's development environment.

### Extension Sync System

The extension sync system automatically manages and tracks installed VS Code extensions in your Cursor environment.

#### Purpose
- Automatically detects installed VS Code extensions
- Maintains a list of recommended extensions in `extensions.json`
- Ensures consistency across team members' development environments

#### How it Works
1. Scans the `~/.cursor/extensions` directory for installed extensions
2. Updates `extensions.json` with any new extensions found
3. Maintains a sorted list of all extensions
4. Logs all operations to `extension-sync.log`

#### Configuration
- Extensions directory: `~/.cursor/extensions`
- Configuration file: `~/.cursor/extensions.json`
- Log file: `~/.cursor/infra/extension-sync.log`

### Git Integration

#### Pre-commit Hook
The pre-commit hook ensures that extension changes are properly tracked in version control.

Location: `.git/hooks/pre-commit`

Functionality:
- Runs automatically before each commit
- Executes the extension sync script
- Ensures `extensions.json` is up to date
- Automatically stages changes to `extensions.json`

Setup:
```bash
# Make the pre-commit hook executable
chmod +x .git/hooks/pre-commit
```

## Usage

### Manual Extension Sync
To manually sync extensions:
```bash
node infra/sync-extensions.js
```

### Viewing Logs
Extension sync operations are logged to `infra/extension-sync.log`. You can view the log file to track changes and troubleshoot issues.

## Troubleshooting

### Common Issues

1. **Pre-commit hook not running**
   - Ensure the hook is executable: `chmod +x .git/hooks/pre-commit`
   - Verify the hook exists in `.git/hooks/`

2. **Extension sync fails**
   - Check `extension-sync.log` for error messages
   - Verify you have write permissions in the `.cursor` directory
   - Ensure Node.js is installed and accessible

3. **Git integration issues**
   - Verify you're in a git repository
   - Check git permissions and configuration

## Contributing

When adding new extensions to the project:
1. Install the extension in Cursor
2. The pre-commit hook will automatically detect and add it to `extensions.json`
3. Commit the changes to share the extension with the team

## Links

- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Node.js Documentation](https://nodejs.org/docs/)
