
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  isFocusMode: boolean;
  isCategoryView: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  handleBackToTasks: () => void;
}

export function Header({ 
  isFocusMode, 
  isCategoryView, 
  menuOpen, 
  setMenuOpen, 
  handleBackToTasks 
}: HeaderProps) {
  return (
    <header className={`sticky top-0 z-20 ${isFocusMode || isCategoryView ? 'bg-background border-b border-border/10' : 'bg-amber-200'}`}>
      <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
        {isFocusMode || isCategoryView ? (
          <button 
            onClick={handleBackToTasks}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={() => setMenuOpen(true)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {isFocusMode || isCategoryView ? (
          <h1 className="text-base font-medium">
            {isFocusMode ? 'Fokussiert' : 'Persönliche Aufgaben'}
          </h1>
        ) : (
          <div className="flex-1" />
        )}
        
        <button className="w-8 h-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
