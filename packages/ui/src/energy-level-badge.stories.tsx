import type { Meta, StoryObj } from "@storybook/react";
import { EnergyLevelBadge } from "./energy-level-badge";
import { EnergyLevel } from "./__mocks__/schema";

const meta: Meta<typeof EnergyLevelBadge> = {
  title: "Components/EnergyLevelBadge",
  component: EnergyLevelBadge,
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: { type: "select" },
      options: [EnergyLevel.HIGH, EnergyLevel.MEDIUM, EnergyLevel.LOW, null],
      description: "Energy level to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnergyLevelBadge>;

export const High: Story = {
  args: {
    level: EnergyLevel.HIGH,
  },
};

export const Medium: Story = {
  args: {
    level: EnergyLevel.MEDIUM,
  },
};

export const Low: Story = {
  args: {
    level: EnergyLevel.LOW,
  },
};

export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-col space-y-2">
      <EnergyLevelBadge level={EnergyLevel.HIGH} />
      <EnergyLevelBadge level={EnergyLevel.MEDIUM} />
      <EnergyLevelBadge level={EnergyLevel.LOW} />
    </div>
  ),
};
