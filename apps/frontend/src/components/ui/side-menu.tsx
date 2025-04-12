import { ThemeToggle } from './theme-toggle';
import { CategoryType } from '@shared/schema';

interface SideMenuProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export function SideMenu({ menuOpen, setMenuOpen }: SideMenuProps) {
  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMenuOpen(false)}>
      <div className="absolute left-0 top-0 h-full w-[280px] bg-background p-5" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Menü</h2>
          <button 
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-4 p-4">
          <div className="font-medium text-sm text-muted-foreground mb-2">Pläne</div>
          <div className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent">
              <span className="mr-2">📋</span>
              Alle Aufgaben
            </a>
            <a href="#personal" className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent">
              <span className="mr-2">👤</span>
              Persönlich
            </a>
            <a href="#work" className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent">
              <span className="mr-2">💼</span>
              Arbeit
            </a>
            <a href="#family" className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent">
              <span className="mr-2">👨‍👩‍👧‍👦</span>
              Familie
            </a>
            <a href="#health" className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent">
              <span className="mr-2">🏃</span>
              Gesundheit
            </a>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="https://i.pravatar.cc/300?img=9" 
              alt="User avatar" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">Steve Doe</p>
              <p className="text-sm text-muted-foreground">steve@example.com</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button className="text-sm text-muted-foreground">Ausloggen</button>
          </div>
        </div>
      </div>
    </div>
  );
}