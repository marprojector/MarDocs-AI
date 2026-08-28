'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { FileUploadArea } from '@/components/ui/input';

const recentDocuments = [
  {
    name: 'Q3_Financial_Report_Final.pdf',
    date: '2 hours ago',
    size: '2.4 MB',
  },
  {
    name: 'Project_Alpha_Specs.docx',
    date: 'yesterday',
    size: '1.1 MB',
  },
  {
    name: 'Customer_Feedback_Survey.csv',
    date: '2 days ago',
    size: '845 KB',
  },
];

const recentChats = [
  {
    title: 'Analysis of Q3 Marketing Spend',
    document: 'Based on Q3_Financial_Report...',
    time: '2 hours ago',
  },
  {
    title: 'Extract key requirements from Alpha',
    document: 'Based on Project_Alpha_Specs...',
    time: 'yesterday',
  },
  {
    title: 'Summarize user feedback survey',
    document: 'Based on Survey_Results.csv...',
    time: '2 days ago',
  },
];

const UsageSummary = () => {
  return (
    <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
      <CardHeader>
        <CardTitle className="text-[#e1e3e4]">Usage Summary</CardTitle>
        <CardDescription className="text-[#ccc3d8]">Your current usage stats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ccc3d8]">
              <Icon name="HardDrive" size={16} />
              <span>Storage</span>
            </div>
            <span className="text-sm font-medium text-[#e1e3e4]">2.4 GB / 5 GB</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#0c0f10]">
            <div className="h-full w-[48%] rounded-full bg-[#7c3aed]" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ccc3d8]">
              <Icon name="Activity" size={16} />
              <span>API Calls</span>
            </div>
            <span className="text-sm font-medium text-[#e1e3e4]">840 / 1000</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#0c0f10]">
            <div className="h-full w-[84%] rounded-full bg-[#d2bbff]" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-[#958da1]/20">
          <span className="text-sm text-[#ccc3d8]">Need more?</span>
          <Button variant="outline" className="h-8 text-xs">
            Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const handleFileSelect = () => {
    console.log('File selection handled');
  };
  
  const handleDocumentClick = (docName: string) => {
    // Extract document ID from name (remove extension and special chars)
    const docId = docName.replace(/[^a-zA-Z0-9_]/g, '');
    router.push(`/dashboard/document/${docId}`);
  };

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back! Continue exploring your documents."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <UsageSummary />
          <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
            <CardHeader>
              <CardTitle className="text-[#e1e3e4]">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadArea
                label="Upload new intelligence"
                description="Supports PDF, DOCX, TXT, and CSV up to 50MB."
                onFileSelect={handleFileSelect}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#e1e3e4]">Recent Documents</h2>
              <Button variant="ghost" className="h-8 text-xs">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <Card 
                  key={doc.name} 
                  className="bg-[#1d2021]/50 border-[#958da1]/20 hover:border-[#7c3aed]/30 transition-colors cursor-pointer"
                  onClick={() => handleDocumentClick(doc.name)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#d2bbff]">
                        <Icon name="FileText" size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-[#e1e3e4]">{doc.name}</p>
                        <p className="text-xs text-[#ccc3d8]">
                          Added {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Icon name="MoreHorizontal" size={16} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#e1e3e4]">Recent Chats</h2>
              <Button variant="ghost" className="h-8 text-xs">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentChats.map((chat, index) => (
                <Card 
                  key={index} 
                  className="bg-[#1d2021]/50 border-[#958da1]/20 hover:border-[#7c3aed]/30 transition-colors cursor-pointer"
                  onClick={() => handleDocumentClick(chat.title.replace(/[^a-zA-Z0-9_]/g, ''))}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-[#e1e3e4]">{chat.title}</h3>
                      <p className="text-sm text-[#ccc3d8]">{chat.document}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <Chip variant="default" size="sm">
                          Chat
                        </Chip>
                        <span className="text-xs text-[#ccc3d8]">{chat.time}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
