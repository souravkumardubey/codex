'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { Challenge } from '@/types';
import {
  Search,
  Filter,
  Loader2,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const;
const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-green-500 bg-green-500/10',
  MEDIUM: 'text-yellow-500 bg-yellow-500/10',
  HARD: 'text-red-500 bg-red-500/10',
  EXPERT: 'text-purple-500 bg-purple-500/10',
};

export default function ChallengesPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['challenges', search, difficulty, page],
    queryFn: () =>
      api.getChallenges({
        search: search || undefined,
        difficulty: difficulty || undefined,
        page,
        limit: 20,
      }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Coding Challenges</h1>
        <p className="text-muted-foreground mt-1">
          Solve problems, earn points, and climb the leaderboard
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDifficulty(difficulty === d ? null : d);
                setPage(1);
              }}
            >
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Challenge list */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((challenge: Challenge) => (
            <Link key={challenge.id} href={`/challenges/${challenge.slug}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{challenge.title}</h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            DIFFICULTY_COLORS[challenge.difficulty],
                          )}
                        >
                          {challenge.difficulty}
                        </span>
                      </div>
                      {challenge.tags && challenge.tags.length > 0 && (
                        <div className="flex gap-2">
                          {challenge.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      {challenge._count && (
                        <>
                          <span>{challenge._count.submissions} submissions</span>
                          <span>{challenge._count.testCases} tests</span>
                        </>
                      )}
                      <ArrowRight className="h-5 w-5 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
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
