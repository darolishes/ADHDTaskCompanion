import type { Meta, StoryObj } from "@storybook/react";
import { TaskAction } from "./task-action";

// Mock icons for the stories
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const meta: Meta<typeof TaskAction> = {
  title: "Components/TaskAction",
  component: TaskAction,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "ghost"],
      description: "Visual style of the action button",
      defaultValue: "ghost",
    },
    label: {
      control: "text",
      description: "Accessible label for the action",
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof TaskAction>;

export const Primary: Story = {
  args: {
    variant: "primary",
    icon: <PlayIcon />,
    label: "Start task",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    icon: <EditIcon />,
    label: "Edit task",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    icon: <DeleteIcon />,
    label: "Delete task",
  },
};
