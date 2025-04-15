# Storybook for UI Components

This package includes a Storybook setup to showcase and document the UI components.

## Running Storybook

To start Storybook locally:

```bash
# From the UI package directory
pnpm storybook

# Or from the project root
pnpm --filter @repo/ui storybook
```

This will start Storybook on port 6006. Open your browser and navigate to http://localhost:6006 to view the component library.

## Building Storybook

To build a static version of Storybook:

```bash
# From the UI package directory
pnpm build-storybook

# Or from the project root
pnpm --filter @repo/ui build-storybook
```

This will create a static build in the `storybook-static` directory that can be deployed to any static hosting service.

## Adding New Stories

To add a story for a new component:

1. Create a new file named `[component-name].stories.tsx` in the same directory as your component
2. Import the component and define its stories
3. Add documentation using the `argTypes` property

Example:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { YourComponent } from "./your-component";

const meta: Meta<typeof YourComponent> = {
  title: "Components/YourComponent",
  component: YourComponent,
  tags: ["autodocs"],
  argTypes: {
    // Define the props and their controls
    someProp: {
      control: "text",
      description: "Description of the prop",
    },
  },
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Default props
    someProp: "Default value",
  },
};

export const AnotherVariant: Story = {
  args: {
    // Different props for this variant
    someProp: "Another value",
  },
};
```

## Documentation

To add documentation pages:

1. Create a new file named `[page-name].mdx` in the `src` directory
2. Use MDX to write your documentation
3. Import and showcase components as needed

Example:

```mdx
import { Meta, Story, Canvas } from '@storybook/blocks';
import * as YourComponentStories from './your-component.stories';

<Meta title="Docs/YourComponent" />

# Your Component

Description of your component.

<Canvas>
  <Story of={YourComponentStories.Default} />
</Canvas>

## Usage

```jsx
import { YourComponent } from "@repo/ui";

<YourComponent someProp="value" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| someProp | string | "" | Description of the prop |
```

## Best Practices

1. **Document all props**: Make sure all props are documented with clear descriptions
2. **Show different variants**: Create stories for different variants of your components
3. **Include usage examples**: Show how to use the component in real code
4. **Group related components**: Use the title pattern "Category/ComponentName" to organize components
5. **Use controls**: Set up controls to allow interactive testing of components
