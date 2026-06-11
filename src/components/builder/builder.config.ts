import React from 'react';
import { User, FileText, BookOpen, MessageSquare, Mail, Sparkles, Footprints } from 'lucide-react';

export const COLOR_PRESETS = [
  { name: 'Ocean', primary: '#0ea5e9', accent: '#06b6d4' },
  { name: 'Purple', primary: '#a855f7', accent: '#ec4899' },
  { name: 'Sunset', primary: '#f97316', accent: '#ef4444' },
  { name: 'Forest', primary: '#10b981', accent: '#14b8a6' },
  { name: 'Royal', primary: '#6366f1', accent: '#8b5cf6' },
  { name: 'Rose', primary: '#f43f5e', accent: '#ec4899' },
  { name: 'Cyber', primary: '#06b6d4', accent: '#8b5cf6' },
  { name: 'Mint', primary: '#14b8a6', accent: '#10b981' },
  { name: 'Peach', primary: '#fb923c', accent: '#f97316' },
];

export const SKILL_OPTIONS = [
  { name: 'Long-Form Content', icon: '✍️' },
  { name: 'Editorial Strategy', icon: '📖' },
  { name: 'SEO Copywriting', icon: '🎯' },
  { name: 'Brand Storytelling', icon: '📝' },
  { name: 'Journalism', icon: '📰' },
  { name: 'Research & Interviews', icon: '🔍' },
  { name: 'Technical Writing', icon: '⚙️' },
  { name: 'Content Strategy', icon: '📊' },
  { name: 'Social Media Content', icon: '📱' },
  { name: 'Email Marketing', icon: '📧' },
  { name: 'Creative Writing', icon: '🎨' },
  { name: 'Copyediting', icon: '✏️' },
  { name: 'Blog Writing', icon: '💭' },
  { name: 'White Papers', icon: '📄' },
  { name: 'Case Studies', icon: '📚' },
];

export type SectionItem = {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  icon: React.ReactNode;
};

export type TemplateConfig = {
  sections: SectionItem[];
  fields: Record<string, string>;
  /** Which content blocks ContentTab renders. Add a block ID here to make it appear for this template. */
  contentBlocks: string[];
};

