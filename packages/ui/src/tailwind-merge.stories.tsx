import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "./tailwind-merge";

// Create a demo component to showcase the cn utility
const CnDemo = ({
  baseClasses = "p-4 bg-gray-100 rounded",
  conditionalClasses = "text-blue-500 font-bold",
  condition = true,
  overrideClasses = "bg-blue-100",
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Input Classes</h3>
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
          {`cn(
  "${baseClasses}", // Base classes
  ${condition ? "true" : "false"} && "${conditionalClasses}", // Conditional classes
  "${overrideClasses}" // Override classes
)`}
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Result</h3>
        <div
          className={cn(
            baseClasses,
            condition && conditionalClasses,
            overrideClasses
          )}
        >
          This element has the merged classes applied
        </div>
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
          {cn(baseClasses, condition && conditionalClasses, overrideClasses)}
        </pre>
      </div>
    </div>
  );
};

const meta: Meta<typeof CnDemo> = {
  title: "Utilities/cn",
  component: CnDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The `cn()` utility function is used to conditionally merge Tailwind CSS classes. It uses `clsx` and `tailwind-merge` under the hood to handle class conflicts correctly.",
      },
    },
  },
  argTypes: {
    baseClasses: {
      control: "text",
      description: "Base classes that are always applied",
    },
    conditionalClasses: {
      control: "text",
      description: "Classes that are conditionally applied",
    },
    condition: {
      control: "boolean",
      description: "Whether to apply the conditional classes",
    },
    overrideClasses: {
      control: "text",
      description: "Classes that override previous classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CnDemo>;

export const Default: Story = {
  args: {
    baseClasses: "p-4 bg-gray-100 rounded",
    conditionalClasses: "text-blue-500 font-bold",
    condition: true,
    overrideClasses: "bg-blue-100",
  },
};

export const WithoutCondition: Story = {
  args: {
    baseClasses: "p-4 bg-gray-100 rounded",
    conditionalClasses: "text-blue-500 font-bold",
    condition: false,
    overrideClasses: "bg-blue-100",
  },
};

export const ConflictingClasses: Story = {
  args: {
    baseClasses: "p-4 bg-gray-100 rounded text-gray-800",
    conditionalClasses: "text-blue-500 font-bold",
    condition: true,
    overrideClasses: "bg-blue-100 p-6",
  },
};

export const Examples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Basic Usage</h3>
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
          {`import { cn } from "@repo/ui";

<div className={cn("base-classes", condition && "conditional-classes")}>
  Content
</div>`}
        </pre>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">With Ternary Operator</h3>
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
          {`<div className={cn(
  "base-classes",
  condition ? "true-classes" : "false-classes"
)}>
  Content
</div>`}
        </pre>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">With Class Conflicts</h3>
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
          {`// Without cn()
<div className="p-4 text-red-500 p-6">
  The p-4 will be overridden by p-6, but both classes remain in the string
</div>

// With cn()
<div className={cn("p-4 text-red-500", "p-6")}>
  The p-4 will be properly replaced by p-6
</div>`}
        </pre>
      </div>
    </div>
  ),
};
