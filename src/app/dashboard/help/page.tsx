'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'How do I upload documents?',
    answer: 'Click the "Upload" button on the dashboard or drag and drop files directly into the upload area. Supported formats include PDF, DOCX, TXT, and CSV up to 50MB.',
  },
  {
    question: 'How does the AI analyze documents?',
    answer: 'Our AI uses advanced natural language processing to understand and extract insights from your documents. Once uploaded, you can ask questions and get precise, cited answers.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use enterprise-grade encryption for all your documents. Your data is private by design and never shared with third parties.',
  },
  {
    question: 'Can I collaborate with others?',
    answer: 'Collaboration features are coming soon! Currently, you can share document insights and export analysis reports.',
  },
  {
    question: 'What file formats are supported?',
    answer: 'We currently support PDF, DOCX, TXT, and CSV files. Support for more formats is coming in future updates.',
  },
  {
    question: 'How long does document processing take?',
    answer: 'Processing time depends on document size. Most documents are processed within seconds, allowing for immediate conversation and analysis.',
  },
];

export default function HelpPage() {
  return (
    <>
      <Header
        title="Help & Support"
        subtitle="Get help with MarDocs"
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold text-[#e1e3e4]">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-[#1d2021]/50 border-[#958da1]/20">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Icon name="HelpCircle" size={20} className="mt-1 text-[#7c3aed]" />
                      <div className="space-y-2">
                        <h3 className="font-medium text-[#e1e3e4]">{faq.question}</h3>
                        <p className="text-sm text-[#ccc3d8]">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-6">
          <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
            <CardHeader>
              <CardTitle className="text-[#e1e3e4]">Need More Help?</CardTitle>
              <CardDescription className="text-[#ccc3d8]">Contact our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3e4]">Email Support</label>
                <div className="flex items-center gap-2 rounded-md border border-[#958da1]/30 bg-[#0c0f10] px-3 py-2">
                  <Icon name="Mail" size={16} className="text-[#ccc3d8]" />
                  <span className="text-sm text-[#ccc3d8]">support@mardocs.ai</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3e4]">Documentation</label>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    Read the Docs
                  </a>
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3e4]">Community</label>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Icon name="Users" size={16} className="mr-2" />
                    Join Community
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
            <CardHeader>
              <CardTitle className="text-[#e1e3e4]">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="#">Status Page</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="#">Privacy Policy</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="#">Terms of Service</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="#">Changelog</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
