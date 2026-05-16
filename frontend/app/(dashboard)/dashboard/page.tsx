'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatTime } from '@/lib/utils';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
  Activity,
} from 'lucide-react';
import { UserStats, Execution } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [executions, setExecutions] = useState<Execution[]>([]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => api.getUserStats(),
  });

  const { isLoading: execLoading } = useQuery({
    queryKey: ['recent-executions'],
    queryFn: async () => {
      const result = await api.getExecutionHistory(1, 5);
      setExecutions(result.data);
      return result;
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Executions', value: stats?.totalExecutions || 0, icon: Play, color: 'text-blue-500' },
    { label: 'Success Rate', value: `${stats?.successRate || 0}%`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Submissions', value: stats?.totalSubmissions || 0, icon: CheckCircle2, color: 'text-purple-500' },
    { label: 'Acceptance Rate', value: `${stats?.acceptanceRate || 0}%`, icon: Activity, color: 'text-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.username}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your coding activity overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">
                    {statsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-75`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/playground">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Code Playground</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Write and execute code in multiple languages
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/challenges">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Coding Challenges</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solve problems and climb the leaderboard
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent executions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Executions</CardTitle>
          <Link href="/history">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {execLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No executions yet. Start coding!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md ${
                      exec.status === 'COMPLETED' ? 'bg-green-500/10' :
                      exec.status === 'FAILED' ? 'bg-red-500/10' :
                      exec.status === 'TIMEOUT' ? 'bg-orange-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      {exec.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : exec.status === 'FAILED' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{exec.language}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(exec.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {exec.runtime && <p>{formatTime(exec.runtime)}</p>}
                    <p className="capitalize">{exec.status.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
