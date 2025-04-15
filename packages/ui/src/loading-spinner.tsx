import React from "react";
import { cn } from "./tailwind-merge";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "ui-w-6 ui-h-6",
    md: "ui-w-10 ui-h-10",
    lg: "ui-w-12 ui-h-12",
  };

  return (
    <div className={cn("ui-flex ui-flex-col ui-items-center ui-justify-center ui-space-y-3", className)} {...props}>
      <div
        className={cn(
          "ui-rounded-full ui-border-t-2 ui-border-b-2 ui-border-primary ui-animate-spin",
          sizeClasses[size]
        )}
      />
      {text && <p className="ui-text-sm ui-text-muted-foreground ui-animate-pulse">{text}</p>}
    </div>
  );
}
