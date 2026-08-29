'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const MAX_SIZE = 50 * 1024 * 1024;

    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, DOCX, and TXT files are allowed.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError('File size exceeds 50MB limit.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('description', '');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedDoc = await response.json();
        setDocuments((prev) => [uploadedDoc, ...prev]);
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Failed to upload document');
      }
    } catch (err) {
      setUploadError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          setError('Failed to load documents');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

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

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else if (days < 30) {
      return `${Math.floor(days / 7)} weeks ago`;
    } else {
      return `${Math.floor(days / 30)} months ago`;
    }
  };

  const handleDocumentClick = (docId: string) => {
    router.push(`/dashboard/document/${docId}`);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFileType =
      fileTypeFilter === 'all' ||
      doc.fileType.toLowerCase().includes(fileTypeFilter.toLowerCase()) ||
      doc.fileName.toLowerCase().endsWith(fileTypeFilter);
    return matchesSearch && matchesFileType;
  });

  if (isLoading) {
    return (
      <>
        <Header
          title="Documents"
          subtitle="Your document library"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-20"
        >
          <div className="flex flex-col items-center gap-4">
            <Icon name="Loader2" size={32} className="animate-spin text-[#7c3aed]" />
            <p className="text-[#ccc3d8]">Loading documents...</p>
          </div>
        </motion.div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Documents"
          subtitle="Your document library"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center py-20"
        >
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5f56]/20 text-[#ff5f56] mx-auto">
                <Icon name="AlertCircle" size={32} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">Error loading documents</h3>
              <p className="text-[#ccc3d8]">{error}</p>
              <Button
                className="mt-6"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  const fetchDocuments = async () => {
                    try {
                      const response = await fetch('/api/documents');
                      if (response.ok) {
                        const data = await response.json();
                        setDocuments(data);
                      } else {
                        setError('Failed to load documents');
                      }
                    } catch (err) {
                      setError('Network error');
                    } finally {
                      setIsLoading(false);
                    }
                  };
                  fetchDocuments();
                }}
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 sm:mb-6 rounded-lg bg-[#ff5f56]/20 px-4 py-3 text-sm text-[#ff5f56]"
        >
          {uploadError}
          <button
            onClick={() => setUploadError(null)}
            className="ml-2 font-semibold hover:text-[#ff8a8a]"
          >
            Dismiss
          </button>
        </motion.div>
      )}
      <Header
        title="Documents"
        subtitle="Your document library"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#e1e3e4]">All Documents</h2>
          <Chip variant="default" size="sm">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </Chip>
        </div>
        <Button onClick={() => document.getElementById('fileInput')?.click()} disabled={isUploading}>
          {isUploading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Icon name="Upload" size={16} className="mr-2" />
              Upload Document
            </>
          )}
        </Button>
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
          aria-label="Select file to upload"
        />
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 sm:mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="relative w-full md:max-w-md">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8]" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full rounded-lg border border-[#958da1]/30 bg-[#0c0f10] pl-10 pr-10 py-2.5 text-sm text-[#e1e3e4] focus:border-[#7c3aed]/50 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] hover:text-[#e1e3e4] transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="appearance-none rounded-lg border border-[#958da1]/30 bg-[#0c0f10] pl-3 pr-8 py-2.5 text-sm text-[#e1e3e4] focus:border-[#7c3aed]/50 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]/50 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
            </select>
            <Icon
              name="ChevronDown"
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#ccc3d8]"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs">
            <Icon name="DownloadCloud" size={14} className="mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="h-9 text-xs" onClick={() => {
            setIsLoading(true);
            setError(null);
            fetchDocuments();
          }}>
            <Icon name="RefreshCw" size={14} className="mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </motion.div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className="bg-[#1d2021]/50 border-[#958da1]/20 hover:border-[#7c3aed]/30 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-[#7c3aed]/5 h-full"
                onClick={() => handleDocumentClick(doc.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#d2bbff]">
                      <Icon name="FileText" size={20} />
                    </div>
                    <Chip variant="default" size="sm">
                      {doc.fileType.replace('application/', '').replace('text/', '').toUpperCase() || 'FILE'}
                    </Chip>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-[#e1e3e4] truncate text-sm sm:text-base" title={doc.title}>
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-xs sm:text-sm text-[#ccc3d8] line-clamp-2" title={doc.description}>
                        {doc.description}
                      </p>
                    )}
                    <div className="pt-3 flex items-center justify-between text-xs text-[#ccc3d8]">
                      <span>{formatDate(doc.createdAt)}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : searchQuery || fileTypeFilter !== 'all' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2021] text-[#ccc3d8]">
            <Icon name="Search" size={32} />
          </div>
          <h3 className="mb-2 text-lg sm:text-xl font-semibold text-[#e1e3e4]">No matching documents found</h3>
          <p className="text-sm sm:text-base text-[#ccc3d8] mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFileTypeFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2021] text-[#ccc3d8]">
            <Icon name="FileText" size={32} />
          </div>
          <h3 className="mb-2 text-lg sm:text-xl font-semibold text-[#e1e3e4]">No documents found</h3>
          <p className="text-sm sm:text-base text-[#ccc3d8]">
            Upload a document to get started
          </p>
        </motion.div>
      )}
    </>
  );
}
