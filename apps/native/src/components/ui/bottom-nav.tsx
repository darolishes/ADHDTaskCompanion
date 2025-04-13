import { Home, Calendar, BarChart2, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: BarChart2, label: "Stats", href: "/stats" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className="grid h-full grid-cols-4 mx-auto max-w-lg">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-5 group
                         transition-colors duration-200 ease-in-out
                         ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <item.icon
                className={`w-6 h-6 mb-1 ${isActive ? "stroke-primary" : "stroke-muted-foreground group-hover:stroke-foreground"}`}
              />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
