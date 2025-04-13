import { useMemo } from 'react';
import { formatDate } from '@/lib/utils';
import { WeekDay } from '@/types';

interface CalendarViewProps {
  tasks: {
    completed: boolean;
    dueDate?: string | Date | null;
  }[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const weekDays = useMemo<WeekDay[]>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days: WeekDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Generate days for this week, starting from Sunday
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      // Adjust date to get the right day of the week
      // If today is Thursday (4), and we're looking at Monday (1), we need to go back 3 days
      const diff = i - dayOfWeek + 1; // +1 to start from Monday instead of Sunday
      date.setDate(today.getDate() + diff);
      
      days.push({
        name: dayNames[date.getDay()],
        date: date.getDate(),
        isToday: diff === 0,
      });
    }
    
    return days;
  }, []);
  
  // Calculate tasks stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">This Week</h2>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex justify-between mb-4">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-gray-500 mb-1">{day.name}</p>
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  day.isToday ? 'bg-primary text-white' : ''
                }`}
              >
                <span className="text-sm">{day.date}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Task count indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 py-2 border-t border-neutral-200">
          <span>Today's tasks:</span>
          <span className="font-medium text-dark">
            {remainingTasks} of {totalTasks} remaining
          </span>
        </div>
      </div>
    </div>
  );
}
