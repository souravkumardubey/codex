'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Plus,
  Lock,
  Globe,
  Loader2,
  ArrowRight,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function RoomsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    setIsCreating(true);
    try {
      // Generate a random room ID for now
      const roomId = Math.random().toString(36).substring(2, 10);
      toast.success('Room created!');
      router.push(`/rooms/${roomId}`);
    } catch {
      toast.error('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Collaborative Rooms</h1>
        <p className="text-muted-foreground mt-1">
          Code together in real-time with your team
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create room */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Create Room</span>
            </CardTitle>
            <CardDescription>
              Start a new collaborative coding session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Room name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={createRoom}
              disabled={isCreating || !roomName.trim()}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Room
            </Button>
          </CardContent>
        </Card>

        {/* Join room */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Join Room</span>
            </CardTitle>
            <CardDescription>
              Enter an invite code to join a session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Invite code..." />
            <Button variant="outline" className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Join Room
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-start space-x-4">
          <Users className="h-8 w-8 text-primary shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold">Real-Time Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Codex collaborative rooms support live coding sync, cursor tracking,
              and real-time chat - perfect for pair programming and team coding sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
