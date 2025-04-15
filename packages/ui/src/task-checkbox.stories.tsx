import type { Meta, StoryObj } from "@storybook/react";
import { TaskCheckbox } from "./task-checkbox";

const meta: Meta<typeof TaskCheckbox> = {
  title: "Components/TaskCheckbox",
  component: TaskCheckbox,
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
      defaultValue: false,
    },
    label: {
      control: "text",
      description: "Accessible label for the checkbox",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the checkbox",
      defaultValue: "md",
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof TaskCheckbox>;

export const Unchecked: Story = {
  args: {
    checked: false,
    label: "Mark task as complete",
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    label: "Mark task as complete",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    label: "Small checkbox",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    label: "Medium checkbox",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Large checkbox",
  },
};
