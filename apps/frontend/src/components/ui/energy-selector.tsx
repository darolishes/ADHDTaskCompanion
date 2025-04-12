import { useId } from 'react';
import { getEnergyColor } from '@/lib/utils';

interface EnergySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  const baseId = useId();
  
  const energyLevels = [
    { id: `${baseId}-low`, value: 'low', label: 'Low' },
    { id: `${baseId}-medium`, value: 'medium', label: 'Medium' },
    { id: `${baseId}-high`, value: 'high', label: 'High' },
  ];
  
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">Your current energy level:</p>
      <div className="flex space-x-2 justify-between">
        {energyLevels.map((level) => (
          <div key={level.id} className="energy-option flex-1">
            <input 
              type="radio"
              id={level.id}
              name={`energy-${baseId}`}
              value={level.value}
              checked={value === level.value}
              onChange={() => onChange(level.value)}
              className="hidden"
            />
            <label 
              htmlFor={level.id}
              className={`flex flex-col items-center justify-center p-3 border-2 
                ${value === level.value 
                  ? 'border-primary bg-primary bg-opacity-5' 
                  : 'border-neutral-200 hover:bg-neutral-100'
                } rounded-lg cursor-pointer transition-all`}
            >
              <span className={`w-4 h-4 rounded-full ${getEnergyColor(level.value)} mb-1`}></span>
              <span className="text-sm">{level.label}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
