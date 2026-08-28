'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: 'FileText',
    title: 'Understand Documents',
    description:
      'Deep analysis of PDFs, Word files, and more, extracting key insights instantly.',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: 'MessageCircle',
    title: 'Instant AI Answers',
    description:
      'Chat directly with your documents. Ask questions and get precise, cited answers.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: 'Library',
    title: 'Smart Library',
    description:
      'Organize your knowledge base securely with intelligent tagging and search.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: 'ShieldLock',
    title: 'Private by Design',
    description:
      'Enterprise-grade security ensures your confidential documents remain yours alone.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="group relative rounded-2xl bg-[#1d2021]/50 p-8 transition-all duration-300 hover:bg-[#1d2021] hover:shadow-lg hover:shadow-[#7c3aed]/5">
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#d2bbff] shadow-lg shadow-[#7c3aed]/20">
        <Icon name={icon} size={24} />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-[#e1e3e4]">
        {title}
      </h3>
      <p className="text-[#ccc3d8]">{description}</p>
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center py-24 text-center">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] max-w-3xl -z-10">
        <div className="absolute inset-0 bg-[#7c3aed]/20 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[#d2bbff]/10 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-4 py-1.5">
          <span className="flex h-2 w-2 rounded-full bg-[#d2bbff]" />
          <span className="text-sm font-medium text-[#d2bbff]">
            AI Document Assistant
          </span>
        </div>
        <h1 className="mb-6 text-5xl font-semibold tracking-tight text-[#e1e3e4] md:text-6xl lg:text-7xl">
          Your Documents. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d2bbff] to-[#7c3aed]">
            Now Intelligent.
          </span>
        </h1>
        <p className="mb-10 text-lg text-[#ccc3d8] md:text-xl">
          Upload your documents and have natural conversations with an AI that
          understands what you read.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button className="h-14 px-8 text-lg" asChild>
            <Link href="/dashboard">
              Get Started
              <Icon name="ArrowRight" size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="outline" className="h-14 px-8 text-lg">
            See how it works
            <Icon name="Play" size={20} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Mock document viewer illustration */}
      <div className="relative mt-20 w-full max-w-4xl px-6">
        <div className="relative rounded-xl border border-[#958da1]/30 bg-[#0c0f10] p-4 shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="flex h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="flex h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1d2021] to-[#111415] p-6">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-[#7c3aed]/20 flex items-center justify-center">
                    <Icon name="FileText" size={20} className="text-[#d2bbff]" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-48 rounded bg-[#e1e3e4]/20" />
                    <div className="h-2 w-24 rounded bg-[#ccc3d8]/20" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded bg-[#958da1]/20" />
                  <div className="h-8 w-8 rounded bg-[#958da1]/20" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-[#e1e3e4]/10" />
                <div className="h-4 w-5/6 rounded bg-[#e1e3e4]/10" />
                <div className="h-4 w-4/6 rounded bg-[#e1e3e4]/10" />
                <div className="h-4 w-full rounded bg-[#e1e3e4]/10" />
                <div className="h-4 w-3/4 rounded bg-[#e1e3e4]/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-semibold text-[#e1e3e4]">
            Everything you need to analyze documents
          </h2>
          <p className="text-lg text-[#ccc3d8]">
            Powerful features packaged in a simple, intuitive interface.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: 'Upload',
      title: 'Upload',
      description:
        'Drag and drop your files into the secure vault. Supports PDF, DOCX, TXT, and CSV.',
    },
    {
      icon: 'MessageCircle',
      title: 'Ask',
      description:
        'Start a conversation to extract data or summaries. Ask questions in natural language.',
    },
    {
      icon: 'Lightbulb',
      title: 'Understand',
      description:
        'Gain immediate, actionable insights from your text with AI-powered analysis.',
    },
  ];

  return (
    <section className="py-24 bg-[#0c0f10]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-semibold text-[#e1e3e4]">
            How It Works
          </h2>
          <p className="text-lg text-[#ccc3d8]">
            Three simple steps to intelligent document analysis.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1d2021] border border-[#958da1]/20 text-[#7c3aed] shadow-lg shadow-[#7c3aed]/10">
                <Icon name={step.icon} size={32} />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-[#e1e3e4]">
                {step.title}
              </h3>
              <p className="text-[#ccc3d8]">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(33%+2rem)] w-16 h-0.5 bg-[#958da1]/30">
                  <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-[#7c3aed]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-[#958da1]/20 py-12 bg-[#0c0f10]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-white">
                <Icon name="BrainCircuit" size={16} />
              </div>
              <span className="text-lg font-semibold text-[#e1e3e4]">MarDocs</span>
            </div>
            <p className="text-sm text-[#ccc3d8]">
              AI-powered document analysis and conversation platform.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#e1e3e4] uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-[#ccc3d8]">
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#e1e3e4] uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-[#ccc3d8]">
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#e1e3e4] uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-[#ccc3d8]">
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#d2bbff] transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-[#958da1]/20 pt-8 text-center">
          <p className="text-sm text-[#ccc3d8]">
            © 2024 MarDocs AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#111415]">
      <nav className="border-b border-[#958da1]/20 bg-[#111415]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-white">
                <Icon name="BrainCircuit" size={16} />
              </div>
              <span className="text-xl font-semibold text-[#e1e3e4]">MarDocs</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/dashboard/documents" className="text-sm font-medium text-[#ccc3d8] hover:text-[#e1e3e4]">
                Features
              </Link>
              <Link href="#" className="text-sm font-medium text-[#ccc3d8] hover:text-[#e1e3e4]">
                How It Works
              </Link>
              <Link href="#" className="text-sm font-medium text-[#ccc3d8] hover:text-[#e1e3e4]">
                Pricing
              </Link>
              <Button variant="outline" className="h-9 px-4 text-sm">
                Sign In
              </Button>
              <Button className="h-9 px-4 text-sm" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;
