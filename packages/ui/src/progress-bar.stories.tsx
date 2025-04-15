import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./progress-bar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current value of the progress bar",
    },
    max: {
      control: { type: "number", min: 1 },
      description: "Maximum value of the progress bar",
      defaultValue: 100,
    },
    variant: {
      control: { type: "select" },
      options: ["default", "success", "warning", "danger"],
      description: "Visual style of the progress bar",
      defaultValue: "default",
    },
    showLabel: {
      control: "boolean",
      description: "Whether to show a percentage label",
      defaultValue: false,
    },
    labelPosition: {
      control: { type: "radio" },
      options: ["inside", "outside"],
      description: "Position of the percentage label",
      defaultValue: "outside",
    },
    height: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Height of the progress bar",
      defaultValue: "md",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Success: Story = {
  args: {
    value: 75,
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    value: 50,
    variant: "warning",
  },
};

export const Danger: Story = {
  args: {
    value: 25,
    variant: "danger",
  },
};

export const Small: Story = {
  args: {
    value: 50,
    height: "sm",
  },
};

export const Medium: Story = {
  args: {
    value: 50,
    height: "md",
  },
};

export const Large: Story = {
  args: {
    value: 50,
    height: "lg",
  },
};

export const WithOutsideLabel: Story = {
  args: {
    value: 65,
    showLabel: true,
    labelPosition: "outside",
  },
};

export const WithInsideLabel: Story = {
  args: {
    value: 65,
    showLabel: true,
    labelPosition: "inside",
    height: "lg",
  },
};

export const ProgressStages: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressBar value={0} showLabel labelPosition="outside" />
      <ProgressBar value={25} showLabel labelPosition="outside" />
      <ProgressBar value={50} showLabel labelPosition="outside" />
      <ProgressBar value={75} showLabel labelPosition="outside" />
      <ProgressBar value={100} showLabel labelPosition="outside" />
    </div>
  ),
};
