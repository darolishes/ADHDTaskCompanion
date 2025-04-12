import { Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface TaskCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
}

export function TaskCheckbox({
  checked: controlledChecked,
  onChange,
  id,
}: TaskCheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(false);

  const isChecked =
    controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleChange = () => {
    const newValue = !isChecked;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalChecked(newValue);
    }
  };

  return (
    <motion.button
      type="button"
      id={id}
      className={`
        task-checkbox relative w-6 h-6 rounded-full border-2
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        ${isChecked ? "border-primary bg-primary" : "border-border"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      `}
      onClick={handleChange}
      whileTap={{ scale: 0.9 }}
    >
      {isChecked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, type: "spring" }}
        >
          <Check className="h-3.5 w-3.5 text-primary-foreground" />
        </motion.div>
      )}
    </motion.button>
  );
}
