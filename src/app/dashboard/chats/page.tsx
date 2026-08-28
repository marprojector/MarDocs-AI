'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const mockChats = [
  {
    id: '1',
    title: 'Q4 Financial Report Analysis',
    document: 'Based on Q4_Financial_Report_2023.pdf',
    time: '2 hours ago',
    lastMessage: 'Revenue increased by 12.5% compared to last quarter.',
  },
  {
    id: '2',
    title: 'Project Alpha Requirements',
    document: 'Based on Project_Alpha_Specs.docx',
    time: 'Yesterday',
    lastMessage: 'The R&D budget allocation needs to be reviewed.',
  },
  {
    id: '3',
    title: 'Customer Feedback Summary',
    document: 'Based on Customer_Feedback_Survey.csv',
    time: '2 days ago',
    lastMessage: 'Customer satisfaction score improved by 8%.',
  },
  {
    id: '4',
    title: 'Marketing Campaign Review',
    document: 'Based on Marketing_Campaign_Analysis.pptx',
    time: '3 days ago',
    lastMessage: 'Social media campaigns performed 35% better than expected.',
  },
  {
    id: '5',
    title: 'Security Audit Findings',
    document: 'Based on Security_Audit_Report.pdf',
    time: '1 week ago',
    lastMessage: 'Two critical vulnerabilities were identified and patched.',
  },
  {
    id: '6',
    title: 'Product Roadmap Discussion',
    document: 'Based on Product_Roadmap_2024.xlsx',
    time: '2 weeks ago',
    lastMessage: 'Q3 launch timeline is confirmed for the new features.',
  },
];

export default function ChatsPage() {
  const router = useRouter();

  const handleChatClick = (chatId: string) => {
    router.push(`/dashboard/document/${chatId}`);
  };

  return (
    <>
      <Header
        title="Recent Chats"
        subtitle="Your conversation history"
      />

      <div className="space-y-4">
        {mockChats.map((chat) => (
          <Card
            key={chat.id}
            className="bg-[#1d2021]/50 border-[#958da1]/20 hover:border-[#7c3aed]/30 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-[#7c3aed]/5"
            onClick={() => handleChatClick(chat.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#d2bbff]">
                  <Icon name="MessageCircle" size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#e1e3e4]">{chat.title}</h3>
                    <span className="text-xs text-[#ccc3d8]">{chat.time}</span>
                  </div>
                  <p className="text-sm text-[#ccc3d8]">{chat.document}</p>
                  <p className="text-sm text-[#ccc3d8]/80">{chat.lastMessage}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <Chip variant="default" size="sm">
                      AI Chat
                    </Chip>
                    <div className="flex items-center gap-1 text-xs text-[#ccc3d8]">
                      <Icon name="FileText" size={12} />
                      <span>Document Analysis</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#ccc3d8]">
                  <Icon name="MoreVertical" size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockChats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2021] text-[#ccc3d8]">
            <Icon name="MessageCircle" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[#e1e3e4]">No conversations yet</h3>
          <p className="text-[#ccc3d8]">
            Start a conversation by uploading a document or asking a question
          </p>
        </div>
      )}
    </>
  );
}
