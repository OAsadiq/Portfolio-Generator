import React from 'react';
import { User, FileText, BookOpen, MessageSquare, Mail, Sparkles, Footprints, TrendingUp, Briefcase, Building2, Image, GraduationCap } from 'lucide-react';

export const COLOR_PRESETS = [
  { name: 'Indigo', primary: '#4f46e5', accent: '#4f46e5' },
  { name: 'Ink', primary: '#0a0a0a', accent: '#0a0a0a' },
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
  { name: 'Product Design', icon: '🎨' },
  { name: 'UX Research', icon: '🔍' },
  { name: 'UI Design', icon: '🖌️' },
  { name: 'Branding', icon: '✨' },
  { name: 'Prototyping', icon: '🧩' },
  { name: 'Figma', icon: '📐' },
  { name: 'React', icon: '⚛️' },
  { name: 'TypeScript', icon: '🟦' },
  { name: 'Node.js', icon: '🟩' },
  { name: 'Python', icon: '🐍' },
  { name: 'Web Development', icon: '💻' },
  { name: 'Data Analysis', icon: '📊' },
  { name: 'Project Management', icon: '📋' },
  { name: 'Marketing Strategy', icon: '📈' },
  { name: 'Copywriting', icon: '✍️' },
  { name: 'SEO', icon: '🎯' },
  { name: 'Motion Design', icon: '🎬' },
  { name: 'Illustration', icon: '🖼️' },
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
  stats:         { name: 'Stats',       icon: React.createElement(TrendingUp, { className: 'w-4 h-4' }) },
  'trusted-by':  { name: 'Trusted By',  icon: React.createElement(Building2, { className: 'w-4 h-4' }) },
  about:         { name: 'About',       icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  services:      { name: 'Services',    icon: React.createElement(Briefcase, { className: 'w-4 h-4' }) },
  experience:    { name: 'Experience',  icon: React.createElement(Building2, { className: 'w-4 h-4' }) },
  education:     { name: 'Education',   icon: React.createElement(GraduationCap, { className: 'w-4 h-4' }) },
  specialties:   { name: 'Specialties', icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  samples:       { name: 'Samples',     icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  skills:        { name: 'Skills',      icon: React.createElement(Sparkles, { className: 'w-4 h-4' }) },
  'case-studies':{ name: 'Work',        icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  gallery:       { name: 'Gallery',     icon: React.createElement(Image, { className: 'w-4 h-4' }) },
  blog:          { name: 'Writing',     icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  testimonials:  { name: 'Testimonials',icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
  contact:       { name: 'Contact',     icon: React.createElement(Mail, { className: 'w-4 h-4' }) },
  footer:        { name: 'Footer',      icon: React.createElement(Footprints, { className: 'w-4 h-4' }) },
};


const PROFESSIONAL_SECTIONS: SectionItem[] = [
  { id: 'about',        name: 'About',        visible: true, order: 0, icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  { id: 'experience',   name: 'Experience',   visible: true, order: 1, icon: React.createElement(Building2, { className: 'w-4 h-4' }) },
  { id: 'services',     name: 'Services',     visible: true, order: 2, icon: React.createElement(Briefcase, { className: 'w-4 h-4' }) },
  { id: 'samples',      name: 'Work',         visible: true, order: 3, icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  { id: 'testimonials', name: 'Testimonials', visible: true, order: 4, icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
  { id: 'education',    name: 'Education',    visible: true, order: 5, icon: React.createElement(GraduationCap, { className: 'w-4 h-4' }) },
];

const MODERN_SECTIONS: SectionItem[] = [
  { id: 'hero',         name: 'Hero',         visible: true,  order: 0,  icon: React.createElement(User, { className: 'w-4 h-4' }) },
  { id: 'stats',        name: 'Stats',        visible: true,  order: 1,  icon: React.createElement(TrendingUp, { className: 'w-4 h-4' }) },
  { id: 'trusted-by',   name: 'Trusted By',   visible: true,  order: 2,  icon: React.createElement(Building2, { className: 'w-4 h-4' }) },
  { id: 'about',        name: 'About',        visible: true,  order: 3,  icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
  { id: 'services',     name: 'Services',     visible: true,  order: 4,  icon: React.createElement(Briefcase, { className: 'w-4 h-4' }) },
  { id: 'skills',       name: 'Skills',       visible: true,  order: 5,  icon: React.createElement(Sparkles, { className: 'w-4 h-4' }) },
  { id: 'case-studies', name: 'Work',         visible: true,  order: 6,  icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  { id: 'gallery',      name: 'Gallery',      visible: true,  order: 7,  icon: React.createElement(Image, { className: 'w-4 h-4' }) },
  { id: 'testimonials', name: 'Testimonials', visible: true,  order: 8,  icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
  { id: 'contact',      name: 'Contact',      visible: true,  order: 9,  icon: React.createElement(Mail, { className: 'w-4 h-4' }) },
  { id: 'footer',       name: 'Footer',       visible: true,  order: 10, icon: React.createElement(Footprints, { className: 'w-4 h-4' }) },
];

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  'professional-writer-template': {
    sections: PROFESSIONAL_SECTIONS,
    contentBlocks: ['hero', 'social', 'contact', 'services', 'experience', 'samples', 'testimonials', 'education'],
    fields: {
      fullName: 'Jordan Williams',
      headline: 'Product Designer & Strategist',
      layout: 'stacked',
      location: 'San Francisco, CA',
      statement: 'I design products people actually finish using — calm interfaces, clear systems, measurable results.',
      bio: 'I help teams turn complex problems into clear, intuitive products. Ten years across fintech, healthtech, and SaaS — from first sketch to shipped feature.',
      email: 'jordan@example.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      website: 'https://example.com',
      resumeUrl: 'https://example.com/resume.pdf',
      primaryColor: '#475569',
      accentColor: '#1e293b',
      availability: 'true',
      availabilityText: 'Available for work',
      service1Title: 'Product Design',
      service1Desc: 'End-to-end design — research, flows, UI, and polished handoff to engineering.',
      service2Title: 'Brand Strategy',
      service2Desc: 'Positioning, identity systems, and messaging that make a product memorable.',
      service3Title: 'Design Systems',
      service3Desc: 'Scalable component libraries and tokens that keep teams fast and consistent.',
      service4Title: 'UX Research',
      service4Desc: 'Interviews, usability testing, and synthesis that ground decisions in evidence.',
      exp1Role: 'Lead Product Designer',
      exp1Company: 'Stripe',
      exp1Period: '2022 — Present',
      exp1Description: 'Led the checkout redesign that lifted conversion 18% across three markets.',
      exp2Role: 'Senior Designer',
      exp2Company: 'Figma',
      exp2Period: '2019 — 2022',
      exp2Description: 'Built the design-token pipeline adopted by six product teams.',
      exp3Role: 'Product Designer',
      exp3Company: 'Notion',
      exp3Period: '2017 — 2019',
      exp3Description: 'Shipped the first analytics surface for the business tier.',
      sample1Title: 'Checkout Redesign',
      sample1Type: 'Product Design',
      sample1Description: 'Rebuilt the core checkout flow, cutting drop-off and lifting conversion across markets.',
      sample1Content: 'The existing checkout had a 68% mobile abandonment rate.\nWe unified the visual language, cut the flow from 7 steps to 3, and added inline validation.\nResult: 34% drop in abandonment and an 18% lift in conversion.',
      sample1Link: 'https://example.com',
      sample2Title: 'Design System — Luma',
      sample2Type: 'Design Systems',
      sample2Description: 'Built the component library and token pipeline powering every product surface.',
      testimonial1: 'Jordan shipped more polish in a month than we had managed in a year. A rare blend of designer and strategist.',
      testimonial1Author: 'Maya Chen',
      testimonial1Role: 'CPO, Flowbase',
      testimonial2: 'Thoughtful, fast, and always focused on outcomes. My first call for any product problem.',
      testimonial2Author: 'James Okafor',
      testimonial2Role: 'Founder, Stackwise',
      edu1Title: 'B.F.A. Graphic Design',
      edu1School: 'Rhode Island School of Design',
      edu1Year: '2014',
      edu2Title: 'UX Certification',
      edu2School: 'Nielsen Norman Group',
      edu2Year: '2019',
    },
  },
  'modern-writer-template': {
    sections: MODERN_SECTIONS,
    contentBlocks: ['hero', 'social', 'contact', 'stats', 'trusted-by', 'services', 'skills', 'case-studies', 'gallery', 'testimonials'],
    fields: {
      fullName: 'Alex Rivera',
      tagline: 'Product Designer & Developer',
      bio: 'I design and build digital products at the intersection of craft and engineering. I care about clean systems, clear writing, and details that make things feel effortless.',
      email: 'alex@example.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      github: 'https://github.com',
      website: '',
      primaryColor: '#4f46e5',
      accentColor: '#4f46e5',
      availability: 'true',
      availabilityText: 'Available for work',
      resumeUrl: '',
      stat1Value: '8yrs',
      stat1Label: 'Experience',
      stat2Value: '120+',
      stat2Label: 'Projects shipped',
      stat3Value: '30',
      stat3Label: 'Happy clients',
      clients: 'Stripe, Figma, Linear, Vercel, Notion',
      service1Title: 'Product Design',
      service1Desc: 'End-to-end design — from research and wireframes to polished, shippable interfaces.',
      service2Title: 'Development',
      service2Desc: 'Production React & TypeScript with clean, maintainable systems.',
      service3Title: 'Consulting',
      service3Desc: 'Design audits, strategy, and hands-on help to level up your product.',
      skill1: 'Product Design',
      skill2: 'UX Research',
      skill3: 'Figma',
      skill4: 'React',
      skill5: 'TypeScript',
      case1Title: 'Checkout Redesign',
      case1Client: 'Stripe',
      case1Role: 'Lead Designer',
      case1Description: 'Rebuilt the core checkout flow, cutting drop-off and lifting conversion across three markets.',
      case1Challenge: 'The existing checkout had a 68% mobile abandonment rate and felt disconnected from the rest of the product.',
      case1Solution: 'Unified the visual language, reduced the flow from 7 steps to 3, and added inline validation.',
      case1Results: '34% drop in abandonment and an 18% lift in conversion within the first quarter.',
      case1Tags: 'Product Design, UX',
      case2Title: 'Design System',
      case2Client: 'Luma',
      case2Role: 'Designer & Engineer',
      case2Description: 'Built the component library and token pipeline powering every product surface.',
      case2Tags: 'Design Systems, React',
      testimonial1: 'Alex shipped more polish in a month than we\'d managed in a year. The redesign paid for itself almost immediately.',
      testimonial1Author: 'Maya Chen',
      testimonial1Role: 'CPO, Flowbase',
      testimonial2: 'Rare blend of designer and engineer. Fast, thoughtful, and always ships what they promise.',
      testimonial2Author: 'James Okafor',
      testimonial2Role: 'Founder, Stackwise',
    },
  },
};

/** Falls back to professional template if the given ID is not registered. */
export const getTemplateConfig = (templateId: string): TemplateConfig =>
  TEMPLATE_CONFIGS[templateId] ?? TEMPLATE_CONFIGS['professional-writer-template'];
