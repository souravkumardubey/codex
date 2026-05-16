'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { useEditorStore } from '@/store/editorStore';
import { socketService } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import { getLanguageName, LANGUAGE_VERSIONS } from '@/lib/utils';
import {
  Users,
  Send,
  MessageSquare,
  ChevronDown,
  Copy,
  Link,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = Object.keys(LANGUAGE_VERSIONS);

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: number;
}

interface RoomUser {
  id: string;
  username: string;
  color: string;
}

export default function CollaborativeRoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const { user } = useAuthStore();
  const { language, code, setLanguage, setCode } = useEditorStore();

  const [users, setUsers] = useState<RoomUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || undefined : undefined;
    socketService.connect(token);

    // Join room
    socketService.joinRoom(roomId, user?.username || 'Anonymous');

    // Listen for events
    socketService.onRoomState((data) => {
      if (data.code) setCode(data.code);
      if (data.language) setLanguage(data.language);
      setUsers(data.users || []);
    });

    socketService.onUserJoined((data) => {
      setUsers((prev) => [...prev, data]);
      toast.success(`${data.username} joined`);
    });

    socketService.onUserLeft((data) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.userId));
      toast('User left');
    });

    socketService.onCodeUpdate((data) => {
      setCode(data.code);
    });

    socketService.onChatMessage((data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketService.leaveRoom();
      socketService.removeCollaborationListeners();
    };
  }, [roomId]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      socketService.sendCodeChange(newCode, language);
    },
    [language, setCode],
  );

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socketService.sendChatMessage(chatInput);
    setChatInput('');
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Invite link copied!');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Main editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                className="w-36 justify-between"
              >
                <span>{getLanguageName(language)}</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              {showLanguagePicker && (
                <div className="absolute top-full left-0 mt-1 z-50 w-48 p-1 rounded-md border bg-card shadow-lg">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent ${
                        lang === language ? 'bg-accent font-medium' : ''
                      }`}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLanguagePicker(false);
                        socketService.sendCodeChange(code, lang);
                      }}
                    >
                      {getLanguageName(lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={copyInviteLink}>
              <Copy className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <MonacoEditor
            language={language}
            value={code}
            onChange={handleCodeChange}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l flex flex-col">
        {/* Users */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Users ({users.length})
            </h3>
          </div>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: u.color }}
                />
                <span>{u.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </h3>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="font-medium text-primary">{msg.username}: </span>
                <span className="text-muted-foreground">{msg.content}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border-t flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button size="icon" onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
