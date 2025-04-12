import React, { useState } from "react";
import { MainLayout } from "../components/ui/main-layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CalendarClock, Zap, CheckCircle, TrendingUp } from "lucide-react";

// Mock data for charts
const weeklyTasksCompleted = [
  { name: "Mon", completed: 4 },
  { name: "Tue", completed: 6 },
  { name: "Wed", completed: 8 },
  { name: "Thu", completed: 5 },
  { name: "Fri", completed: 9 },
  { name: "Sat", completed: 3 },
  { name: "Sun", completed: 2 },
];

const energyDistribution = [
  { name: "High Energy", value: 12, color: "#ef4444" },
  { name: "Medium Energy", value: 25, color: "#f59e0b" },
  { name: "Low Energy", value: 8, color: "#3b82f6" },
];

const statCards = [
  {
    title: "Tasks Completed",
    value: "37",
    change: "+12%",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Focus Time",
    value: "16h 23m",
    change: "+8%",
    icon: CalendarClock,
    color: "text-blue-500",
  },
  {
    title: "Avg. Energy",
    value: "Medium",
    change: "Stable",
    icon: Zap,
    color: "text-amber-500",
  },
  {
    title: "Productivity",
    value: "82%",
    change: "+5%",
    icon: TrendingUp,
    color: "text-indigo-500",
  },
];

export function StatsPage() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("week");

  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Stats</h1>

          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === "week"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setDateRange("week")}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === "month"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setDateRange("month")}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === "year"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setDateRange("year")}
            >
              Year
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-card p-4 rounded-lg border border-border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p
                    className={`text-xs mt-1 ${card.change.includes("+") ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    {card.change} from last {dateRange}
                  </p>
                </div>
                <div className={`p-2 rounded-full bg-muted ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Task Completion Chart */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Tasks Completed</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyTasksCompleted}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="completed"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Distribution Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="text-lg font-medium mb-4">Energy Distribution</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {energyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                    }}
                    formatter={(value) => [`${value} tasks`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="text-lg font-medium mb-4">Daily Insight</h2>
            <div className="flex flex-col h-full justify-center">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Most Productive Time</h3>
                <p className="text-muted-foreground">9:00 AM - 11:00 AM</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-center">
                  You complete 36% of your tasks during your morning hours.
                  Consider scheduling your high-energy tasks during this time
                  period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
