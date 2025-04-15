import type { Meta, StoryObj } from "@storybook/react";
import { 
  TaskCard, 
  TaskCardHeader, 
  TaskCardContent, 
  TaskCardFooter, 
  TaskCardTitle, 
  TaskCardDescription 
} from "./task-card";
import { Button } from "./button";

const meta: Meta<typeof TaskCard> = {
  title: "Components/TaskCard",
  component: TaskCard,
  tags: ["autodocs"],
  argTypes: {
    interactive: {
      control: "boolean",
      description: "Whether the card has hover effects",
      defaultValue: false,
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

export const Default: Story = {
  args: {
    children: (
      <>
        <TaskCardHeader>
          <TaskCardTitle>Complete Project Proposal</TaskCardTitle>
          <TaskCardDescription>Due tomorrow at 5:00 PM</TaskCardDescription>
        </TaskCardHeader>
        <TaskCardContent>
          <p>Finish the project proposal for the client meeting.</p>
        </TaskCardContent>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <>
        <TaskCardHeader>
          <TaskCardTitle>Complete Project Proposal</TaskCardTitle>
          <TaskCardDescription>Due tomorrow at 5:00 PM</TaskCardDescription>
        </TaskCardHeader>
        <TaskCardContent>
          <p>Finish the project proposal for the client meeting.</p>
        </TaskCardContent>
      </>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    interactive: true,
    children: (
      <>
        <TaskCardHeader>
          <TaskCardTitle>Complete Project Proposal</TaskCardTitle>
          <TaskCardDescription>Due tomorrow at 5:00 PM</TaskCardDescription>
        </TaskCardHeader>
        <TaskCardContent>
          <p>Finish the project proposal for the client meeting.</p>
        </TaskCardContent>
        <TaskCardFooter>
          <Button>Start Task</Button>
        </TaskCardFooter>
      </>
    ),
  },
};
