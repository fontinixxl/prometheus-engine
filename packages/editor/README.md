# Prometheus Engine Editor

A visual editor for Prometheus Engine game projects. This Electron application allows you to create, edit, and visualize game scenes, entities, and their components.

![Editor Screenshot Placeholder]

## Features

- **Scene Hierarchy Visualization**: View and navigate your game's entity hierarchy
- **Visual Scene Editor**: See and interact with game entities in a visual canvas
- **Property Inspector**: View and edit entity and component properties
- **Component Management**: Add, remove, and configure entity components

## Getting Started

### Prerequisites

- Node.js 16 or later
- pnpm package manager

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/prometheus-engine.git
   cd prometheus-engine
   ```

2. Install dependencies

   ```bash
   cd packages/editor
   pnpm install
   ```

3. Start the development server
   ```bash
   pnpm run dev
   ```

### Production Build

To create a production build:

```bash
pnpm run build
pnpm run start
```

## Development

### Project Structure

The editor is structured into several key areas:

- `src/main.ts` - Electron main process
- `src/renderer/` - React application and UI components
- `src/renderer/components/` - Reusable UI components
- `src/renderer/components/panels/` - Editor panel implementations
- `src/renderer/utils/` - Utility functions and game data handling

### VS Code Tasks

Several VS Code tasks are available to streamline development:

- **Run Editor Dev**: Start the application in development mode
- **Build Editor**: Create a production build
- **Start Editor**: Run the production build
- **Run Editor Debug**: Launch with DevTools enabled for debugging

To run a task:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Run Task" and press Enter
3. Select the desired task

### Documentation

For more detailed information, see the following documents:

- [Developer Guide](docs/developer-guide.md): Technical details about the implementation
- [User Guide](docs/user-guide.md): Instructions for using the editor
- [Fixes](fixes.md): Information about fixes and improvements made to the editor

## Current Status

The editor is currently in active development with the following features implemented:

- ✅ Basic Electron application structure
- ✅ Panel layout with resize capability
- ✅ Hierarchy panel with scene and entity display
- ✅ Scene view panel with basic entity visualization
- ✅ Properties panel with property editing
- ✅ Mock game implementation for development

Upcoming features:

- ⏳ Loading real game projects
- ⏳ Saving scene changes
- ⏳ Advanced entity manipulation (creation, deletion)
- ⏳ Visual transform tools

## License

This project is licensed under [LICENSE INFORMATION]
