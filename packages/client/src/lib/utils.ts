import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "EEEE, MMMM d");
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

export function formatTimeFromNow(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function getInitials(name: string): string {
  if (!name) return "";
  
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// Color mapping for priorities
export function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-urgent bg-red-100";
    case "medium":
      return "text-yellow-700 bg-yellow-100";
    case "low":
      return "text-green-700 bg-green-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
}

// Energy level color mapping
export function getEnergyColor(energy: string): string {
  switch (energy?.toLowerCase()) {
    case "low":
      return "bg-red-400";
    case "medium":
      return "bg-yellow-400";
    case "high":
      return "bg-green-400";
    default:
      return "bg-gray-400";
  }
}

// Random motivational quotes for ADHD
const quotes = [
  "The most effective way to do it, is to do it. One step at a time.",
  "Small steps still move you forward. One task at a time.",
  "Your focus determines your reality. Choose one thing right now.",
  "Don't worry about the big picture. Just focus on the next right step.",
  "Progress over perfection. Just start somewhere, anywhere.",
  "You don't have to be great to start, but you have to start to be great.",
  "The best way to predict your future is to create it, one small step at a time.",
  "Remember your 'why' when your focus drifts away.",
  "Celebrate small wins. They add up to big victories.",
  "ADHD is not a deficit of attention, but a difference in how attention is regulated."
];

export function getRandomQuote(): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function splitArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}
