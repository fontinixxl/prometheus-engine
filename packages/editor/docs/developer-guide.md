# Prometheus Engine Editor - Developer Documentation

This document provides detailed technical information about the implementation of the Prometheus Engine Editor.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Component Structure](#component-structure)
4. [Game Entity System](#game-entity-system)
5. [Panel Implementation Details](#panel-implementation-details)
6. [Debugging Guide](#debugging-guide)

## Architecture Overview

The Prometheus Engine Editor is built as an Electron application with React for the UI. The architecture follows these key principles:

- **Isolation**: The main and renderer processes are clearly separated
- **Component-Based UI**: All UI elements are modular React components
- **Data-Driven Design**: Game data flows through the application in a predictable way
- **Extensible Panels**: The editor uses a panel system that can be extended with new functionality

### Main Process (`main.ts`)

Handles the Electron window management, file system access, and IPC communication with the renderer process.

### Renderer Process (`renderer/main.tsx`)

Manages the React application, UI rendering, and user interaction. It communicates with the main process via IPC for file operations.

## Data Flow

The data flow follows this pattern:

1. Game data is loaded via the `gameLoader.ts` utility
2. The `App.tsx` component maintains application state including:
   - Currently loaded game
   - Selected entity/component
   - Panel layout and visibility
3. This state is passed down to panel components as props
4. User interactions in panels update the state in `App.tsx`
5. State changes trigger re-renders of affected components

## Component Structure

### App Component

The root component that manages the overall application state and layout. It contains:

- Panel container and layout management
- Game selection and loading
- Global state management for selected entities

### Panel Components

All panels extend from a common panel structure and include:

- **HierarchyPanel**: Tree view of game entities
- **SceneViewPanel**: Visual representation of the scene
- **PropertiesPanel**: Property editor for selected items

### Utility Components

- **PropertyField**: Renders different input types based on property values
- **TreeView**: Provides expandable tree structure for hierarchy display

## Game Entity System

The entity system is built around these key interfaces:

### `Entity` Interface

```typescript
interface Entity {
  id: string;
  name: string;
  components: Record<string, Component>;
  // Additional properties...
}
```

### `Component` Interface

```typescript
interface Component {
  type: string;
  properties: Record<string, any>;
  // Additional properties...
}
```

### `Scene` Interface

```typescript
interface Scene {
  id: string;
  name: string;
  entities: Entity[];
  // Additional properties...
}
```

### Mock Implementation

For development purposes, we've created an enhanced mock game implementation in `games.enhanced.ts` that generates realistic game data with:

- Multiple entity types with different visual representations
- Component hierarchies with nested properties
- Scene structures that mimic real game organization

## Panel Implementation Details

### HierarchyPanel

The hierarchy panel uses a recursive tree structure to display entities and components:

- Entities are shown as expandable nodes
- Components are shown as children of entity nodes
- Selection is tracked via a selected item ID in the app state
- Expanding/collapsing nodes is managed via local component state

### SceneViewPanel

The scene view renders a visual representation of game entities:

- Uses HTML Canvas for rendering
- Draws different shapes based on entity component types
- Implements basic camera controls (pan, zoom)
- Highlights selected entities

### PropertiesPanel

The properties panel dynamically renders form controls based on selected item properties:

- Detects property types and renders appropriate inputs
- Handles property updates via onChange events
- Manages validation and type conversion

## Debugging Guide

### Using DevTools

The VS Code task "Run Editor Debug" launches the app with Chrome DevTools enabled:

1. For renderer process: DevTools opens automatically
2. For main process: Use "View" > "Toggle Developer Tools" in the app menu

### Common Debug Scenarios

#### Debugging State Updates

Place breakpoints in component render methods or useEffect hooks to track state changes.

#### Inspecting Component Props

Use the React DevTools "Components" tab to inspect the props passed to any component.

#### Electron IPC Communication

Add console logs in the IPC handlers in both main and renderer processes to debug communication.

#### Panel Rendering Issues

Use the React Profiler to identify performance bottlenecks in panel rendering.

---

This documentation will be updated as the editor evolves with new features and improvements.
