import React from "react";
import { cn } from "./tailwind-merge";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
}

export function Heading({
  as: Tag = "h2",
  size = "lg",
  className,
  children,
  ...props
}: HeadingProps) {
  const sizeClasses = {
    sm: "text-lg font-semibold tracking-tight",
    md: "text-xl font-semibold tracking-tight",
    lg: "text-2xl font-semibold tracking-tight",
    xl: "text-3xl font-semibold tracking-tight",
    "2xl": "text-4xl font-bold tracking-tight",
  };

  return (
    <Tag
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "muted" | "accent";
  children: React.ReactNode;
}

export function Text({
  size = "md",
  variant = "default",
  className,
  children,
  ...props
}: TextProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantClasses = {
    default: "",
    muted: "text-muted-foreground",
    accent: "text-primary",
  };

  return (
    <p
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}