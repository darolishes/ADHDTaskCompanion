
interface CategoryCardProps {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function CategoryCard({ id, name, count, color, icon, onClick }: CategoryCardProps) {
  return (
    <div 
      className="flex-shrink-0 w-[350px] h-[560px] bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
      onClick={onClick}
      style={{ scrollSnapAlign: 'center' }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-start mb-5">
          <div className={`w-20 h-20 rounded-full bg-${color}-100 flex items-center justify-center`}>
            {icon}
          </div>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </span>
        </div>
        
        <div className="mt-auto mb-8">
          <p className="text-lg font-medium text-gray-500 mb-2">{count} {count === 1 ? 'task' : 'tasks'}</p>
          <h2 className="text-5xl font-bold">{name}</h2>
        </div>
        
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-${color}-500 rounded-full`}
            style={{ width: `${count > 0 ? 24 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
