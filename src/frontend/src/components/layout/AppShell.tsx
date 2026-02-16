import { Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Home, Settings, Menu } from 'lucide-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import Logo from '../branding/Logo';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - only shown when authenticated */}
      {isAuthenticated && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform duration-300 lg:translate-x-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="p-4 border-b">
              <Logo variant="header" />
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <Button
                variant={currentPath === '/' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  navigate({ to: '/' });
                  setSidebarOpen(false);
                }}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>

              <Button
                variant={currentPath === '/settings' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  navigate({ to: '/settings' });
                  setSidebarOpen(false);
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>

            <div className="p-4 border-t">
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant="outline"
                className="w-full"
              >
                {text}
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              {!isAuthenticated && <Logo variant="header" />}
            </div>

            {!isAuthenticated && (
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant="default"
              >
                {text}
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t bg-card/30 py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Moritz Care Home. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'moritz-care-home'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
