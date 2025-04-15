import type { Meta, StoryObj } from "@storybook/react";
import { PriorityBadge } from "./priority-badge";
import { PriorityLevel } from "./__mocks__/schema";

const meta: Meta<typeof PriorityBadge> = {
  title: "Components/PriorityBadge",
  component: PriorityBadge,
  tags: ["autodocs"],
  argTypes: {
    priority: {
      control: { type: "select" },
      options: [PriorityLevel.HIGH, PriorityLevel.MEDIUM, PriorityLevel.LOW],
      description: "Priority level to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PriorityBadge>;

export const High: Story = {
  args: {
    priority: PriorityLevel.HIGH,
  },
};

export const Medium: Story = {
  args: {
    priority: PriorityLevel.MEDIUM,
  },
};

export const Low: Story = {
  args: {
    priority: PriorityLevel.LOW,
  },
};

export const AllPriorities: Story = {
  render: () => (
    <div className="flex flex-col space-y-2">
      <PriorityBadge priority={PriorityLevel.HIGH} />
      <PriorityBadge priority={PriorityLevel.MEDIUM} />
      <PriorityBadge priority={PriorityLevel.LOW} />
    </div>
  ),
};
