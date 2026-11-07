import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Search,
  Package,
  Lightbulb,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  Target,
  LogOut,
  Youtube,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Competitors', path: '/competitors' },
  { icon: Youtube, label: 'YouTube Intelligence', path: '/youtube' },
  { icon: Target, label: 'Gap Finder', path: '/gap-finder' },
  { icon: DollarSign, label: 'Pricing Analysis', path: '/pricing' },
  { icon: FileText, label: 'Content Tracker', path: '/content' },
  { icon: Search, label: 'SEO Insights', path: '/seo' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Lightbulb, label: 'AI Insights', path: '/insights' },
  { icon: FileBarChart, label: 'Reports', path: '/reports' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-effect shrink-0">
          <Eye className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
            VisionAI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                isActive && 'bg-primary/10 text-primary font-semibold border-l-2 border-primary rounded-l-none'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Settings */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-1.5 mb-1">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}

        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/60',
            location.pathname === '/settings' && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {user?.email?.includes('admin') && (
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/60',
              location.pathname === '/admin' && 'bg-primary/10 text-primary font-semibold'
            )}
          >
            <Shield className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}

        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 w-full justify-center mt-2"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
