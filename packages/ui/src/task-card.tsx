import React from "react";
import { cn } from "./tailwind-merge";

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: React.ReactNode;
}

export function TaskCard({
  interactive = false,
  className,
  children,
  ...props
}: TaskCardProps) {
  return (
    <div
      className={cn(
        "ui-rounded-lg ui-border ui-border-border ui-bg-card ui-text-card-foreground ui-shadow-sm",
        interactive &&
          "ui-transition-all ui-duration-300 hover:ui-shadow-md hover:ui-border-primary/20 hover:ui-bg-accent/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TaskCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TaskCardHeader({
  className,
  children,
  ...props
}: TaskCardHeaderProps) {
  return (
    <div
      className={cn("ui-flex ui-flex-col ui-space-y-1.5 ui-p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface TaskCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TaskCardContent({
  className,
  children,
  ...props
}: TaskCardContentProps) {
  return (
    <div className={cn("ui-p-6 ui-pt-0", className)} {...props}>
      {children}
    </div>
  );
}

interface TaskCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TaskCardFooter({
  className,
  children,
  ...props
}: TaskCardFooterProps) {
  return (
    <div
      className={cn("ui-flex ui-items-center ui-p-6 ui-pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface TaskCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function TaskCardTitle({
  className,
  children,
  ...props
}: TaskCardTitleProps) {
  return (
    <h3
      className={cn(
        "ui-text-lg ui-font-semibold ui-leading-none ui-tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

interface TaskCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function TaskCardDescription({
  className,
  children,
  ...props
}: TaskCardDescriptionProps) {
  return (
    <p
      className={cn("ui-text-sm ui-text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}
