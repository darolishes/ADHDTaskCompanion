import type { Meta, StoryObj } from "@storybook/react";
import { Heading, Text } from "./typography";

// Heading Stories
const headingMeta: Meta<typeof Heading> = {
  title: "Typography/Heading",
  component: Heading,
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["h1", "h2", "h3", "h4"],
      description: "HTML heading element to render",
      defaultValue: "h2",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "2xl"],
      description: "Size of the heading",
      defaultValue: "lg",
    },
    children: {
      control: "text",
      description: "Content of the heading",
    },
  },
};

export default headingMeta;
type HeadingStory = StoryObj<typeof Heading>;

export const Default: HeadingStory = {
  args: {
    children: "This is a heading",
  },
};

export const Small: HeadingStory = {
  args: {
    size: "sm",
    children: "Small Heading",
  },
};

export const Medium: HeadingStory = {
  args: {
    size: "md",
    children: "Medium Heading",
  },
};

export const Large: HeadingStory = {
  args: {
    size: "lg",
    children: "Large Heading",
  },
};

export const ExtraLarge: HeadingStory = {
  args: {
    size: "xl",
    children: "Extra Large Heading",
  },
};

export const TwoExtraLarge: HeadingStory = {
  args: {
    size: "2xl",
    children: "2XL Heading",
  },
};

export const AsH1: HeadingStory = {
  args: {
    as: "h1",
    size: "2xl",
    children: "H1 Heading",
  },
};

export const AsH3: HeadingStory = {
  args: {
    as: "h3",
    size: "md",
    children: "H3 Heading",
  },
};

export const AsH4: HeadingStory = {
  args: {
    as: "h4",
    size: "sm",
    children: "H4 Heading",
  },
};

// Text Stories
const textMeta: Meta<typeof Text> = {
  title: "Typography/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg"],
      description: "Size of the text",
      defaultValue: "md",
    },
    variant: {
      control: { type: "select" },
      options: ["default", "muted", "accent"],
      description: "Visual style of the text",
      defaultValue: "default",
    },
    children: {
      control: "text",
      description: "Content of the text",
    },
  },
};

export const TextDefault: StoryObj<typeof Text> = {
  render: (args) => <Text {...args} />,
  args: {
    children: "This is a paragraph of text. It demonstrates the default text style.",
  },
};

export const TextSmall: StoryObj<typeof Text> = {
  render: (args) => <Text {...args} />,
  args: {
    size: "sm",
    children: "This is small text.",
  },
};

export const TextLarge: StoryObj<typeof Text> = {
  render: (args) => <Text {...args} />,
  args: {
    size: "lg",
    children: "This is large text.",
  },
};

export const TextExtraSmall: StoryObj<typeof Text> = {
  render: (args) => <Text {...args} />,
  args: {
    size: "xs",
    children: "This is extra small text.",
  },
};

export const TextMuted: StoryObj<typeof Text> = {
  render: (args) => <Text {...args} />,
  args: {
    variant: "muted",
    children: "This is muted text with reduced emphasis.",
  },
};

export const TextAccent: StoryObj<typeof Text> = {
  render: (args) => <Text {...args} />,
  args: {
    variant: "accent",
    children: "This is accent text with primary color.",
  },
};

export const TextCombinations: StoryObj<typeof Text> = {
  render: () => (
    <div className="space-y-4">
      <Text size="lg" variant="default">Large Default Text</Text>
      <Text size="md" variant="muted">Medium Muted Text</Text>
      <Text size="sm" variant="accent">Small Accent Text</Text>
      <Text size="xs" variant="default">Extra Small Default Text</Text>
    </div>
  ),
};
