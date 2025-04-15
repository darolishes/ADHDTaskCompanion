import React from "react";
import { cn } from "./tailwind-merge";

interface TaskCheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function TaskCheckbox({
  checked = false,
  label,
  size = "md",
  className,
  children,
  ...props
}: TaskCheckboxProps) {
  const sizeClasses = {
    sm: "ui-w-4 ui-h-4",
    md: "ui-w-5 ui-h-5",
    lg: "ui-w-6 ui-h-6",
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={cn(
        "ui-rounded-full ui-flex ui-items-center ui-justify-center ui-transition-colors",
        checked
          ? "ui-bg-primary ui-border-0"
          : "ui-border-2 ui-border-muted-foreground/40 hover:ui-border-primary",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ui-h-3.5 ui-w-3.5 ui-text-primary-foreground"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {label && <span className="ui-sr-only">{label}</span>}
      {children}
    </button>
  );
}
