import { Settings as SettingsIcon, Bell, Shield, Database, Palette, User } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { useAuthContext } from '@/lib/auth';

const Settings = () => {
  const { user } = useAuthContext();
  
  return (
    <AppLayout>
      <Header
        title="Settings"
        subtitle="Configure your VisionAI preferences"
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Profile Settings */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Profile Settings</h3>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.full_name || ''} className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email || ''} className="bg-secondary" disabled />
            </div>
            <div className="space-y-2">
              <Label>Company / Brand Name</Label>
              <Input defaultValue={user?.brand_name || ''} className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input defaultValue={user?.website_url || ''} className="bg-secondary" />
            </div>
          </div>
          <Button className="mt-4 bg-gradient-primary text-primary-foreground">
            Save Changes
          </Button>
        </div>

        {/* Notification Settings */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Configure alert preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Price Change Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when competitors change pricing</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New Content Alerts</p>
                <p className="text-sm text-muted-foreground">Notify when competitors publish new content</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Product Updates</p>
                <p className="text-sm text-muted-foreground">Alerts for product launches and changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Receive weekly summary emails</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">API Configuration</h3>
              <p className="text-sm text-muted-foreground">Manage your API integrations</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Firecrawl API Key</Label>
              <Input type="password" defaultValue="fc_xxxxxxxxxxxxx" className="bg-secondary font-mono" />
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <p className="text-sm text-success flex items-center gap-2">
                <Shield className="w-4 h-4" />
                API connection verified and working
              </p>
            </div>
          </div>
          <Button className="mt-4" variant="outline">
            Test Connection
          </Button>
        </div>

        {/* Appearance */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize the look and feel</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme across the application</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Compact View</p>
                <p className="text-sm text-muted-foreground">Show more content with less spacing</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
