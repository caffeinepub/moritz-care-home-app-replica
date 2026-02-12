import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ReactNode } from 'react';
import Logo from '../branding/Logo';

interface AppShellProps {
  showLogin?: boolean;
  children?: ReactNode;
}

export default function AppShell({ showLogin = false, children }: AppShellProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

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

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <header className="bg-white border-b border-gray-200 shadow-sm mb-8 rounded-t-lg">
            <div className="px-6 py-4 flex items-center justify-center gap-3">
              <Logo variant="small" />
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900">Moritz Care Home</h1>
                <p className="text-sm text-gray-600">Assisted Living Management</p>
              </div>
            </div>
          </header>
          <div className="bg-white rounded-b-lg shadow-lg p-8">
            <p className="text-gray-700 mb-6 text-center">
              Please sign in to access the resident management system.
            </p>
            <Button onClick={handleAuth} disabled={disabled} size="lg" className="w-full">
              {disabled ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="small" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Moritz Care Home</h1>
              <p className="text-sm text-gray-600">Assisted Living Management</p>
            </div>
          </div>
          <Button onClick={handleAuth} disabled={disabled} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            © {new Date().getFullYear()} Moritz Care Home. Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
