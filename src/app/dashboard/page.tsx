'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface RecentDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  status: string;
  isIndexed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecentConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  documentId: string | null;
  document: {
    id: string;
    title: string;
  } | null;
  messages: {
    role: string;
    content: string;
    createdAt: string;
  }[];
}

interface DashboardData {
  stats: {
    documentCount: number;
    indexedCount: number;
    conversationCount: number;
    messageCount: number;
  };
  recentDocuments: RecentDocument[];
  recentConversations: RecentConversation[];
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

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
  if (days < 30) return `${days} days ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard', { credentials: 'include' });
      if (response.ok) {
        setData(await response.json());
        setError(null);
      } else {
        setError('Failed to load dashboard');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchDashboard, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboard]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    setUploadError(null);
    setUploadSuccess(false);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, DOCX, and TXT files are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds 50MB limit.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        fetchDashboard();
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Failed to upload document');
      }
    } catch {
      setUploadError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={32} className="animate-spin text-[#7c3aed]" />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5f56]/20 text-[#ff5f56]">
            <Icon name="AlertCircle" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">Something went wrong</h3>
          <p className="mb-6 text-[#ccc3d8]">{error || 'Failed to load dashboard'}</p>
          <Button onClick={() => { setIsLoading(true); setError(null); fetchDashboard(); }}>
            Try again
          </Button>
        </div>
      </>
    );
  }

  const { stats, recentDocuments, recentConversations } = data;

  const statCards = [
    { label: 'Documents', value: stats.documentCount, icon: 'FileText' },
    { label: 'Indexed', value: stats.indexedCount, icon: 'Database' },
    { label: 'Conversations', value: stats.conversationCount, icon: 'MessageCircle' },
    { label: 'Messages', value: stats.messageCount, icon: 'Activity' },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back! Continue exploring your documents."
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-[#1d2021]/50 border-[#958da1]/20">
            <CardContent className="flex items-center gap-3 p-4 sm:p-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#d2bbff]">
                <Icon name={stat.icon} size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-[#e1e3e4] sm:text-2xl">{stat.value}</p>
                <p className="truncate text-xs text-[#ccc3d8]">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
            <CardHeader>
              <CardTitle className="text-[#e1e3e4]">Upload Document</CardTitle>
              <CardDescription className="text-[#ccc3d8]">
                Add a new document to start chatting with it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="dashboard-file-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#958da1]/30 bg-[#0c0f10]/50 px-4 py-8 transition-colors hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Icon name="Loader2" size={24} className="animate-spin text-[#7c3aed]" />
                    <span className="text-sm text-[#ccc3d8]">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={24} className="text-[#7c3aed]" />
                    <span className="text-sm font-medium text-[#e1e3e4]">Click to upload</span>
                    <span className="text-xs text-[#ccc3d8]">PDF, DOCX, or TXT up to 50MB</span>
                  </>
                )}
              </button>
              {uploadSuccess && (
                <p className="mt-3 rounded-lg bg-[#27c93f]/10 px-3 py-2 text-xs text-[#27c93f]" role="status">
                  Document uploaded. Process it from the Documents page to start chatting.
                </p>
              )}
              {uploadError && (
                <p className="mt-3 rounded-lg bg-[#ffb4ab]/10 px-3 py-2 text-xs text-[#ffb4ab]" role="alert">
                  {uploadError}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#e1e3e4]">Recent Documents</h2>
              <Button variant="ghost" className="h-8 text-xs" asChild>
                <Link href="/dashboard/documents">View All</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentDocuments.length === 0 ? (
                <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
                  <CardContent className="flex flex-col items-center py-10 text-center">
                    <Icon name="FileText" size={32} className="mb-3 text-[#958da1]" />
                    <p className="mb-1 font-medium text-[#e1e3e4]">No documents yet</p>
                    <p className="text-sm text-[#ccc3d8]">Upload your first document to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                recentDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer bg-[#1d2021]/50 border-[#958da1]/20 transition-colors hover:border-[#7c3aed]/30"
                    onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#d2bbff]">
                          <Icon name="FileText" size={20} />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="truncate font-medium text-[#e1e3e4]">{doc.title}</p>
                          <p className="flex items-center gap-2 text-xs text-[#ccc3d8]">
                            <span>{formatRelativeTime(doc.updatedAt)}</span>
                            {doc.isIndexed && (
                              <span className="inline-flex items-center gap-1 text-[#27c93f]">
                                <Icon name="CheckCircle2" size={12} />
                                Indexed
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Chip
                        variant={doc.status === 'COMPLETED' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {doc.status}
                      </Chip>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#e1e3e4]">Recent Chats</h2>
              <Button variant="ghost" className="h-8 text-xs" asChild>
                <Link href="/dashboard/chats">View All</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentConversations.length === 0 ? (
                <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
                  <CardContent className="flex flex-col items-center py-10 text-center">
                    <Icon name="MessageCircle" size={32} className="mb-3 text-[#958da1]" />
                    <p className="mb-1 font-medium text-[#e1e3e4]">No conversations yet</p>
                    <p className="text-sm text-[#ccc3d8]">
                      Open a completed document to start chatting with it.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                recentConversations.map((chat) => (
                  <Card
                    key={chat.id}
                    className="cursor-pointer bg-[#1d2021]/50 border-[#958da1]/20 transition-colors hover:border-[#7c3aed]/30"
                    onClick={() =>
                      chat.documentId && router.push(`/dashboard/document/${chat.documentId}`)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate font-medium text-[#e1e3e4]">{chat.title}</h3>
                          <span className="flex-shrink-0 text-xs text-[#ccc3d8]">
                            {formatRelativeTime(chat.updatedAt)}
                          </span>
                        </div>
                        {chat.document && (
                          <p className="flex items-center gap-1.5 text-sm text-[#ccc3d8]">
                            <Icon name="FileText" size={12} />
                            <span className="truncate">{chat.document.title}</span>
                          </p>
                        )}
                        {chat.messages[0] && (
                          <p className="truncate text-sm text-[#ccc3d8]/80">
                            {chat.messages[0].role === 'USER' ? 'You: ' : ''}
                            {chat.messages[0].content.substring(0, 100)}
                            {chat.messages[0].content.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
