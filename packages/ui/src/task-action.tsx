import React from "react";
import { cn } from "./tailwind-merge";

interface TaskActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function TaskAction({
  icon,
  label,
  variant = "ghost",
  className,
  children,
  ...props
}: TaskActionProps) {
  const variantClasses = {
    primary: "ui-bg-primary ui-text-primary-foreground hover:ui-bg-primary/90",
    secondary: "ui-bg-secondary ui-text-secondary-foreground hover:ui-bg-secondary/90",
    ghost: "ui-text-muted-foreground hover:ui-text-primary hover:ui-bg-muted",
  };

  return (
    <button
      className={cn(
        "ui-p-1.5 ui-rounded-full ui-transition-colors ui-flex ui-items-center ui-justify-center",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon}
      {label && <span className="ui-sr-only">{label}</span>}
      {children}
    </button>
  );
}
