import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { TaskCard, TaskCardProps } from "./task-card";

interface TaskListProps {
  tasks: TaskCardProps[];
  onReorder?: (tasks: TaskCardProps[]) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
}

export function TaskList({
  tasks,
  onReorder,
  onToggleComplete,
  onEdit,
}: TaskListProps) {
  const [items, setItems] = useState(tasks);

  const handleReorder = (reorderedItems: TaskCardProps[]) => {
    setItems(reorderedItems);
    if (onReorder) {
      onReorder(reorderedItems);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 py-2">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-3 sm:space-y-4"
      >
        {items.map((task) => (
          <Reorder.Item
            key={task.id}
            value={task}
            className="cursor-grab active:cursor-grabbing touch-manipulation"
          >
            <TaskCard
              {...task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {items.length === 0 && (
        <motion.div
          className="text-center p-8 rounded-lg border border-dashed border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-muted-foreground">
            No tasks yet. Add your first task!
          </p>
        </motion.div>
      )}
    </div>
  );
}
