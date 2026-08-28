'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  extractedText?: string;
  status: string;
  processedAt?: string;
  processingError?: string;
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

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
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
  }, [params.id, session]);

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
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.editedTitle,
          description: data.editedDescription,
        }),
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

    try {
      const response = await fetch(`/api/documents/${params.id}`, { method: 'DELETE' });

      if (response.ok) {
        router.push('/dashboard/documents');
      } else {
        setData({ ...data, error: 'Failed to delete document' });
      }
    } catch (err) {
      setData({ ...data, error: 'Network error' });
    }
  };

  const handleOpenFile = () => {
    if (data.document?.fileUrl) {
      window.open(data.document.fileUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (data.document?.fileUrl) {
      try {
        const response = await fetch(data.document.fileUrl);
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
      const response = await fetch(`/api/documents/${params.id}`);
      if (response.ok) {
        const document = await response.json();
        setData((prev) => ({ ...prev, document }));
      }
    } catch (err) {
      console.error('Failed to refresh document:', err);
    }
  };

  if (data.isLoading) {
    return (
      <>
        <Header title="Document" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Icon name="Loader2" size={32} className="animate-spin text-[#7c3aed]" />
            <p className="text-[#ccc3d8]">Loading document...</p>
          </div>
        </div>
      </>
    );
  }

  if (data.error) {
    return (
      <>
        <Header title="Document" subtitle="Error" />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5f56]/20 text-[#ff5f56]">
                <Icon name="AlertCircle" size={32} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">Error loading document</h3>
              <p className="text-[#ccc3d8]">{data.error}</p>
              <Button className="mt-6" onClick={() => router.push('/dashboard/documents')}>
                Back to Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!data.document) {
    return null;
  }

  const fileExtension = data.document.fileName.split('.').pop()?.toUpperCase() || '';
  const canPreview = ['PDF', 'TXT'].includes(fileExtension);
  const isPDF = fileExtension === 'PDF';

  return (
    <>
      <Header
        title="Document"
        subtitle={data.document.fileName}
      />

      {data.successMessage && (
        <div className="mb-6 rounded-lg bg-[#d2bbff]/20 px-4 py-3 text-sm text-[#d2bbff]">
          {data.successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Viewer Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Preview Section */}
          <Card className="bg-[#0c0f10] border-[#958da1]/20 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#958da1]/20 bg-[#1d2021] px-6 py-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[#7c3aed]/20 text-[#d2bbff]">
                  <Icon name="FileText" size={20} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-[#e1e3e4]">
                    {data.document.title}
                  </span>
                  <span className="truncate text-xs text-[#ccc3d8]">
                    {data.document.fileName} • {formatFileSize(data.document.fileSize)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip variant="default" size="sm">
                  {data.document.fileType.replace('application/', '').replace('text/', '') || 'FILE'}
                </Chip>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#ccc3d8] hover:text-[#e1e3e4]">
                  <Icon name="Maximize2" size={16} />
                </Button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto bg-[#050505] p-6">
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
                    {/* In production, this would fetch the file content */}
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

          {data.document.status === 'COMPLETED' && data.document.extractedText && (
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
          )}

          {/* Document Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleOpenFile}>
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Open File
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Icon name="DownloadCloud" size={16} className="mr-2" />
              Download
            </Button>
            {data.document.status === 'PENDING' && (
              <Button onClick={handleProcessDocument} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon name="FileText" size={16} className="mr-2" />
                    Process Document
                  </>
                )}
              </Button>
            )}
            {data.document.status === 'FAILED' && (
              <Button variant="outline" onClick={handleProcessDocument} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Retry Processing
                  </>
                )}
              </Button>
            )}
            {data.isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-[#7c3aed] hover:bg-[#6d37d6]">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Details
                </Button>
                <Button variant="outline" className="text-[#ff5f56] hover:bg-[#ff5f56]/10 hover:text-[#ff5f56]" onClick={handleDelete}>
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Document Info Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
            <CardHeader>
              <CardTitle className="text-[#e1e3e4]">Status</CardTitle>
              <CardDescription className="text-[#ccc3d8]">Processing status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20">
                <span className="text-sm text-[#ccc3d8]">Status</span>
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
                <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20">
                  <span className="text-sm text-[#ccc3d8]">Processed</span>
                  <span className="text-sm text-[#ccc3d8]">{formatDate(data.document.processedAt)}</span>
                </div>
              )}
              {data.document.processingError && (
                <div className="py-2 border-b border-[#958da1]/20">
                  <span className="text-sm text-[#ff5f56]">Error</span>
                  <p className="mt-1 text-sm text-[#ccc3d8]">{data.document.processingError}</p>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20">
                <span className="text-sm text-[#ccc3d8]">File Type</span>
                <span className="text-sm font-medium text-[#e1e3e4]">{data.document.fileType}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20">
                <span className="text-sm text-[#ccc3d8]">File Size</span>
                <span className="text-sm font-medium text-[#e1e3e4]">{formatFileSize(data.document.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#958da1]/20">
                <span className="text-sm text-[#ccc3d8]">Original Name</span>
                <span className="text-sm font-medium text-[#e1e3e4] truncate max-w-[150px]" title={data.document.fileName}>
                  {data.document.fileName}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
            <CardHeader>
              <CardTitle className="text-[#e1e3e4]">Metadata</CardTitle>
              <CardDescription className="text-[#ccc3d8]">Document information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
        </div>
      </div>
    </>
  );
}
