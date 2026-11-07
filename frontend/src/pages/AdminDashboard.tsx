import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Mail, Phone, Briefcase, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  mobile_number: string;
  brand_name: string;
  industry: string;
  is_admin: boolean;
  is_approved: boolean;
}

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const data = await fetchApi('/admin/users');
      return data as User[];
    }
  });

  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      return fetchApi(`/admin/users/${userId}/approve`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve user');
    },
    onSettled: () => {
      setIsApproving(null);
    }
  });

  const handleApprove = (userId: string) => {
    setIsApproving(userId);
    approveUser.mutate(userId);
  };

  if (isLoading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Manage user registrations and approvals.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>Review and approve new users who want to access the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 rounded-t-md">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-md">User</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Brand & Industry</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{u.full_name || 'No Name'}</div>
                            <div className="text-xs text-muted-foreground">{u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" /> {u.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" /> {u.mobile_number || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Briefcase className="w-3.5 h-3.5" /> {u.brand_name || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground ml-5">{u.industry || 'No Industry'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {u.is_admin ? (
                          <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">User</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {u.is_approved ? (
                          <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {!u.is_approved && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(u.id)}
                            disabled={isApproving === u.id}
                          >
                            {isApproving === u.id ? 'Approving...' : 'Approve'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
