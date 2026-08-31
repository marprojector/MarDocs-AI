'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Reveal, CardReveal, StaggerReveal } from '@/lib/animations';

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
    <section className="relative flex flex-col items-center justify-center py-16 sm:py-24 text-center w-full overflow-hidden">
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 w-full">
          <Reveal delay={0.1}>
            <div className="mb-5 inline-flex items-center gap-2 border-l-2 border-[#7c3aed] pl-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-[#d2bbff]">
              Document intelligence, without the busywork
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#e1e3e4] leading-[1.08]">
              Read less. Understand more.
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mx-auto mb-8 max-w-2xl text-sm sm:text-base md:text-lg leading-7 text-[#ccc3d8]">
              MarDocs turns your PDFs and documents into a focused workspace for asking questions, finding evidence, and getting clear answers.
            </p>
          </Reveal>
        <Reveal delay={0.4}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center w-full sm:w-auto">
            <Button className="h-11 sm:h-14 px-6 sm:px-8 text-sm sm:text-lg w-full sm:w-auto whitespace-nowrap" asChild>
              <Link href="/dashboard">
                Get Started
                <Icon name="ArrowRight" size={16} className="ml-1.5 sm:ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" className="h-11 sm:h-14 px-6 sm:px-8 text-sm sm:text-lg w-full sm:w-auto whitespace-nowrap" asChild>
              <a href="#how-it-works">
                See how it works
                <Icon name="Play" size={16} className="ml-1.5 sm:ml-2" />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>

      <div className="relative mt-12 sm:mt-16 w-full max-w-5xl px-4 sm:px-6">
        <div className="border border-[#958da1]/25 bg-[#0c0f10] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-[#958da1]/20 px-4 py-3 text-left">
            <div className="flex min-w-0 items-center gap-3">
              <Icon name="FileText" size={18} className="flex-shrink-0 text-[#7c3aed]" />
              <span className="truncate text-sm font-medium text-[#e1e3e4]">research-notes.pdf</span>
            </div>
            <span className="hidden text-xs text-[#27c93f] sm:block">Ready to chat</span>
          </div>
          <div className="grid min-h-[280px] grid-cols-1 divide-y divide-[#958da1]/20 text-left md:grid-cols-[1.15fr_0.85fr] md:divide-x md:divide-y-0">
            <div className="space-y-4 p-5 sm:p-8">
              <div className="h-2 w-24 bg-[#958da1]/40" />
              <div className="space-y-2">
                <div className="h-2 w-full bg-[#e1e3e4]/15" />
                <div className="h-2 w-11/12 bg-[#e1e3e4]/15" />
                <div className="h-2 w-4/5 bg-[#e1e3e4]/15" />
              </div>
              <div className="space-y-2 pt-3">
                <div className="h-2 w-full bg-[#e1e3e4]/15" />
                <div className="h-2 w-5/6 bg-[#e1e3e4]/15" />
                <div className="h-2 w-3/4 bg-[#e1e3e4]/15" />
              </div>
            </div>
            <div className="flex flex-col justify-between bg-[#111415] p-5 sm:p-8">
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[#958da1]">Conversation</p>
                <div className="ml-auto max-w-[90%] bg-[#7c3aed] px-3 py-2 text-xs leading-5 text-white">
                  What are the main findings?
                </div>
                <div className="mt-3 max-w-[90%] border-l-2 border-[#7c3aed]/70 pl-3 text-xs leading-5 text-[#ccc3d8]">
                  The document identifies three findings and supports each with referenced evidence.
                </div>
              </div>
              <div className="mt-8 border-t border-[#958da1]/20 pt-3 text-xs text-[#958da1]">Sources · 3 references</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 sm:py-24 overflow-hidden scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10 sm:mb-16 text-center">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-semibold text-[#e1e3e4]">
              Everything you need to analyze documents
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#ccc3d8]">
              A focused workspace for turning source material into understanding.
            </p>
          </div>
        </Reveal>
        <StaggerReveal stagger={0.1} className="grid gap-px overflow-hidden border border-[#958da1]/20 bg-[#958da1]/20 sm:grid-cols-2">
          {features.map((feature) => (
            <CardReveal key={feature.title}>
              <div className="group flex h-full gap-4 bg-[#111415] p-6 sm:p-8 transition-colors hover:bg-[#1d2021]">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#7c3aed]/40 text-[#d2bbff]">
                  <Icon name={feature.icon} size={20} />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-[#e1e3e4]">{feature.title}</h3>
                  <p className="text-sm leading-6 text-[#ccc3d8]">{feature.description}</p>
                </div>
              </div>
            </CardReveal>
          ))}
        </StaggerReveal>
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
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#0c0f10] scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 sm:mb-16 text-center">
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-semibold text-[#e1e3e4]">
            How It Works
          </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#ccc3d8]">
            Upload a file, ask a question, and trace the answer back to its source.
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1d2021] border border-[#958da1]/20 text-[#7c3aed] shadow-lg shadow-[#7c3aed]/10">
                <Icon name={step.icon} size={24} className="sm:size-8" />
              </div>
              <h3 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-semibold text-[#e1e3e4]">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-[#ccc3d8]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-[#958da1]/20 py-8 sm:py-12 bg-[#0c0f10]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-2">
          <div className="space-y-3 sm:space-y-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-white flex-shrink-0">
                <Icon name="BrainCircuit" size={12} className="sm:size-4" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-[#e1e3e4]">MarDocs</span>
            </div>
            <p className="text-xs sm:text-sm text-[#ccc3d8]">
              AI-powered document analysis and conversation platform.
            </p>
          </div>
          <div>
            <h4 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-[#e1e3e4] uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#ccc3d8]">
              <li>
                <a href="#features" className="hover:text-[#d2bbff] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#d2bbff] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#d2bbff] transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 sm:mt-12 border-t border-[#958da1]/20 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-[#ccc3d8]">
            © 2024 MarDocs AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#111415] overflow-x-hidden">
      <nav className="border-b border-[#958da1]/20 bg-[#111415]/80 backdrop-blur-md w-full relative z-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-white flex-shrink-0">
                <Icon name="BrainCircuit" size={14} className="sm:size-4" />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-[#e1e3e4] truncate min-w-0 flex-shrink-0">MarDocs</span>
            </div>
            <div className="hidden lg:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:text-[#e1e3e4] hover:bg-[#7c3aed]/10 rounded-lg transition-all duration-200">
                Features
              </a>
              <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:text-[#e1e3e4] hover:bg-[#7c3aed]/10 rounded-lg transition-all duration-200">
                How It Works
              </a>
              <div className="mx-2 h-6 w-px bg-[#958da1]/20" />
              <Button variant="outline" className="h-9 px-5 text-sm font-medium border-[#958da1]/30 hover:border-[#7c3aed] hover:text-[#7c3aed]" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="h-9 px-5 text-sm font-medium bg-[#7c3aed] hover:bg-[#6d37d6] shadow-lg shadow-[#7c3aed]/20" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-1.5 sm:p-2 text-[#ccc3d8] hover:text-[#e1e3e4] transition-colors h-[48px] w-[48px] flex-shrink-0 rounded-lg hover:bg-[#1d2021]"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile menu - slides in from left */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 w-full max-w-[320px] min-h-screen bg-[#111415] border-r border-[#958da1]/20 z-[60] lg:hidden overflow-y-auto"
            >
              <div className="px-4 pt-4 pb-6 space-y-1">
                <div className="mb-4 px-2">
                  <p className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider">Menu</p>
                </div>
                <a
                  href="#features"
                  onClick={handleMobileMenuClick}
                  className="flex items-center justify-between px-4 py-3.5 rounded-lg bg-[#1d2021]/50 text-[#ccc3d8] hover:bg-[#7c3aed]/20 hover:text-[#d2bbff] transition-all duration-200"
                >
                  <span className="flex items-center gap-3 font-medium">
                    <Icon name="FileText" size={18} />
                    Features
                  </span>
                </a>
                <a
                  href="#how-it-works"
                  onClick={handleMobileMenuClick}
                  className="flex items-center justify-between px-4 py-3.5 rounded-lg bg-[#1d2021]/50 text-[#ccc3d8] hover:bg-[#7c3aed]/20 hover:text-[#d2bbff] transition-all duration-200"
                >
                  <span className="flex items-center gap-3 font-medium">
                    <Icon name="Play" size={18} />
                    How It Works
                  </span>
                </a>
                <div className="border-t border-[#958da1]/20 my-4" />
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 px-4 bg-[#1d2021]/50 border-[#958da1]/30 hover:border-[#7c3aed] hover:text-[#7c3aed]"
                  asChild
                >
                  <Link href="/login" onClick={handleMobileMenuClick}>Sign In</Link>
                </Button>
                <Button
                  className="w-full justify-start h-12 px-4 bg-[#7c3aed] hover:bg-[#6d37d6] shadow-lg shadow-[#7c3aed]/20"
                  asChild
                  onClick={handleMobileMenuClick}
                >
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <main className="overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;
