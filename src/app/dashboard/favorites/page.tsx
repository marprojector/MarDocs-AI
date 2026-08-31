'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Favorite {
  id: string;
  documentId: string;
  createdAt: string;
  document: {
    id: string;
    title: string;
    description: string | null;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: string;
    isIndexed: boolean;
    createdAt: string;
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
        setError(null);
      } else {
        setError('Failed to load favorites');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchFavorites, 0);
    return () => clearTimeout(timer);
  }, [fetchFavorites]);

  const handleRemove = async (favorite: Favorite) => {
    setRemovingId(favorite.id);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: favorite.documentId }),
        credentials: 'include',
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
      } else {
        setError('Failed to remove favorite');
      }
    } catch {
      setError('Network error');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Favorites" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={32} className="animate-spin text-[#7c3aed]" />
        </div>
      </>
    );
  }

  if (error && favorites.length === 0) {
    return (
      <>
        <Header title="Favorites" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5f56]/20 text-[#ff5f56]">
            <Icon name="AlertCircle" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">Something went wrong</h3>
          <p className="mb-6 text-[#ccc3d8]">{error}</p>
          <Button onClick={fetchFavorites}>Try again</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Favorites"
        subtitle="Documents you've saved for quick access"
      />

      {error && (
        <p className="mb-4 rounded-lg bg-[#ffb4ab]/10 px-3 py-2 text-sm text-[#ffb4ab]" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {favorites.map((favorite) => (
          <Card
            key={favorite.id}
            className="cursor-pointer bg-[#1d2021]/50 border-[#958da1]/20 transition-colors hover:border-[#7c3aed]/30"
            onClick={() => router.push(`/dashboard/document/${favorite.documentId}`)}
          >
            <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#d2bbff]">
                  <Icon name="FileText" size={24} />
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="truncate font-medium text-[#e1e3e4]">{favorite.document.title}</h3>
                  {favorite.document.description && (
                    <p className="truncate text-sm text-[#ccc3d8]">{favorite.document.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[#ccc3d8]">
                    <span>{formatFileSize(favorite.document.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(favorite.createdAt)}</span>
                    {favorite.document.isIndexed && (
                      <span className="inline-flex items-center gap-1 text-[#27c93f]">
                        <Icon name="CheckCircle2" size={12} />
                        Indexed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Chip
                  variant={favorite.document.status === 'COMPLETED' ? 'default' : 'outline'}
                  size="sm"
                  className="hidden sm:flex"
                >
                  {favorite.document.status}
                </Chip>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-[#7c3aed] hover:bg-[#7c3aed]/10"
                  disabled={removingId === favorite.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(favorite);
                  }}
                  aria-label="Remove from favorites"
                >
                  {removingId === favorite.id ? (
                    <Icon name="Loader2" size={18} className="animate-spin" />
                  ) : (
                    <Icon name="Star" size={18} />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2021] text-[#ccc3d8]">
            <Icon name="Star" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">No favorites yet</h3>
          <p className="mb-6 text-[#ccc3d8]">
            Star a document from its detail page to save it here
          </p>
          <Button asChild>
            <a href="/dashboard/documents">Browse Documents</a>
          </Button>
        </div>
      )}
    </>
  );
}
