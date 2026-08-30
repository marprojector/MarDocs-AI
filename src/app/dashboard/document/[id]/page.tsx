'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Document {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  extractedText?: string | null;
  status: string;
  processedAt?: string | null;
  processingError?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentData {
  document: Document | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isEditing: boolean;
  editedTitle: string;
  editedDescription: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface Citation {
  id: string;
  pageNumber: number | null;
  sectionTitle: string | null;
  contentPreview: string | null;
  relevanceScore: number | null;
  document: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
  };
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<DocumentData>({
    document: null,
    isLoading: true,
    error: null,
    successMessage: null,
    isEditing: false,
    editedTitle: '',
    editedDescription: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentId, setDocumentId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { id } = await params;
        setDocumentId(id);
        const response = await fetch(`/api/documents/${id}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const document = await response.json();
          setData({
            document,
            isLoading: false,
            error: null,
            successMessage: null,
            isEditing: false,
            editedTitle: document.title,
            editedDescription: document.description || '',
          });
        } else if (response.status === 404) {
          setData({ ...data, isLoading: false, error: 'Document not found' });
        } else {
          setData({ ...data, isLoading: false, error: 'Failed to load document' });
        }
      } catch (err) {
        setData({ ...data, isLoading: false, error: 'Network error' });
      }
    };

    if (session?.user?.id) {
      fetchDocument();
    }
  }, [params, session]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const handleEdit = () => {
    setData({ ...data, isEditing: true });
  };

  const handleSave = async () => {
    if (!data.document) return;

    try {
      const { id } = await params;
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.editedTitle,
          description: data.editedDescription,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedDocument = await response.json();
        setData({
          document: updatedDocument,
          isLoading: false,
          error: null,
          successMessage: 'Document updated successfully',
          isEditing: false,
          editedTitle: updatedDocument.title,
          editedDescription: updatedDocument.description || '',
        });
        setTimeout(() => setData({ ...data, successMessage: null }), 3000);
      } else {
        setData({ ...data, error: 'Failed to update document' });
      }
    } catch (err) {
      setData({ ...data, error: 'Network error' });
    }
  };

  const handleCancel = () => {
    if (data.document) {
      setData({
        ...data,
        isEditing: false,
        editedTitle: data.document.title,
        editedDescription: data.document.description || '',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This will also delete the stored file.')) {
      return;
    }

    if (!data.document) return;

    try {
      const { id } = await params;
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/dashboard/documents');
      } else {
        setData({ ...data, error: 'Failed to delete document' });
      }
    } catch (err) {
      setData({ ...data, error: 'Network error' });
    }
  };

  const handleOpenFile = async () => {
    if (data.document?.id) {
      const response = await fetch(`/api/documents/${data.document.id}/file`, {
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        setData({ ...data, error: 'Failed to open file' });
      }
    }
  };

  const handleDownload = async () => {
    if (data.document?.id) {
      try {
        const response = await fetch(`/api/documents/${data.document.id}/file`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to download file');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.document.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setData({ ...data, error: 'Failed to download file' });
      }
    }
  };

  const handleProcessDocument = async () => {
    if (!data.document) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/documents/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.document.id }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setData((prev) => ({
          ...prev,
          document: result.status ? { ...prev.document!, status: result.status } : prev.document,
          successMessage: result.message || 'Document processing completed successfully',
        }));
        setTimeout(() => setData((prev) => ({ ...prev, successMessage: null })), 3000);
      } else {
        const errorData = await response.json();
        setData({ ...data, error: errorData.error || 'Processing failed' });
      }
    } catch (err) {
      setData({ ...data, error: 'Network error during processing' });
    } finally {
      setIsProcessing(false);
      fetchDocument();
    }
  };

  const fetchDocument = async () => {
    try {
      const { id } = await params;
      const response = await fetch(`/api/documents/${id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const document = await response.json();
        setData((prev) => ({ ...prev, document }));
      }
    } catch (err) {
      console.error('Failed to refresh document:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, streamingContent]);

  const fetchCitations = async (messageId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/chat/citations?messageId=${messageId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.citations || [];
      }
    } catch (error) {
      console.error('[FETCH_CITATIONS_ERROR]', error);
    }
    return [];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming || !documentId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const response = await fetch(`/api/documents/${documentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationId: conversationId,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const conversationIdHeader = response.headers.get('X-Conversation-Id');
      if (conversationIdHeader && !conversationId) {
        setConversationId(conversationIdHeader);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedContent += chunk;
          setStreamingContent(accumulatedContent);
        }

        const assistantMessageId = response.headers.get('X-Assistant-Message-Id');
        if (!assistantMessageId) {
          throw new Error('Assistant message ID was not returned');
        }

        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: accumulatedContent,
        };

        setChatMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');

        for (let attempt = 0; attempt < 5; attempt++) {
          const citations = await fetchCitations(assistantMessageId);
          if (citations.length > 0) {
            setChatMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, citations } : msg
              )
            );
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('[CHAT_ERROR]', error);
      setData((prev) => ({
        ...prev,
        error: 'Failed to send message. Please try again.',
      }));
    } finally {
      setIsStreaming(false);
    }
  };

  if (data.isLoading) {
    return (
      <>
        <Header title="Document" subtitle="Loading..." />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-20"
        >
          <div className="flex flex-col items-center gap-4">
            <Icon name="Loader2" size={32} className="animate-spin text-[#7c3aed]" />
            <p className="text-[#ccc3d8]">Loading document...</p>
          </div>
        </motion.div>
      </>
    );
  }

  if (data.error) {
    return (
      <>
        <Header title="Document" subtitle="Error" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center py-20 px-4"
        >
          <Card className="max-w-md w-full">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5f56]/20 text-[#ff5f56] mx-auto">
                <Icon name="AlertCircle" size={32} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">Error loading document</h3>
              <p className="text-[#ccc3d8]">{data.error}</p>
              <Button className="mt-6" onClick={() => router.push('/dashboard/documents')}>
                Back to Documents
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </>
    );
  }

  if (!data.document) {
    return null;
  }

  const fileExtension = data.document.fileName.split('.').pop()?.toUpperCase() || '';
  const isPDF = fileExtension === 'PDF';

  return (
    <>
      <Header
        title="Document"
        subtitle={data.document.fileName}
      />

      {data.successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-3 sm:mb-4 lg:mb-6 rounded-lg bg-[#d2bbff]/20 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-[#d2bbff]"
        >
          {data.successMessage}
        </motion.div>
      )}

      <div className="flex flex-col gap-3 sm:gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
          {/* Chat Interface - Only show if document is completed */}
          {data.document.status === 'COMPLETED' && data.document.extractedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-[#0c0f10] border-[#958da1]/20">
                <CardHeader className="border-b border-[#958da1]/20 bg-[#1d2021]/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg text-[#e1e3e4]">Chat with Document</CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-[#ccc3d8]">
                        Ask questions about your document
                      </CardDescription>
                    </div>
                    <Icon name="MessageSquare" size={20} className="text-[#7c3aed] flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Messages Container */}
                  <div className="h-[400px] sm:h-[500px] overflow-y-auto bg-[#050505] p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {chatMessages.length === 0 && !streamingContent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex h-full items-center justify-center text-center px-4"
                      >
                        <div className="max-w-md space-y-3">
                          <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7c3aed]/20 text-[#7c3aed]">
                              <Icon name="MessageSquare" size={32} />
                            </div>
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-[#e1e3e4]">Start a conversation</h3>
                          <p className="text-xs sm:text-sm text-[#ccc3d8]">
                            Ask questions about the document content and get AI-powered answers.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    
                    <AnimatePresence mode="popLayout">
                      {chatMessages.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] rounded-lg px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 ${
                              msg.role === 'user'
                                ? 'bg-[#7c3aed] text-white'
                                : 'bg-[#1d2021] text-[#e1e3e4] border border-[#958da1]/20'
                            }`}
                          >
                            <div className="flex items-start gap-1.5 sm:gap-2 min-w-0">
                              {msg.role === 'assistant' && (
                                <Icon name="Bot" size={14} className="mt-0.5 sm:mt-1 flex-shrink-0 text-[#7c3aed]" />
                              )}
                              <p className="text-xs sm:text-sm break-words overflow-wrap-anywhere whitespace-pre-wrap min-w-0">{msg.content}</p>
                            </div>
                          </div>

                          {/* Citations */}
                          {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ delay: 0.2 }}
                              className="mt-1.5 sm:mt-2 w-full max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] space-y-1.5 sm:space-y-2"
                            >
                              {msg.citations.map((citation) => (
                                <motion.div
                                  key={citation.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="rounded-lg border border-[#958da1]/20 bg-[#0c0f10] p-2 sm:p-2.5 lg:p-3 text-xs w-full overflow-hidden"
                                >
                                  <div className="flex items-start gap-1.5 sm:gap-2 min-w-0">
                                    <Icon name="FileText" size={12} className="mt-0.5 flex-shrink-0 text-[#7c3aed]" />
                                    <div className="flex-1 space-y-1 min-w-0 overflow-hidden">
                                      <div className="flex items-start gap-1.5 flex-wrap min-w-0">
                                        <span className="font-medium text-[#e1e3e4] break-words min-w-0 flex-1">
                                          {citation.document.title}
                                        </span>
                                        {citation.pageNumber && (
                                          <span className="text-[#ccc3d8] whitespace-nowrap flex-shrink-0 text-xs">• Page {citation.pageNumber}</span>
                                        )}
                                      </div>
                                      {citation.sectionTitle && (
                                        <div className="text-[#ccc3d8] break-words overflow-hidden">
                                          Section: {citation.sectionTitle}
                                        </div>
                                      )}
                                      {citation.contentPreview && (
                                        <div className="mt-1.5 rounded bg-[#1d2021] p-1.5 sm:p-2 text-[#ccc3d8] break-words overflow-hidden">
                                          {citation.contentPreview}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {streamingContent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-[#1d2021] text-[#e1e3e4] border border-[#958da1]/20">
                          <div className="flex items-start gap-2">
                            <Icon name="Bot" size={16} className="mt-1 flex-shrink-0 text-[#7c3aed]" />
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{streamingContent}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {isStreaming && !streamingContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-[#1d2021] border border-[#958da1]/20">
                          <div className="flex items-center gap-2">
                            <Icon name="Loader2" size={16} className="animate-spin text-[#7c3aed]" />
                            <span className="text-xs sm:text-sm text-[#ccc3d8]">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-[#958da1]/20 bg-[#1d2021]/30 p-2.5 sm:p-3 lg:p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask a question..."
                      className="flex-1 bg-[#0c0f10] border-[#958da1]/30 text-[#e1e3e4] text-sm h-10 min-w-0"
                      disabled={isStreaming}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isStreaming}
                      className="px-3 flex-shrink-0 h-10 w-10 sm:w-auto sm:px-4"
                      size="default"
                    >
                      {isStreaming ? (
                        <Icon name="Loader2" size={18} className="animate-spin" />
                      ) : (
                        <Icon name="Send" size={18} />
                      )}
                    </Button>
                  </div>
                  <p className="mt-1.5 text-xs text-[#ccc3d8] hidden sm:block">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* File Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#0c0f10] border-[#958da1]/20 flex flex-col overflow-hidden w-full">
            <div className="flex items-center justify-between border-b border-[#958da1]/20 bg-[#1d2021] px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 gap-2">
              <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 flex-shrink-0 items-center justify-center rounded bg-[#7c3aed]/20 text-[#d2bbff]">
                  <Icon name="FileText" size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                  <span className="truncate text-xs sm:text-sm font-medium text-[#e1e3e4]">
                    {data.document.title}
                  </span>
                  <span className="truncate text-xs text-[#ccc3d8]">
                    {data.document.fileName} • {formatFileSize(data.document.fileSize)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <Chip variant="default" size="sm" className="hidden sm:flex text-xs">
                  {data.document.fileType.replace('application/', '').replace('text/', '').toUpperCase() || 'FILE'}
                </Chip>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#ccc3d8] hover:text-[#e1e3e4] hidden lg:flex">
                  <Icon name="Maximize2" size={16} />
                </Button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto bg-[#050505] p-3 sm:p-4 lg:p-6">
              {isPDF ? (
                <div className="flex h-full min-h-[500px] items-center justify-center bg-[#1d2021]/50 rounded-lg">
                  <object
                    data={data.document.fileUrl}
                    type="application/pdf"
                    className="w-full h-[600px] rounded-lg border border-[#958da1]/20"
                  >
                    <div className="text-center p-8">
                      <p className="text-[#ccc3d8] mb-4">
                        Your browser does not support PDF viewing.
                      </p>
                      <Button onClick={handleDownload}>
                        <Icon name="DownloadCloud" size={16} className="mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </object>
                </div>
              ) : fileExtension === 'TXT' ? (
                <div className="prose prose-invert max-w-none">
                  <pre className="bg-[#1d2021] p-6 rounded-lg overflow-auto text-sm text-[#ccc3d8] font-mono whitespace-pre-wrap">
                    <span className="text-[#7c3aed]">
                      [TXT file preview - content would be displayed here]
                    </span>
                    {data.document.description && (
                      <div className="mt-4 text-[#ccc3d8]">
                        <h4 className="font-semibold text-[#d2bbff]">Description:</h4>
                        {data.document.description}
                      </div>
                    )}
                  </pre>
                </div>
              ) : (
                <div className="flex h-[500px] flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1d2021] text-[#ccc3d8]">
                    <Icon name="FileText" size={40} />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold text-[#e1e3e4]">
                    {fileExtension} File
                  </h3>
                  <p className="mb-6 text-[#ccc3d8]">
                    This file type can be viewed in your browser
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={handleOpenFile}>
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      Open in New Tab
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                      <Icon name="DownloadCloud" size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
          </motion.div>

          {data.document.status === 'COMPLETED' && data.document.extractedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-[#0c0f10] border-[#958da1]/20">
              <CardHeader className="border-b border-[#958da1]/20 bg-[#1d2021]/50">
                <CardTitle className="text-[#e1e3e4]">Extracted Text</CardTitle>
                <CardDescription className="text-[#ccc3d8]">
                  {data.document.extractedText.length} characters extracted
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto bg-[#050505] p-6">
                  <pre className="prose prose-invert max-w-none text-sm text-[#ccc3d8] font-mono whitespace-pre-wrap">
                    {data.document.extractedText}
                  </pre>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}

          {/* Document Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2"
          >
            <Button onClick={handleOpenFile} size="sm" className="text-xs sm:text-sm">
              <Icon name="ExternalLink" size={14} className="mr-1.5 sm:mr-2" />
              <span>Open</span>
            </Button>
            <Button variant="outline" onClick={handleDownload} size="sm" className="text-xs sm:text-sm">
              <Icon name="DownloadCloud" size={14} className="mr-1.5 sm:mr-2" />
              Download
            </Button>
            {data.document.status === 'PENDING' && (
              <Button onClick={handleProcessDocument} disabled={isProcessing} size="sm" className="col-span-2 sm:col-span-1 text-xs sm:text-sm">
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={14} className="mr-1.5 sm:mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon name="FileText" size={14} className="mr-1.5 sm:mr-2" />
                    Process
                  </>
                )}
              </Button>
            )}
            {data.document.status === 'FAILED' && (
              <Button variant="outline" onClick={handleProcessDocument} disabled={isProcessing} size="sm" className="col-span-2 sm:col-span-1 text-xs sm:text-sm">
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={14} className="mr-1.5 sm:mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <Icon name="RefreshCw" size={14} className="mr-1.5 sm:mr-2" />
                    Retry
                  </>
                )}
              </Button>
            )}
            {data.isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-[#7c3aed] hover:bg-[#6d37d6] text-xs sm:text-sm" size="sm">
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm" className="text-xs sm:text-sm">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit} size="sm" className="text-xs sm:text-sm">
                  <Icon name="Edit" size={14} className="mr-1.5 sm:mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="text-[#ff5f56] hover:bg-[#ff5f56]/10 hover:text-[#ff5f56] text-xs sm:text-sm" onClick={handleDelete} size="sm">
                  <Icon name="Trash2" size={14} className="mr-1.5 sm:mr-2" />
                  Delete
                </Button>
              </>
            )}
          </motion.div>
        </div>

        {/* Document Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 sm:space-y-4 lg:space-y-6 min-w-0"
        >
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[#1d2021]/50 border-[#958da1]/20 w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-sm sm:text-base text-[#e1e3e4]">Status</CardTitle>
                <CardDescription className="text-xs text-[#ccc3d8]">Processing status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-3 p-3 sm:p-4 lg:p-6 pt-0">
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20 gap-2 min-w-0">
                <span className="text-xs sm:text-sm text-[#ccc3d8] flex-shrink-0">Status</span>
                <Chip
                  variant={
                    data.document.status === 'COMPLETED'
                      ? 'default'
                      : data.document.status === 'FAILED'
                      ? 'outline'
                      : 'default'
                  }
                  size="sm"
                >
                  {data.document.status}
                </Chip>
              </div>
              {data.document.processedAt && (
                <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20 gap-2">
                  <span className="text-xs sm:text-sm text-[#ccc3d8] flex-shrink-0">Processed</span>
                  <span className="text-xs sm:text-sm text-[#ccc3d8] truncate">{formatDate(data.document.processedAt)}</span>
                </div>
              )}
              {data.document.processingError && (
                <div className="py-2 border-b border-[#958da1]/20">
                  <span className="text-xs sm:text-sm text-[#ff5f56]">Error</span>
                  <p className="mt-1 text-xs sm:text-sm text-[#ccc3d8] break-words">{data.document.processingError}</p>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20 gap-2">
                <span className="text-xs sm:text-sm text-[#ccc3d8] flex-shrink-0">File Type</span>
                <span className="text-xs sm:text-sm font-medium text-[#e1e3e4] truncate">{data.document.fileType}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20 gap-2">
                <span className="text-xs sm:text-sm text-[#ccc3d8] flex-shrink-0">File Size</span>
                <span className="text-xs sm:text-sm font-medium text-[#e1e3e4]">{formatFileSize(data.document.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20 gap-2 min-w-0">
                <span className="text-xs sm:text-sm text-[#ccc3d8] flex-shrink-0">Original Name</span>
                <span className="text-xs sm:text-sm font-medium text-[#e1e3e4] truncate min-w-0" title={data.document.fileName}>
                  {data.document.fileName}
                </span>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Metadata Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-[#1d2021]/50 border-[#958da1]/20 w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-sm sm:text-base text-[#e1e3e4]">Metadata</CardTitle>
                <CardDescription className="text-xs text-[#ccc3d8]">Document information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              {data.isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#e1e3e4]">Title</label>
                    <Input
                      value={data.editedTitle}
                      onChange={(e) => setData({ ...data, editedTitle: e.target.value })}
                      className="bg-[#0c0f10] border-[#958da1]/30 text-[#e1e3e4]"
                      placeholder="Document title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#e1e3e4]">Description</label>
                    <Input
                      value={data.editedDescription}
                      onChange={(e) => setData({ ...data, editedDescription: e.target.value })}
                      className="bg-[#0c0f10] border-[#958da1]/30 text-[#e1e3e4]"
                      placeholder="Document description"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#e1e3e4]">Title</label>
                    <p className="text-sm text-[#ccc3d8]">{data.document.title}</p>
                  </div>
                  {data.document.description && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#e1e3e4]">Description</label>
                      <p className="text-sm text-[#ccc3d8]">{data.document.description}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#e1e3e4]">Uploaded</label>
                    <p className="text-sm text-[#ccc3d8]">{formatDate(data.document.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#e1e3e4]">Last Updated</label>
                    <p className="text-sm text-[#ccc3d8]">{formatDate(data.document.updatedAt)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
