
import { ThemeToggle } from './theme-toggle';

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
        
        <nav className="space-y-1 mb-8">
          <a 
            href="#" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </a>
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
