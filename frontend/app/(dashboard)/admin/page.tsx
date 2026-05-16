'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Users,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Loader2,
  Server,
  Cpu,
  Database,
  HardDrive,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Redirect non-admin users
  if (user && user.role !== 'ADMIN') {
    router.push('/dashboard');
  }

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/v1/health');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: executionMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-execution-metrics'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/v1/executions/metrics/summary');
      return res.json();
    },
  });

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const systemStats = [
    { label: 'API Status', value: health?.checks?.database?.status || 'N/A', icon: Server, color: health?.checks?.database?.status === 'ok' ? 'text-green-500' : 'text-red-500' },
    { label: 'Docker', value: health?.checks?.docker?.status || 'N/A', icon: Cpu, color: health?.checks?.docker?.status === 'ok' ? 'text-green-500' : 'text-red-500' },
    { label: 'Queue', value: health?.checks?.queue?.status || 'N/A', icon: Database, color: health?.checks?.queue?.status === 'ok' ? 'text-green-500' : 'text-red-500' },
    { label: 'Uptime', value: health?.uptime ? `${Math.round(health.uptime)}s` : 'N/A', icon: Clock, color: 'text-blue-500' },
  ];

  const execStats = [
    { label: 'Total Executions', value: executionMetrics?.data?.total || 0, icon: Code2, color: 'text-blue-500' },
    { label: 'Completed', value: executionMetrics?.data?.completed || 0, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Failed', value: executionMetrics?.data?.failed || 0, icon: XCircle, color: 'text-red-500' },
    { label: 'Success Rate', value: `${executionMetrics?.data?.successRate || 0}%`, icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System monitoring and management</p>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          System Health
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold mt-1">
                      {healthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-75`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Execution Metrics */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Execution Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {execStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {metricsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-75`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Queue Metrics */}
      {health?.checks?.queue?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(health.checks.queue.metrics).map(([key, value]) => (
                <div key={key} className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">{value as number}</div>
                  <div className="text-xs text-muted-foreground capitalize">{key}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
