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
      <header className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ShoppingBag className="h-6 w-6" />
              <h1 className="text-xl font-bold">E-Commerce Automation</h1>
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
                        className={`w-8 h-0.5 ${isPast ? 'bg-primary' : 'bg-muted'}`}
                      />
                    )}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isPast
                            ? 'text-primary'
                            : 'text-muted-foreground'
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
