
interface ActionButtonsProps {
  onComplete: () => void;
  onHelp: () => void;
  disabled: boolean;
}

export function ActionButtons({ onComplete, onHelp, disabled }: ActionButtonsProps) {
  return (
    <div className="flex space-x-3">
      <button 
        onClick={onComplete}
        className="flex-1 py-3 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all disabled:opacity-70"
        disabled={disabled}
      >
        Complete Step
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <button 
        onClick={onHelp}
        className="p-3 text-gray-600 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-all"
        aria-label="Need help?"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
