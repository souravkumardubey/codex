'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Calendar,
  Code2,
  CheckCircle2,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats-profile'],
    queryFn: () => api.getUserStats(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {user.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Executions', value: stats?.totalExecutions || 0, icon: Code2, color: 'text-blue-500' },
          { label: 'Success Rate', value: `${stats?.successRate || 0}%`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Submissions', value: stats?.totalSubmissions || 0, icon: CheckCircle2, color: 'text-purple-500' },
          { label: 'Acceptance', value: `${stats?.acceptanceRate || 0}%`, icon: Activity, color: 'text-orange-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-75`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