export const SECTION_METADATA: Record<string, { name: string; icon: React.ReactNode }> = {
  hero:          { name: 'Hero',        icon: React.createElement(User, { className: 'w-4 h-4' }) },
  about:         { name: 'About',       icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  specialties:   { name: 'Specialties', icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  samples:       { name: 'Samples',     icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  skills:        { name: 'Skills',      icon: React.createElement(Sparkles, { className: 'w-4 h-4' }) },
  'case-studies':{ name: 'Case Studies',icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  blog:          { name: 'Blog',        icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  testimonials:  { name: 'Testimonials',icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
  contact:       { name: 'Contact',     icon: React.createElement(Mail, { className: 'w-4 h-4' }) },
  footer:        { name: 'Footer',      icon: React.createElement(Footprints, { className: 'w-4 h-4' }) },
};

const PROFESSIONAL_SECTIONS: SectionItem[] = [
  { id: 'hero',         name: 'Hero',         visible: true, order: 0, icon: React.createElement(User, { className: 'w-4 h-4' }) },
  { id: 'specialties',  name: 'Specialties',  visible: true, order: 1, icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  { id: 'samples',      name: 'Samples',      visible: true, order: 2, icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  { id: 'testimonials', name: 'Testimonials', visible: true, order: 3, icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
  { id: 'contact',      name: 'Contact',      visible: true, order: 4, icon: React.createElement(Mail, { className: 'w-4 h-4' }) },
  { id: 'footer',       name: 'Footer',       visible: true, order: 5, icon: React.createElement(Footprints, { className: 'w-4 h-4' }) },
];

const MODERN_SECTIONS: SectionItem[] = [
  { id: 'hero',         name: 'Hero',         visible: true, order: 0, icon: React.createElement(User, { className: 'w-4 h-4' }) },
  { id: 'about',        name: 'About',        visible: true, order: 1, icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  { id: 'skills',       name: 'Skills',       visible: true, order: 2, icon: React.createElement(Sparkles, { className: 'w-4 h-4' }) },
  { id: 'case-studies', name: 'Case Studies', visible: true, order: 3, icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  { id: 'blog',         name: 'Blog',         visible: true, order: 4, icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  { id: 'contact',      name: 'Contact',      visible: true, order: 5, icon: React.createElement(Mail, { className: 'w-4 h-4' }) },
  { id: 'footer',       name: 'Footer',       visible: true, order: 6, icon: React.createElement(Footprints, { className: 'w-4 h-4' }) },
];

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  'professional-writer-template': {
    sections: PROFESSIONAL_SECTIONS,
    contentBlocks: ['hero', 'social', 'contact', 'specialties', 'samples', 'testimonials'],
    fields: {
      fullName: 'Jane Smith',
      headline: 'B2B Content Writer | SaaS Specialist',
      bio: 'Helping tech companies tell their stories through strategic content.',
      email: 'jane@example.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      website: 'https://example.com',
      primaryColor: '#2563eb',
      accentColor: '#0ea5e9',
      specialty1: 'SEO Blog Posts',
      specialty2: 'Email Campaigns',
      specialty3: 'Case Studies',
      specialty4: 'White Papers',
      sample1Title: 'Boosting SaaS Conversions with Targeted Content',
      sample1Type: 'Case Study',
      sample1Description: 'A deep dive into how tailored content strategies increased conversions for a leading SaaS provider.',
      sample1Content: 'In this case study, we explore the challenges faced by SaaS companies in converting leads into customers.',
      sample1Link: 'https://example.com/case-study-saas-conversions',
      testimonial1: 'Jane transformed our content strategy and boosted our traffic by 50%!',
      testimonial1Author: 'John Doe',
      testimonial1Role: 'CEO, TechCorp',
    },
  },
  'modern-writer-template': {
    sections: MODERN_SECTIONS,
    contentBlocks: ['hero', 'social', 'contact', 'skills', 'case-studies', 'blog'],
    fields: {
      fullName: 'Sarah Mitchell',
      tagline: 'Freelance Writer & Content Strategist',
      bio: 'Crafting compelling narratives that engage audiences and drive results. Specializing in long-form content, brand storytelling, and editorial strategy across digital platforms.',
      email: 'sarah@example.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      github: 'https://github.com',
      website: ' ',
      primaryColor: '#6366f1',
      accentColor: '#ec4899',
      skill1: 'Long-Form Content',
      skill2: 'Editorial Strategy',
      skill3: 'SEO Copywriting',
      skill4: 'Brand Storytelling',
      case1Title: 'Feature Series: The Future of Work',
      case1Client: 'TechVenture Magazine',
      case1Role: 'Contributing Writer',
      case1Description: '10-part investigative series exploring remote work transformation across industries. Featured in-depth interviews with 50+ leaders and generated 2M+ reads.',
      case1Challenge: 'Create an engaging, data-driven series on remote work that would resonate with both executives and individual contributors.',
      case1Solution: 'Developed a multi-faceted approach combining quantitative research, expert interviews, and real-world case studies.',
      case1Results: 'The series generated over 2 million reads, became the magazine\'s most-shared content of the year.',
      case1Tags: 'Journalism, Research, Interview',
      blog1Title: 'The Future of Web Design',
      blog1Excerpt: 'Exploring emerging trends and technologies shaping how we build digital experiences in 2026.',
      blog1Date: 'Jan 15, 2026',
      blog1ReadTime: '8',
      blog1Category: 'Design',
      blog1Link: 'https://example.com/future-of-web-design',
    },
  },
};

/** Falls back to professional template if the given ID is not registered. */
export const getTemplateConfig = (templateId: string): TemplateConfig =>
  TEMPLATE_CONFIGS[templateId] ?? TEMPLATE_CONFIGS['professional-writer-template'];
