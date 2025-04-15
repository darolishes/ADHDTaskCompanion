# UI Component Library

This package contains reusable UI components for the ADHD Task Companion application.

[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](./STORYBOOK.md)

## Installation

```bash
pnpm install @repo/ui
```

## Usage

Import the components you need:

```tsx
import { TaskCard, TaskCheckbox, TaskAction, LoadingSpinner } from "@repo/ui";
```

Make sure to import the styles in your application:

```tsx
import "@repo/ui/styles.css";
```

## Available Components

### TaskCard

A card component for displaying task information.

```tsx
<TaskCard interactive>
  <TaskCardHeader>
    <TaskCardTitle>Task Title</TaskCardTitle>
  </TaskCardHeader>
  <TaskCardContent>
    <p>Task description goes here</p>
  </TaskCardContent>
  <TaskCardFooter>
    <Button>Action</Button>
  </TaskCardFooter>
</TaskCard>
```

### TaskCheckbox

A checkbox component for marking tasks as complete.

```tsx
<TaskCheckbox
  checked={isCompleted}
  onClick={handleToggleComplete}
  label="Mark task as complete"
/>
```

### TaskAction

An action button for task-related actions.

```tsx
<TaskAction
  icon={<PlayIcon className="h-4 w-4" />}
  label="Focus on task"
  variant="primary"
  onClick={handleFocus}
/>
```

### LoadingSpinner

A loading spinner component.

```tsx
<LoadingSpinner size="md" text="Loading tasks..." />
```

## CSS Utility Classes

This package also provides CSS utility classes that can be used in your application:

### Card Components

- `card-base`: Base card styling
- `card-interactive`: Interactive card with hover effects

### Layout Components

- `flex-center`: Centered flex container
- `flex-between`: Flex container with space between

### Task Components

- `task-container`: Container for task items
- `task-container-interactive`: Interactive task container
- `task-title`: Task title styling
- `task-metadata`: Task metadata styling
- `task-action-button`: Task action button styling
- `task-checkbox-base`: Base task checkbox styling
- `task-checkbox-unchecked`: Unchecked task checkbox styling
- `task-checkbox-checked`: Checked task checkbox styling

### Task Step Components

- `task-step`: Task step container
- `task-step-completed`: Completed task step styling
- `task-step-current`: Current task step styling
- `task-step-upcoming`: Upcoming task step styling
- `task-step-indicator`: Task step indicator styling
- `task-step-indicator-completed`: Completed task step indicator styling
- `task-step-indicator-current`: Current task step indicator styling
- `task-step-indicator-upcoming`: Upcoming task step indicator styling
- `task-step-text`: Task step text styling
- `task-step-text-completed`: Completed task step text styling
- `task-step-text-current`: Current task step text styling

### Loading States

- `loading-spinner`: Loading spinner styling
- `loading-text`: Loading text styling

## Best Practices

1. Use the `cn()` utility function to conditionally apply classes:

```tsx
import { cn } from "@repo/ui";

<div
  className={cn(
    "base-class",
    condition && "conditional-class",
    anotherCondition ? "true-class" : "false-class"
  )}
>
  Content
</div>;
```

2. Prefer using the provided components over creating new ones with similar functionality.

3. When creating new components, follow the same pattern of using the `cn()` utility for class merging.

4. Use the CSS utility classes to maintain consistent styling across the application.

## Storybook

This package includes a Storybook setup to showcase and document the UI components. See [STORYBOOK.md](./STORYBOOK.md) for more information.

### Running Storybook

```bash
# From the UI package directory
pnpm storybook

# Or from the project root
pnpm --filter @repo/ui storybook
```

This will start Storybook on port 6006. Open your browser and navigate to http://localhost:6006 to view the component library.
