import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuthContext } from '@/lib/auth';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuthContext();
  const isPending = user && !user.is_admin && !user.is_approved;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Pending Approval Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md">
          <div className="glass-card max-w-md w-full mx-4 p-8 rounded-2xl text-center space-y-4 shadow-2xl border border-primary/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Account Pending</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your account is currently under review. Our team will verify your details within <strong className="text-foreground">24 hours</strong>.
            </p>
            <p className="text-sm text-primary/80 mt-4 mb-6">
              You'll gain full access to the dashboard once approved.
            </p>
            <div className="pt-4 border-t border-border/50">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout - Blurred if pending */}
      <div className={`transition-all duration-500 ${isPending ? 'blur-sm pointer-events-none select-none opacity-50' : ''}`}>
        <Sidebar />
        <main className="ml-64 min-h-screen transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
