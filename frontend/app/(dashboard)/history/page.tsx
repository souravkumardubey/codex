'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Execution } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HistoryPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['execution-history', page],
    queryFn: () => api.getExecutionHistory(page),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'TIMEOUT':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Execution History</h1>
        <p className="text-muted-foreground mt-1">View all your code executions</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No executions yet</p>
              <p className="text-sm mt-1">Start coding in the playground!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.data.map((execution: Execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(execution.status)}
                    <div>
                      <p className="font-medium capitalize">{execution.language}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(execution.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    {execution.runtime !== null && (
                      <span>Runtime: {formatTime(execution.runtime)}</span>
                    )}
                    {execution.memoryUsed !== null && (
                      <span>Memory: {(execution.memoryUsed / 1024).toFixed(1)}MB</span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        execution.status === 'COMPLETED'
                          ? 'bg-green-500/10 text-green-500'
                          : execution.status === 'FAILED'
                          ? 'bg-red-500/10 text-red-500'
                          : execution.status === 'TIMEOUT'
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {execution.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
