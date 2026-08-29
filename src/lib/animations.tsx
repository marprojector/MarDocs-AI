'use client';

import React, { useRef, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export const Reveal = ({ children, className, delay = 0, yOffset = 20 }: RevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerRevealProps {
  children: ReactNode[];
  className?: string;
  stagger?: number;
  yOffset?: number;
}

export const StaggerReveal = ({ children, className, stagger = 0.1, yOffset = 20 }: StaggerRevealProps) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <Reveal key={index} delay={index * stagger} yOffset={yOffset}>
          {child}
        </Reveal>
      ))}
    </div>
  );
};

interface CardRevealProps {
  children: ReactNode;
  className?: string;
}

export const CardReveal = ({ children, className }: CardRevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ButtonReveal = ({ children }: { children: ReactNode }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative overflow-hidden"
    >
      {children}
    </motion.button>
  );
};
