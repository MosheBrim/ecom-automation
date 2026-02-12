import { Outlet, useLocation, Link } from 'react-router-dom';
import { ShoppingBag, Search, Activity, CheckCircle } from 'lucide-react';

const STEPS = [
  { path: '/', label: 'Search', icon: Search },
  { path: '/status', label: 'Status', icon: Activity },
  { path: '/result', label: 'Result', icon: CheckCircle },
] as const;

function getActiveStepIndex(pathname: string): number {
  if (pathname.startsWith('/status')) return 1;
  if (pathname === '/result') return 2;
  return 0;
}

export function Layout() {
  const location = useLocation();
  const currentStepIndex = getActiveStepIndex(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            >
              <div className="p-1.5 bg-white/15 rounded-lg">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">E-Commerce Automation</h1>
            </Link>

            <nav className="flex items-center gap-1">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isPast = index < currentStepIndex;

                return (
                  <div key={step.path} className="flex items-center">
                    {index > 0 && (
                      <div
                        className={`w-8 h-0.5 ${isPast ? 'bg-white/60' : 'bg-white/20'}`}
                      />
                    )}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white font-medium'
                          : isPast
                            ? 'text-white/80'
                            : 'text-white/40'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}
