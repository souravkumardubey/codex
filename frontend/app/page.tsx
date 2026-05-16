'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Code2,
  Shield,
  Zap,
  Users,
  Globe,
  Cpu,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'Multi-Language',
    description: 'Python, JavaScript, TypeScript, Go, Java, C++, Rust',
  },
  {
    icon: Shield,
    title: 'Secure Sandbox',
    description: 'Docker-isolated execution with resource limits',
  },
  {
    icon: Zap,
    title: 'Real-Time Streaming',
    description: 'Live output streaming via WebSocket connections',
  },
  {
    icon: Globe,
    title: 'Distributed Architecture',
    description: 'Queue-based workers for horizontal scaling',
  },
  {
    icon: Users,
    title: 'Collaborative Coding',
    description: 'Real-time pair programming with live sync',
  },
  {
    icon: Code2,
    title: 'Coding Challenges',
    description: 'Built-in challenges with test cases and leaderboards',
  },
];

const stats = [
  { label: 'Languages Supported', value: '7' },
  { label: 'Avg. Execution Time', value: '<100ms' },
  { label: 'Architecture', value: 'Distributed' },
  { label: 'Sandbox', value: 'Docker' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full border bg-secondary text-sm">
              <Cpu className="h-4 w-4 mr-2 text-primary" />
              Distributed Code Execution Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Write. Execute.{' '}
              <span className="text-primary">Collaborate.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A production-grade platform for executing untrusted code in isolated
              sandboxes. Built with distributed workers, real-time streaming, and
              enterprise security.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/playground">
                <Button size="lg" className="text-lg px-8">
                  Try Playground
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Everything you need for code execution</h2>
            <p className="text-muted-foreground mt-4">
              Built for scale, designed for security
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Distributed by design</h2>
              <div className="space-y-4">
                {[
                  'BullMQ job queues with Redis for reliable execution',
                  'Docker containers for secure sandboxed execution',
                  'WebSocket gateway for real-time output streaming',
                  'Horizontal scaling with multiple worker nodes',
                  'PostgreSQL for persistent storage with Prisma ORM',
                ].map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border rounded-xl p-6">
              <pre className="text-sm text-muted-foreground overflow-x-auto">
                <code>{`┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client   │───▶│   API    │───▶│   Queue  │
└──────────┘    └──────────┘    └────┬─────┘
                                     │
                              ┌──────▼──────┐
                              │   Worker   │
                              │  ┌────────┐│
                              │  │ Docker ││
                              │  │Sandbox ││
                              │  └────────┘│
                              └─────────────┘
WebSocket ◀──── WS Gateway ◀────┘`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to start coding?</h2>
          <p className="text-xl text-muted-foreground">
            Join now and experience the future of code execution platforms.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-10">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold">Codex</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Distributed Code Execution Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
