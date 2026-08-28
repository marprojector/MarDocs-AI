'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const mockFavorites = [
  {
    id: '1',
    name: 'Q4_Financial_Report_2023.pdf',
    date: '2 days ago',
    size: '2.4 MB',
    type: 'PDF',
    description: 'Quarterly financial report for Q4 2023',
  },
  {
    id: '2',
    name: 'Security_Audit_Report.pdf',
    date: '1 month ago',
    size: '3.1 MB',
    type: 'PDF',
    description: 'Q2 security audit findings',
  },
  {
    id: '3',
    name: 'Product_Roadmap_2024.xlsx',
    date: '1 month ago',
    size: '1.5 MB',
    type: 'XLSX',
    description: 'Product development roadmap for 2024',
  },
];

export default function FavoritesPage() {
  return (
    <>
      <Header
        title="Favorites"
        subtitle="Your saved documents and conversations"
      />

      {mockFavorites.length > 0 ? (
        <div className="space-y-4">
          {mockFavorites.map((doc) => (
            <Card key={doc.id} className="bg-[#1d2021]/50 border-[#958da1]/20 hover:border-[#7c3aed]/30 transition-colors">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#d2bbff]">
                    <Icon name="FileText" size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-[#e1e3e4]">{doc.name}</h3>
                    <p className="text-sm text-[#ccc3d8]">{doc.description}</p>
                    <div className="flex items-center gap-3 text-xs text-[#ccc3d8]">
                      <span>Added {doc.date}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 text-xs">
                    <Icon name="Download" size={14} className="mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[#7c3aed]">
                    <Icon name="XCircle" size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2021] text-[#ccc3d8]">
            <Icon name="Star" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">No favorites yet</h3>
          <p className="text-[#ccc3d8]">
            Save documents or conversations to access them quickly
          </p>
          <Button className="mt-6" asChild>
            <a href="/dashboard/documents">Browse Documents</a>
          </Button>
        </div>
      )}
    </>
  );
}
