# Prometheus Engine Editor - User Guide

This guide will help you get started with the Prometheus Engine Editor, an application for creating and editing game scenes.

## Getting Started

### Installation

1. Ensure you have Node.js and pnpm installed on your system
2. Clone the Prometheus Engine repository
3. Navigate to the editor package directory:
   ```
   cd prometheus-engine/packages/editor
   ```
4. Install dependencies:
   ```
   pnpm install
   ```

### Running the Editor

You can run the editor in different modes:

#### Development Mode

```
pnpm run dev
```

This starts the editor in development mode with hot reloading.

#### Production Mode

```
pnpm run build
pnpm run start
```

This builds and runs the editor in production mode.

#### Debug Mode

Use the VS Code "Run Editor Debug" task to launch with DevTools enabled for debugging.

## Interface Overview

The Prometheus Engine Editor is divided into three main panels:

### Hierarchy Panel

Located on the left side, this panel displays the structure of your game scene:

- **Scenes**: The top level containers for your game content
- **Entities**: Game objects that can contain multiple components
- **Components**: Building blocks that define entity behavior and appearance

To use the Hierarchy Panel:

- Click on any item to select it
- Click the arrow next to an item to expand or collapse its children
- Right-click for additional context options (when implemented)

### Scene View Panel

Located in the center, this panel provides a visual representation of your game scene:

- Different shapes represent different entity types
- Colors indicate the entity's role or category
- Selected entities are highlighted

The Scene View provides these interactions:

- Click an entity to select it
- Use mouse controls (when implemented) to navigate the scene

### Properties Panel

Located on the right side, this panel displays and allows editing of properties for the currently selected item:

- When an entity is selected, its properties are displayed
- When a component is selected, component-specific properties are shown
- Property fields automatically adapt to the property type (text, number, checkbox, etc.)

To edit properties:

- Click on a property field to modify its value
- Press Enter or click away to confirm changes
- Different property types have different editors (text fields, dropdowns, etc.)

## Working with Game Data

### Loading a Game

Currently, the editor loads mock game data for development purposes. In future versions, you will be able to:

1. Select "Open Game" from the File menu
2. Browse to a game project directory
3. Select the game configuration file to load

### Creating and Editing Entities

To work with entities:

1. Select an entity in the Hierarchy Panel to view and edit its properties
2. Modify properties in the Properties Panel
3. See visual representation update in the Scene View Panel

### Working with Components

Components define the behavior and appearance of entities:

1. Select a component in the Hierarchy Panel
2. View and edit component-specific properties in the Properties Panel

## Keyboard Shortcuts

- **Ctrl/Cmd + O**: Open a game (when implemented)
- **Ctrl/Cmd + S**: Save the current scene (when implemented)
- **Delete**: Remove the selected entity or component (when implemented)
- **Ctrl/Cmd + Z**: Undo last action (when implemented)
- **Ctrl/Cmd + Shift + Z**: Redo last action (when implemented)

## Troubleshooting

### Editor Won't Start

1. Check that all dependencies are installed:

   ```
   pnpm install
   ```

2. Verify that port 5173 is available (used by the Vite development server)

3. Try running just the renderer:
   ```
   pnpm run dev:renderer
   ```

### Visual Glitches

If you experience visual glitches in the Scene View:

1. Try resizing the editor window
2. Restart the application
3. Check your graphics drivers are up to date

### Property Editing Issues

If property changes don't apply correctly:

1. Click outside the field after making changes
2. Ensure you're editing the correct property for the selected item
3. Check for any validation errors in the console

## Getting Help

If you encounter issues or have questions:

1. Check the developer documentation in the `docs` folder
2. Refer to the fixes.md file for known issues and solutions
3. File an issue on the project's issue tracker
