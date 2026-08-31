'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  documentId: string | null;
  document: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
  } | null;
  messages: {
    role: string;
    content: string;
    createdAt: string;
  }[];
  _count: {
    messages: number;
  };
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function ChatsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        } else {
          setError('Failed to load conversations');
        }
      } catch {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header title="Recent Chats" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={32} className="animate-spin text-[#7c3aed]" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Recent Chats" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5f56]/20 text-[#ff5f56]">
            <Icon name="AlertCircle" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">Something went wrong</h3>
          <p className="mb-6 text-[#ccc3d8]">{error}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Recent Chats"
        subtitle="Your conversation history"
      />

      <div className="space-y-4">
        {conversations.map((chat) => (
          <Card
            key={chat.id}
            className="cursor-pointer bg-[#1d2021]/50 border-[#958da1]/20 transition-all duration-200 hover:border-[#7c3aed]/30 hover:shadow-lg hover:shadow-[#7c3aed]/5"
            onClick={() => chat.documentId && router.push(`/dashboard/document/${chat.documentId}`)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#d2bbff]">
                  <Icon name="MessageCircle" size={24} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-medium text-[#e1e3e4]">{chat.title}</h3>
                    <span className="flex-shrink-0 text-xs text-[#ccc3d8]">
                      {formatRelativeTime(chat.updatedAt)}
                    </span>
                  </div>
                  {chat.document && (
                    <p className="flex items-center gap-1.5 text-sm text-[#ccc3d8]">
                      <Icon name="FileText" size={12} className="flex-shrink-0" />
                      <span className="truncate">{chat.document.title}</span>
                    </p>
                  )}
                  {chat.messages[0] && (
                    <p className="truncate text-sm text-[#ccc3d8]/80">
                      {chat.messages[0].role === 'USER' ? 'You: ' : ''}
                      {chat.messages[0].content.substring(0, 120)}
                      {chat.messages[0].content.length > 120 ? '...' : ''}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Chip variant="default" size="sm">
                      {chat._count.messages} message{chat._count.messages === 1 ? '' : 's'}
                    </Chip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2021] text-[#ccc3d8]">
            <Icon name="MessageCircle" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">No conversations yet</h3>
          <p className="mb-6 text-[#ccc3d8]">
            Open a processed document and ask your first question
          </p>
          <Button asChild>
            <a href="/dashboard/documents">Browse Documents</a>
          </Button>
        </div>
      )}
    </>
  );
}
