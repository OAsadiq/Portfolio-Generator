/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Eye, AlertCircle, Undo, Redo, Settings, Palette, Type,
  Layout, Trash2, Plus, GripVertical, X, Check,
  FileText, ChevronDown, ChevronUp, Monitor, Smartphone, Tablet, Sparkles,
  Rocket, Globe, ExternalLink, Footprints,
  User, BookOpen, MessageSquare, Mail, Upload, Edit2
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Blue', primary: '#2563eb', accent: '#0ea5e9' },
  { name: 'Purple', primary: '#7c3aed', accent: '#a855f7' },
  { name: 'Green', primary: '#059669', accent: '#10b981' },
  { name: 'Orange', primary: '#ea580c', accent: '#f97316' },
  { name: 'Pink', primary: '#db2777', accent: '#ec4899' },
  { name: 'Teal', primary: '#0d9488', accent: '#14b8a6' },
];

const INITIAL_SECTIONS = [
  { id: 'hero', name: 'Hero', visible: true, order: 0, icon: <User className="w-4 h-4" /> },
  { id: 'specialties', name: 'Specialties', visible: true, order: 1, icon: <FileText className="w-4 h-4" /> },
  { id: 'samples', name: 'Samples', visible: true, order: 2, icon: <BookOpen className="w-4 h-4" /> },
  { id: 'testimonials', name: 'Testimonials', visible: true, order: 3, icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'contact', name: 'Contact', visible: true, order: 4, icon: <Mail className="w-4 h-4" /> },
  { id: 'footer', name: 'Footer', visible: true, order: 5, icon: <Footprints className="w-4 h-4" /> },
];

const SECTION_METADATA = {
  'hero': { name: 'Hero', icon: <User className="w-4 h-4" /> },
  'specialties': { name: 'Specialties', icon: <FileText className="w-4 h-4" /> },
  'samples': { name: 'Samples', icon: <BookOpen className="w-4 h-4" /> },
  'testimonials': { name: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
  'contact': { name: 'Contact', icon: <Mail className="w-4 h-4" /> },
  'footer': { name: 'Footer', icon: <Footprints className="w-4 h-4" /> },
};

const TEMPLATE_CONFIGS: { [key: string]: any } = {
  'professional-writer-template': {
    sections: INITIAL_SECTIONS,
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
      testimonial1: 'Jane transformed our content strategy and boosted our traffic by 50%!',
      testimonial1Author: 'John Doe',
      testimonial1Role: 'CEO, TechCorp',
    }
  },
  'modern-writer-template': {
    sections: [
      { id: 'hero', name: 'Hero', visible: true, order: 0, icon: <User className="w-4 h-4" /> },
      { id: 'about', name: 'About', visible: true, order: 1, icon: <FileText className="w-4 h-4" /> },
      { id: 'skills', name: 'Skills', visible: true, order: 2, icon: <Sparkles className="w-4 h-4" /> },
      { id: 'case-studies', name: 'Case Studies', visible: true, order: 3, icon: <BookOpen className="w-4 h-4" /> },
      { id: 'blog', name: 'Blog', visible: true, order: 4, icon: <FileText className="w-4 h-4" /> },
      { id: 'contact', name: 'Contact', visible: true, order: 5, icon: <Mail className="w-4 h-4" /> },
      { id: 'footer', name: 'Footer', visible: true, order: 6, icon: <Footprints className="w-4 h-4" /> },
    ],
    fields: {
      fullName: 'Sarah Mitchell',
      tagline: 'Freelance Writer & Content Strategist',
      bio: 'Crafting compelling narratives that engage audiences and drive results. Specializing in long-form content, brand storytelling, and editorial strategy across digital platforms.',
      email: 'sarah@example.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      github: 'https://github.com',
      website: 'https://example.com',
      primaryColor: '#6366f1',
      accentColor: '#ec4899',
      
      // Skills - Now using predefined options
      skill1: 'Long-Form Content',
      skill2: 'Editorial Strategy',
      skill3: 'SEO Copywriting',
      skill4: 'Brand Storytelling',
      skill5: 'Journalism',
      skill6: 'Research & Interviews',
      
      // Case Study 1
      case1Title: 'Feature Series: The Future of Work',
      case1Client: 'TechVenture Magazine',
      case1Role: 'Contributing Writer',
      case1Description: '10-part investigative series exploring remote work transformation across industries. Featured in-depth interviews with 50+ leaders and generated 2M+ reads.',
      case1Challenge: 'Create an engaging, data-driven series on remote work that would resonate with both executives and individual contributors during a time of unprecedented workplace change.',
      case1Solution: 'Developed a multi-faceted approach combining quantitative research, expert interviews, and real-world case studies. Each article focused on a specific industry vertical with actionable insights.',
      case1Results: 'The series generated over 2 million reads, became the magazine\'s most-shared content of the year, and led to speaking invitations at three major industry conferences.',
      case1Tags: 'Journalism, Research, Interview',
      
      // Case Study 2
      case2Title: 'Complete Content Overhaul',
      case2Client: 'GreenLife Co.',
      case2Role: 'Content Strategist',
      case2Description: 'Developed comprehensive content strategy and wrote 50+ pieces that increased organic traffic by 300% and boosted conversions by 85%.',
      case2Challenge: 'The company\'s existing content was outdated, unfocused, and failing to rank in search results or convert visitors into customers.',
      case2Solution: 'Conducted comprehensive content audit, keyword research, and competitor analysis. Created new content pillars, established brand voice guidelines, and implemented SEO best practices across all new content.',
      case2Results: '300% increase in organic traffic within 6 months, 85% boost in conversion rates, and #1 Google rankings for 15 target keywords.',
      case2Tags: 'SEO, Strategy, Brand Voice',
      
      // Case Study 3
      case3Title: 'Business Leadership Book',
      case3Client: 'Harper Publishing',
      case3Role: 'Ghostwriter',
      case3Description: 'Ghostwrote 80,000-word business book for Fortune 500 executive. Project included 20+ interviews and became Wall Street Journal bestseller.',
      case3Challenge: 'Capture the authentic voice and leadership philosophy of a busy C-suite executive while creating an engaging, actionable narrative for aspiring leaders.',
      case3Solution: 'Conducted extensive interviews, reviewed internal communications and presentations, and developed a framework that balanced personal anecdotes with practical business advice.',
      case3Results: 'Published book became a Wall Street Journal bestseller within two weeks of launch, received endorsements from five industry leaders, and led to a multi-city book tour.',
      case3Tags: 'Ghostwriting, Long-form, Business',
      
      // Blog Articles
      blog1Title: 'The Future of Web Design',
      blog1Excerpt: 'Exploring emerging trends and technologies shaping how we build digital experiences in 2026.',
      blog1Date: 'Jan 15, 2026',
      blog1ReadTime: '8',
      blog1Category: 'Design',
      blog1Link: 'https://example.com/future-of-web-design',
      
      blog2Title: 'Content Strategy in the AI Era',
      blog2Excerpt: 'How artificial intelligence is transforming content creation while keeping human creativity at the center.',
      blog2Date: 'Dec 28, 2025',
      blog2ReadTime: '6',
      blog2Category: 'Strategy',
      blog2Link: 'https://example.com/content-strategy-ai',
      
      blog3Title: 'Writing for Impact: A Guide',
      blog3Excerpt: 'Practical techniques for creating content that resonates with your audience and drives meaningful action.',
      blog3Date: 'Dec 10, 2025',
      blog3ReadTime: '10',
      blog3Category: 'Writing',
      blog3Link: 'https://example.com/writing-for-impact',
    }
  },
};

const getTemplateConfig = (templateId: string) => {
  return TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS['professional-writer-template'];
};

const SKILL_OPTIONS = [
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

export default function PortfolioVisualBuilder({ onCancel }: any) {
  const { slug, templateId } = useParams();
  const isEditing = !!slug;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('design');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentSample, setCurrentSample] = useState(1);
  const [currentTestimonial, setCurrentTestimonial] = useState(1);
  const [currentCase, setCurrentCase] = useState(1);
  const [currentBlog, setCurrentBlog] = useState(1);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [caseModalOpen, setCaseModalOpen] = useState(false); 
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');
  const [portfolioSlug, setPortfolioSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templateId || 'professional-writer-template');

  const config = getTemplateConfig(selectedTemplate);

  const [sections, setSections] = useState(config.sections);
  const [formData, setFormData] = useState(config.fields);

  useEffect(() => {
    const newConfig = getTemplateConfig(selectedTemplate);
    setSections(newConfig.sections);
    setFormData(newConfig.fields);
  }, [selectedTemplate]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const [history, setHistory] = useState([formData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const newData = { ...formData, [field]: base64 };
      setFormData(newData);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error('Error converting file to base64:', error);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFormData(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFormData(history[historyIndex + 1]);
    }
  };

  const toggleSection = (id: string) => {
    setSections((prev: any[]) => prev.map(section =>
      section.id === id
        ? { ...section, visible: !section.visible }
        : section
    ));
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    newSections.forEach((s, i) => s.order = i);
    setSections(newSections);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    newSections.forEach((s, i) => s.order = i);
    setSections(newSections);
  };

  const handleDeleteSample = (num: number) => {
    const updates: any = {};
    updates[`sample${num}Title`] = '';
    updates[`sample${num}Type`] = '';
    updates[`sample${num}Description`] = '';
    updates[`sample${num}Content`] = '';
    updates[`sample${num}Link`] = '';

    const newData = { ...formData, ...updates };
    setFormData(newData);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleDeleteTestimonial = (num: number) => {
    const updates: any = {};
    updates[`testimonial${num}`] = '';
    updates[`testimonial${num}Author`] = '';
    updates[`testimonial${num}Role`] = '';

    const newData = { ...formData, ...updates };
    setFormData(newData);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleDeleteCase = (caseNum: number) => {
    const updates: any = {};
    updates[`case${caseNum}Title`] = '';
    updates[`case${caseNum}Client`] = '';
    updates[`case${caseNum}Role`] = '';
    updates[`case${caseNum}Description`] = '';
    updates[`case${caseNum}Tags`] = '';

    const newData = { ...formData, ...updates };
    setFormData(newData);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleDeleteBlog = (blogNum: number) => {
    const updates: any = {};
    updates[`blog${blogNum}Title`] = '';
    updates[`blog${blogNum}Excerpt`] = '';
    updates[`blog${blogNum}Category`] = '';
    updates[`blog${blogNum}Date`] = '';
    updates[`blog${blogNum}ReadTime`] = '';
    updates[`blog${blogNum}Link`] = '';

    const newData = { ...formData, ...updates };
    setFormData(newData);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

    const handleReorder = (reorderedSections: any[]) => {
    setSections(reorderedSections);
  };

  useEffect(() => {
    if (isEditing && slug) {
      loadPortfolioData();
    }
  }, [slug, isEditing]);

  const normalizeSections = (dbSections: any[]) => {
    if (!dbSections || dbSections.length === 0) {
      return INITIAL_SECTIONS;
    }

    return dbSections.map(section => {
      const metadata = SECTION_METADATA[section.id as keyof typeof SECTION_METADATA] || {
        name: section.id,
        icon: <FileText className="w-4 h-4" />
      };

      return {
        id: section.id,
        name: section.name || metadata.name,
        icon: metadata.icon,
        visible: section.enabled !== undefined ? section.enabled : (section.visible !== undefined ? section.visible : true),
        order: section.order !== undefined ? section.order : 0,
      };
    }).sort((a, b) => a.order - b.order);
  };

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("Please log in to edit your portfolio");
        setLoading(false);
        return;
      }

      console.log('Loading portfolio with slug:', slug, 'for user:', session.user.id);

      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('slug', slug)
        .single();

      console.log('Portfolio query result:', { portfolio, portfolioError });

      if (portfolioError) {
        if (portfolioError.code === 'PGRST116') {
          throw new Error(`Portfolio with slug "${slug}" not found. Please check the URL.`);
        }
        throw new Error('Portfolio not found: ' + portfolioError.message);
      }

      if (portfolio.user_id !== session.user.id) {
        throw new Error('You do not have permission to edit this portfolio');
      }

      setPortfolioSlug(portfolio.slug);

      if (portfolio.form_data) {
        setFormData(portfolio.form_data);
      } else {
        console.warn('No form_data found in portfolio');
      }

      if (portfolio.sections && portfolio.sections.length > 0) {
        const normalized = normalizeSections(portfolio.sections);
        console.log('Setting normalized sections:', normalized);
        setSections(normalized);
      } else {
        console.log('No sections in DB, using defaults');
        setSections(INITIAL_SECTIONS);
      }

      if (portfolio.template_id) {
        setSelectedTemplate(portfolio.template_id);
        
        const config = getTemplateConfig(portfolio.template_id);
        if (!portfolio.sections || portfolio.sections.length === 0) {
          setSections(config.sections);
        }
      }

    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError((err instanceof Error ? err.message : 'Failed to load portfolio'));
    } finally {
      setLoading(false);
    }
  };

  const convertSectionsForSave = (sections: any[]) => {
    return sections.map(section => ({
      id: section.id,
      enabled: section.visible,
      order: section.order,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("Please log in to save your portfolio");
        setSaving(false);
        return;
      }

      const shouldUpdate = isEditing || !!portfolioSlug;

      const endpoint = shouldUpdate
        ? `${import.meta.env.VITE_API_URL}/api/templates/update-portfolio`
        : `${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`;

      const sectionsForSave = convertSectionsForSave(sections);

      const body = shouldUpdate
        ? {
            slug: portfolioSlug,
            templateId: selectedTemplate, 
            formData,
            sections: sectionsForSave,
          }
        : {
            templateId: selectedTemplate, 
            formData,
            sections: sectionsForSave,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body),
      });

      if (res.status === 413) {
        throw new Error('Content is too large. Please reduce the amount of content and try again.');
      }

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'FREE_TEMPLATE_LIMIT_REACHED') {
          throw new Error("You've already used your free template. Upgrade to Pro for unlimited portfolios!");
        }
        if (data.code === 'PRO_TEMPLATE_REQUIRED') {
          throw new Error("This template requires a Pro subscription. Upgrade to unlock all templates!");
        }
        if (data.code === 'PORTFOLIO_NOT_FOUND') {
          throw new Error(`Portfolio not found. The slug "${portfolioSlug}" does not exist in the database.`);
        }
        if (data.code === 'PERMISSION_DENIED') {
          throw new Error("You do not have permission to edit this portfolio.");
        }
        throw new Error(data.error || `Failed to ${shouldUpdate ? 'update' : 'save'} portfolio`);
      }

      if (!shouldUpdate && data.portfolioSlug) {
        setPortfolioSlug(data.portfolioSlug);
        window.history.replaceState({}, '', `/builder/${data.portfolioSlug}`);
      }

      setSuccessModalOpen(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!portfolioSlug) {
      setError('Please save your portfolio first');
      return;
    }

    setDeploying(true);
    setError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vercel/deploy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId: portfolioSlug }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to deploy portfolio");
      }

      const data = await res.json();
      setDeployUrl(data.url);

      console.log('Portfolio deployed:', {
        portfolioSlug,
        deployUrl: data.url,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      console.error('Deploy error:', err);
    } finally {
      setDeploying(false);
    }
  };

  const handleCloseModal = () => {
    setSuccessModalOpen(false);
  };

  const handleLater = () => {
    setSuccessModalOpen(false);
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (isEditing) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Monitor className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-3">Desktop Required</h2>
          <p className="text-slate-400 mb-6">The Visual Portfolio Builder works best on larger screens.</p>
          <button onClick={onCancel} className="w-full bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'design', label: 'Design', icon: <Palette className="w-5 h-5" /> },
    { id: 'content', label: 'Content', icon: <Type className="w-5 h-5" /> },
    { id: 'layout', label: 'Layout', icon: <Layout className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-50 overflow-hidden">
      <div className="w-96 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Foliobase</h2>
              <p className="text-xs text-slate-400">Pro Visual Editor</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition ${activeTab === tab.id ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {tab.icon}
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'content' && (
            <ContentTab
              formData={formData}
              onChange={handleInputChange}
              onFileChange={handleFileChange}
              onOpenSampleModal={(num: React.SetStateAction<number>) => { setCurrentSample(num); setSampleModalOpen(true); }}
              onOpenTestimonialModal={(num: React.SetStateAction<number>) => { setCurrentTestimonial(num); setTestimonialModalOpen(true); }}
              onOpenCaseModal={(num: React.SetStateAction<number>) => { setCurrentCase(num); setCaseModalOpen(true); }}
              onOpenBlogModal={(num: React.SetStateAction<number>) => {setCurrentBlog(num); setBlogModalOpen(true); }}
              onDeleteSample={handleDeleteSample}
              onDeleteTestimonial={handleDeleteTestimonial}
              onDeleteCase={handleDeleteCase}
              onDeleteBlog={handleDeleteBlog}
              templateId={selectedTemplate}
            />
          )}
          {activeTab === 'layout' && (
            <LayoutTab
              sections={sections}
              onToggle={toggleSection}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              onReorder={handleReorder}
            />
          )}
          {activeTab === 'design' && <DesignTab formData={formData} onChange={handleInputChange} />}
          {activeTab === 'settings' && <SettingsTab autoSave={autoSave} onToggleAutoSave={() => setAutoSave(!autoSave)} />}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={undo} disabled={historyIndex === 0} className="p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-30 transition">
              <Undo className="w-5 h-5" />
            </button>
            <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-30 transition">
              <Redo className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-slate-700/50"></div>

            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl">
              {[
                { mode: 'desktop', icon: Monitor },
                { mode: 'tablet', icon: Tablet },
                { mode: 'mobile', icon: Smartphone }
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`p-2 rounded-lg transition ${previewMode === mode ? 'bg-yellow-400 text-slate-900' : 'hover:bg-slate-800'}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition">
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? 'Updating...' : 'Saving...'}
                </span>
              ) : (
                isEditing ? 'Update Portfolio' : 'Save Portfolio'
              )}
            </button>
          </div>

          <ErrorPopup error={error} onClose={handleCloseError} />
        </div>

        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Discard Changes?</h3>
                  <p className="text-sm text-slate-400">Your unsaved changes will be lost</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                Are you sure you want to cancel? Any unsaved changes will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 px-4 rounded-xl font-semibold transition"
                >
                  Keep Editing
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 px-4 rounded-xl font-semibold transition"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <PreviewCanvas formData={formData} previewMode={previewMode} sections={sections} templateId={selectedTemplate} />
      </div>

      <SampleModal isOpen={sampleModalOpen} currentSample={currentSample} formData={formData} onChange={handleInputChange} onClose={() => setSampleModalOpen(false)} />
      <TestimonialModal isOpen={testimonialModalOpen} currentTestimonial={currentTestimonial} formData={formData} onChange={handleInputChange} onClose={() => setTestimonialModalOpen(false)} />
      <CaseStudyModal isOpen={caseModalOpen} currentCase={currentCase} formData={formData} onChange={handleInputChange} onClose={() => setCaseModalOpen(false)} />
      <BlogModal isOpen={blogModalOpen} currentBlog={currentBlog} formData={formData} onChange={handleInputChange} onClose={() => setBlogModalOpen(false)} />
      <SuccessModal isOpen={successModalOpen} onClose={handleCloseModal} onDeploy={handleDeploy} onLater={handleLater} deploying={deploying} deployUrl={deployUrl} portfolioSlug={portfolioSlug} />
      <Styles />
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS  
// ============================================================================

function DesignTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-300 mb-3">Primary Color</label>
        <div className="flex gap-3">
          <input type="color" value={formData.primaryColor} onChange={(e) => onChange('primaryColor', e.target.value)} className="w-14 h-14 rounded-xl border-2 border-slate-700 cursor-pointer" />
          <input type="text" value={formData.primaryColor} onChange={(e) => onChange('primaryColor', e.target.value)} className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-yellow-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-300 mb-3">Accent Color</label>
        <div className="flex gap-3">
          <input type="color" value={formData.accentColor} onChange={(e) => onChange('accentColor', e.target.value)} className="w-14 h-14 rounded-xl border-2 border-slate-700 cursor-pointer" />
          <input type="text" value={formData.accentColor} onChange={(e) => onChange('accentColor', e.target.value)} className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-yellow-400" />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />Color Presets
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {COLOR_PRESETS.map(preset => (
            <button key={preset.name} onClick={() => { onChange('primaryColor', preset.primary); onChange('accentColor', preset.accent); }} className="relative p-4 rounded-xl border-2 border-slate-700 hover:border-yellow-400 transition overflow-hidden" style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }}>
              <span className="relative z-10 text-white text-xs font-bold drop-shadow-lg">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentTab({ 
  formData, 
  onChange, 
  onFileChange, 
  onOpenSampleModal, 
  onOpenTestimonialModal,
  onOpenCaseModal, 
  onOpenBlogModal, 
  onDeleteSample, 
  onDeleteTestimonial,
  onDeleteCase,
  onDeleteBlog,
  templateId 
}: any) {
  const getActualSampleCount = () => {
    let count = 0;
    for (let i = 1; i <= 100; i++) {
      if (formData[`sample${i}Title`]) {
        count = i;
      }
    }
    return count;
  };

  const [totalSamples, setTotalSamples] = useState(() => getActualSampleCount());

  useEffect(() => {
    setTotalSamples(getActualSampleCount());
  }, [formData]);

  const isModernTemplate = templateId === 'modern-writer-template';

  const addNewSample = () => {
    const newSampleNumber = totalSamples + 1;
    onOpenSampleModal(newSampleNumber);
  };

  const handleDeleteSample = (sampleNum: number) => {
    for (let i = sampleNum; i < totalSamples; i++) {
      const nextNum = i + 1;
      onChange(`sample${i}Title`, formData[`sample${nextNum}Title`] || '');
      onChange(`sample${i}Type`, formData[`sample${nextNum}Type`] || '');
      onChange(`sample${i}Description`, formData[`sample${nextNum}Description`] || '');
      onChange(`sample${i}Content`, formData[`sample${nextNum}Content`] || '');
      onChange(`sample${i}Link`, formData[`sample${nextNum}Link`] || '');
      onChange(`sample${i}Image`, formData[`sample${nextNum}Image`] || '');
    }

    onChange(`sample${totalSamples}Title`, '');
    onChange(`sample${totalSamples}Type`, '');
    onChange(`sample${totalSamples}Description`, '');
    onChange(`sample${totalSamples}Content`, '');
    onChange(`sample${totalSamples}Link`, '');
    onChange(`sample${totalSamples}Image`, '');

    if (onDeleteSample) {
      onDeleteSample(sampleNum);
    }
  };

  const getCaseStudyCount = () => {
    let count = 0;
    for (let i = 1; i <= 100; i++) {
      if (formData[`case${i}Title`]) {
        count = i;
      }
    }
    return count;
  };

  const getBlogCount = () => {
    let count = 0;
    for (let i = 1; i <= 100; i++) {
      if (formData[`blog${i}Title`]) {
        count = i;
      }
    }
    return count;
  };

  const [totalCases, setTotalCases] = useState(() => getCaseStudyCount());
  const [totalBlogs, setTotalBlogs] = useState(() => getBlogCount());

  useEffect(() => {
    setTotalCases(getCaseStudyCount());
    setTotalBlogs(getBlogCount());
  }, [formData]);

  const addNewCase = () => {
    const newCaseNumber = totalCases + 1;
    onOpenCaseModal(newCaseNumber);
  };

  const addNewBlog = () => {
    const newBlogNumber = totalBlogs + 1;
    onOpenBlogModal(newBlogNumber);
  };

  const handleDeleteCase = (caseNum: number) => {
    for (let i = caseNum; i < totalCases; i++) {
      const nextNum = i + 1;
      onChange(`case${i}Title`, formData[`case${nextNum}Title`] || '');
      onChange(`case${i}Client`, formData[`case${nextNum}Client`] || '');
      onChange(`case${i}Role`, formData[`case${nextNum}Role`] || '');
      onChange(`case${i}Description`, formData[`case${nextNum}Description`] || '');
      onChange(`case${i}Tags`, formData[`case${nextNum}Tags`] || '');
    }

    onChange(`case${totalCases}Title`, '');
    onChange(`case${totalCases}Client`, '');
    onChange(`case${totalCases}Role`, '');
    onChange(`case${totalCases}Description`, '');
    onChange(`case${totalCases}Tags`, '');

    if (onDeleteCase) {
      onDeleteCase(caseNum);
    }
  };

  const handleDeleteBlog = (blogNum: number) => {
    for (let i = blogNum; i < totalBlogs; i++) {
      const nextNum = i + 1;
      onChange(`blog${i}Title`, formData[`blog${nextNum}Title`] || '');
      onChange(`blog${i}Excerpt`, formData[`blog${nextNum}Excerpt`] || '');
      onChange(`blog${i}Category`, formData[`blog${nextNum}Category`] || '');
      onChange(`blog${i}Date`, formData[`blog${nextNum}Date`] || '');
      onChange(`blog${i}ReadTime`, formData[`blog${nextNum}ReadTime`] || '');
      onChange(`blog${i}Link`, formData[`blog${nextNum}Link`] || '');
    }

    onChange(`blog${totalBlogs}Title`, '');
    onChange(`blog${totalBlogs}Excerpt`, '');
    onChange(`blog${totalBlogs}Category`, '');
    onChange(`blog${totalBlogs}Date`, '');
    onChange(`blog${totalBlogs}ReadTime`, '');
    onChange(`blog${totalBlogs}Link`, '');

    if (onDeleteBlog) {
      onDeleteBlog(blogNum);
    }
  };

  const getSampleIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'blog post': '📝',
      'case study': '📊',
      'white paper': '📄',
      'article': '✍️',
      'email campaign': '📧',
      'social media': '📱',
      'newsletter': '📮',
      'press release': '📰',
      'ebook': '📚',
      'guide': '🗺️',
      'tutorial': '💡',
      'research': '🔬',
      'report': '📈',
      'landing page': '🎯',
      'product description': '🏷️',
      'script': '🎬',
      'technical documentation': '⚙️',
      'user manual': '📖'
    };

    return icons[type?.toLowerCase()] || '📄';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Common to both templates */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />Hero Section
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Profile Image</label>
            <div className="space-y-3">
              {formData.profileImage && (
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                  <img src={formData.profileImage} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 font-semibold">Image uploaded</p>
                    <p className="text-xs text-slate-500">Click below to change</p>
                  </div>
                  <button
                    onClick={() => onChange('profileImage', '')}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
              <label className="block">
                <div className="w-full bg-slate-900/50 border-2 border-dashed border-slate-700 hover:border-yellow-400 rounded-xl px-4 py-6 text-center cursor-pointer transition group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center group-hover:bg-yellow-400/30 transition">
                      <Upload className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">
                      {formData.profileImage ? 'Change Image' : 'Upload Profile Image'}
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileChange('profileImage', file);
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
            <input 
              type="text" 
              value={formData.fullName || ''} 
              onChange={(e) => onChange('fullName', e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
              placeholder="Your Name" 
            />
          </div>

          {/* Modern template uses "tagline", Professional uses "headline" */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              {isModernTemplate ? 'Tagline' : 'Headline'}
            </label>
            <input 
              type="text" 
              value={isModernTemplate ? (formData.tagline || '') : (formData.headline || '')} 
              onChange={(e) => onChange(isModernTemplate ? 'tagline' : 'headline', e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
              placeholder={isModernTemplate ? 'Creative Professional' : 'Your Professional Title'} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Bio</label>
            <textarea 
              value={formData.bio || ''} 
              onChange={(e) => onChange('bio', e.target.value)} 
              rows={4} 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar" 
              placeholder="Tell visitors about yourself..." 
            />
          </div>
        </div>
      </div>

      {/* Social Links - Common to both templates */}
      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4" />Social Links
        </h3>
        <div className="space-y-3">
          <input 
            type="url" 
            value={formData.linkedin || ''} 
            onChange={(e) => onChange('linkedin', e.target.value)} 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
            placeholder="LinkedIn URL" 
          />
          <input 
            type="url" 
            value={formData.twitter || ''} 
            onChange={(e) => onChange('twitter', e.target.value)} 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
            placeholder="Twitter/X URL" 
          />
          {isModernTemplate && (
            <input 
              type="url" 
              value={formData.github || ''} 
              onChange={(e) => onChange('github', e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
              placeholder="GitHub URL" 
            />
          )}
          <input 
            type="url" 
            value={formData.website || ''} 
            onChange={(e) => onChange('website', e.target.value)} 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
            placeholder="Website URL" 
          />
        </div>
      </div>

      {/* Contact - Common to both templates */}
      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4" />Contact
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={formData.email || ''} 
              onChange={(e) => onChange('email', e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
              placeholder="your@email.com" 
            />
          </div>
        </div>
      </div>

      {/* Conditional sections based on template */}
      {isModernTemplate ? (
        <>
          {/* Skills Section - Modern Template Only */}
          <div className="pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />Skills
            </h3>
            
            {/* Skill Selection Grid */}
            <div className="grid grid-cols-2 gap-3">
              {SKILL_OPTIONS.map((skill) => {
                const isSelected = [1, 2, 3, 4, 5, 6].some(num => formData[`skill${num}`] === skill.name);
                const selectedSkills = [1, 2, 3, 4, 5, 6]
                  .map(num => formData[`skill${num}`])
                  .filter(Boolean);
                const canSelect = selectedSkills.length < 6;
                
                return (
                  <button
                    key={skill.name}
                    onClick={() => {
                      if (isSelected) {
                        // Remove skill
                        const skillNum = [1, 2, 3, 4, 5, 6].find(num => formData[`skill${num}`] === skill.name);
                        if (skillNum) {
                          // Shift remaining skills down
                          for (let i = skillNum; i < 6; i++) {
                            onChange(`skill${i}`, formData[`skill${i + 1}`] || '');
                          }
                          onChange('skill6', '');
                        }
                      } else if (canSelect) {
                        // Add skill to first empty slot
                        const emptySlot = [1, 2, 3, 4, 5, 6].find(num => !formData[`skill${num}`]);
                        if (emptySlot) {
                          onChange(`skill${emptySlot}`, skill.name);
                        }
                      }
                    }}
                    disabled={!isSelected && !canSelect}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                        : canSelect
                        ? 'bg-slate-900/50 border-slate-700 hover:border-yellow-400/50'
                        : 'bg-slate-900/30 border-slate-700/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{skill.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{skill.name}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Selected Skills Count */}
            <div className="mt-3 text-xs text-slate-400 text-center">
              {[1, 2, 3, 4, 5, 6].filter(num => formData[`skill${num}`]).length} / 6 skills selected
            </div>
          </div>

          {/* Case Studies - Modern Template with Modal */}
          <div className="pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />Case Studies
                </h3>
              </div>
              <button
                onClick={addNewCase}
                className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {totalCases === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-700">
                <p className="text-slate-400 text-sm mb-3">No case studies added yet</p>
                <button
                  onClick={addNewCase}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-lg text-sm font-bold transition"
                >
                  Add Your First Case Study
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: totalCases }, (_, i) => i + 1).map((num) => {
                  const title = formData[`case${num}Title`];
                  const client = formData[`case${num}Client`];

                  if (!title) return null;

                  return (
                    <div
                      key={num}
                      className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-yellow-400/30 transition group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-200 mb-1 truncate">{title}</h4>
                          {client && (
                            <span className="inline-block px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-semibold">
                              {client}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onOpenCaseModal(num)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition"
                            title="Edit case study"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteCase(num)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                            title="Delete case study"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Blog Articles - Modern Template with Modal */}
          <div className="pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />Blog Articles
                </h3>
              </div>
              <button
                onClick={addNewBlog}
                className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {totalBlogs === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-700">
                <p className="text-slate-400 text-sm mb-3">No blog articles added yet</p>
                <button
                  onClick={addNewBlog}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-lg text-sm font-bold transition"
                >
                  Add Your First Article
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: totalBlogs }, (_, i) => i + 1).map((num) => {
                  const title = formData[`blog${num}Title`];
                  const category = formData[`blog${num}Category`];

                  if (!title) return null;

                  return (
                    <div
                      key={num}
                      className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-yellow-400/30 transition group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-200 mb-1 truncate">{title}</h4>
                          {category && (
                            <span className="inline-block px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs font-semibold">
                              {category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onOpenBlogModal(num)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition"
                            title="Edit article"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(num)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                            title="Delete article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Specialties - Professional Template Only */}
          <div className="pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />Specialties
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(num => (
                <input 
                  key={num} 
                  type="text" 
                  value={formData[`specialty${num}`] || ''} 
                  onChange={(e) => onChange(`specialty${num}`, e.target.value)} 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" 
                  placeholder={`Specialty ${num}`} 
                />
              ))}
            </div>
          </div>

          {/* Writing Samples - Professional Template Only */}
          <div className="pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />Writing Samples
                </h3>
              </div>
              <button
                onClick={addNewSample}
                className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {totalSamples === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-700">
                <p className="text-slate-400 text-sm mb-3">No samples added yet</p>
                <button
                  onClick={addNewSample}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-lg text-sm font-bold transition"
                >
                  Add Your First Sample
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: totalSamples }, (_, i) => i + 1).map((num) => {
                  const title = formData[`sample${num}Title`];
                  const type = formData[`sample${num}Type`];
                  const image = formData[`sample${num}Image`];

                  if (!title) return null;

                  return (
                    <div
                      key={num}
                      className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-yellow-400/30 transition group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="w-16 h-16 rounded-lg object-cover border-2 border-slate-600"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 border-2 border-slate-600 flex items-center justify-center text-3xl">
                              {getSampleIcon(type)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 overflow-hidden">
                              <h4 className="font-bold text-slate-200 mb-1 truncate">
                                {title}
                              </h4>
                              {type && (
                                <span className="inline-block px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-semibold">
                                  {type}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onOpenSampleModal(num)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition"
                                title="Edit sample"
                              >
                                <Edit2 className="w-4 h-4 text-slate-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteSample(num)}
                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                title="Delete sample"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {formData[`sample${num}Description`] && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                              {formData[`sample${num}Description`]}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            {formData[`sample${num}Content`] && (
                              <span className="flex items-center gap-1">
                                ✓ Has content
                              </span>
                            )}
                            {formData[`sample${num}Link`] && (
                              <span className="flex items-center gap-1">
                                🔗 Has link
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Testimonials - Professional Template Only */}
          <div className="pt-6 border-t border-slate-700/50">
            <div className="flex justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />Testimonials
              </h3>
              <button 
                onClick={() => { 
                  const slot = [1, 2, 3].find(n => !formData[`testimonial${n}`]); 
                  onOpenTestimonialModal(slot || 1); 
                }} 
                className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />Add
              </button>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(num => formData[`testimonial${num}`] ? (
                <div key={num} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-yellow-400/50 transition cursor-pointer group">
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 line-clamp-2 mb-2">&ldquo;{formData[`testimonial${num}`]}&rdquo;</p>
                      <p className="text-xs font-bold text-slate-500">{formData[`testimonial${num}Author`] || 'No author'}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenTestimonialModal(num)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition"
                        title="Edit Testimonial"
                      >
                        <Edit2 className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteTestimonial(num); }}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                        title="Delete Testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null)}
              {![1, 2, 3].some(n => formData[`testimonial${n}`]) && (
                <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No testimonials added yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LayoutTab({ sections, onToggle, onMoveUp, onMoveDown, onReorder }: any) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!sections || sections.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Section Order
        </h3>
        <div className="p-8 text-center bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-700">
          <p className="text-slate-400 mb-2">No sections available</p>
          <p className="text-xs text-slate-500">Sections will appear here once loaded</p>
        </div>
      </div>
    );
  }

  const scrollToSection = (sectionId: string) => {
    const preview = document.querySelector('iframe') || document.querySelector('[data-preview-container]');
    
    if (preview && preview instanceof HTMLIFrameElement) {
      const iframeDoc = preview.contentDocument || preview.contentWindow?.document;
      if (iframeDoc) {
        const section = iframeDoc.querySelector(`[data-section="${sectionId}"]`) || 
                       iframeDoc.querySelector(`#${sectionId}`) ||
                       iframeDoc.querySelector(`section:nth-of-type(${sections.findIndex((s: any) => s.id === sectionId) + 1})`);
        
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      const section = document.querySelector(`[data-section="${sectionId}"]`) || 
                     document.querySelector(`#${sectionId}`);
      
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newSections = [...sections];
      const [draggedSection] = newSections.splice(draggedIndex, 1);
      newSections.splice(dropIndex, 0, draggedSection);
      
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      if (onReorder) {
        onReorder(reorderedSections);
      }
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Section Order
        </h3>
        <p className="text-xs text-slate-400">Drag to reorder, click to jump to section</p>
      </div>

      <div className="space-y-2">
        {sections.map((section: any, i: number) => {
          const isVisible = section.visible !== undefined ? section.visible : true;
          const sectionName = section.name || section.id || 'Unknown Section';
          const sectionIcon = section.icon || <FileText className="w-4 h-4" />;
          const isDragging = draggedIndex === i;
          const isDragOver = dragOverIndex === i;

          return (
            <div
              key={section.id || i}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
              className={`p-4 rounded-xl border-2 transition-all cursor-move group ${
                isVisible
                  ? 'bg-slate-900/50 border-slate-700'
                  : 'bg-slate-800/30 border-slate-700/50 opacity-50'
              } ${
                isDragging ? 'opacity-40 scale-95' : ''
              } ${
                isDragOver ? 'border-yellow-400 scale-105 shadow-lg' : ''
              } hover:border-yellow-400/50 hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <GripVertical className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition cursor-grab active:cursor-grabbing" />
                
                {/* Section Info */}
                <div 
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                  onClick={() => scrollToSection(section.id)}
                  title="Click to scroll to section"
                >
                  <div className={`w-8 h-8 p-2 rounded-lg flex items-center justify-center transition ${
                    isVisible
                      ? 'bg-yellow-400/20 text-yellow-400 group-hover:bg-yellow-400/30'
                      : 'bg-slate-700/50 text-slate-600'
                  }`}>
                    {sectionIcon}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-sm block">{sectionName}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(i);
                    }}
                    disabled={i === 0}
                    className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(i);
                    }}
                    disabled={i === sections.length - 1}
                    className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(section.id);
                    }}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                    title={isVisible ? 'Hide section' : 'Show section'}
                  >
                    <Eye className={`w-4 h-4 ${
                      isVisible ? 'text-green-400' : 'text-slate-600'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300 flex items-start gap-2">
          <span>💡</span>
          <span>
            <strong>Tip:</strong> Drag sections to reorder, click section names to preview them, or use arrows for fine control.
          </span>
        </p>
      </div>
    </div>
  );
}

function SettingsTab({ autoSave, onToggleAutoSave }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Settings className="w-4 h-4" />Settings</h3>
        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Auto-save</span>
            <button onClick={onToggleAutoSave} className={`w-12 h-6 rounded-full relative transition ${autoSave ? 'bg-green-500' : 'bg-slate-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-lg transition ${autoSave ? 'right-0.5' : 'left-0.5'}`}></div>
            </button>
          </div>
          <p className="text-xs text-slate-500">{autoSave ? 'Changes saved automatically' : 'Manual save required'}</p>
        </div>
      </div>
      <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-blue-400" /></div>
          <div>
            <p className="text-sm font-bold text-blue-300 mb-1">Pro Tip</p>
            <p className="text-xs text-blue-200/80">Connect a custom domain to make your portfolio truly yours!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCanvas({ formData, previewMode, sections, templateId }: any) {
  const isMobile = previewMode === 'mobile';
  const isTablet = previewMode === 'tablet';
  const isDesktop = previewMode === 'desktop';

  const visibleSections = sections
    .filter((s: any) => s.visible)
    .sort((a: any, b: any) => a.order - b.order);

  const renderProfessionalSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <section key="hero" data-section="hero" className={`min-h-screen flex items-center justify-center text-center relative overflow-hidden ${isMobile ? 'px-4 py-8' : 'px-8 py-16'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"></div>
            <div className={`relative z-10 max-w-4xl mx-auto ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-4xl'}`}>
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={formData.fullName || 'Profile'}
                  className={`rounded-full mx-auto mb-6 object-cover border-4 shadow-xl ${isMobile ? 'w-24 h-24' : isTablet ? 'w-32 h-32' : 'w-40 h-40'}`}
                  style={{ borderColor: formData.primaryColor }}
                />
              ) : (
                <div
                  className={`rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold shadow-xl ${isMobile ? 'w-24 h-24 text-2xl' : isTablet ? 'w-32 h-32 text-4xl' : 'w-40 h-40 text-5xl'}`}
                  style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}
                >
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                </div>
              )}

              <h1 className={`font-bold mb-4 text-slate-900 leading-tight ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-6xl'}`} style={{ letterSpacing: '-0.03em' }}>
                {formData.fullName || 'Your Name'}
              </h1>
              <p className={`font-semibold mb-6 ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'}`} style={{ color: formData.primaryColor }}>
                {formData.headline || 'Your Professional Title'}
              </p>
              <p className={`text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'}`}>
                {formData.bio || 'Your bio will appear here...'}
              </p>

              {(formData.linkedin || formData.twitter || formData.website) && (
                <div className={`flex gap-4 justify-center mb-8 ${isMobile ? 'gap-2' : 'gap-4'}`}>
                  {formData.linkedin && (
                    <a href={formData.linkedin} className={`rounded-full text-slate-900 bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-slate-100 transition cursor-pointer ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  )}
                  {formData.twitter && (
                    <a href={formData.twitter} className={`rounded-full text-slate-900 bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-slate-100 transition cursor-pointer ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                  )}
                  {formData.website && (
                    <a href={formData.website} className={`rounded-full text-slate-900 bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-slate-100 transition cursor-pointer ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                      <Globe className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </a>
                  )}
                </div>
              )}

              {formData.email && (
                <a href={`mailto:${formData.email}`} className={`rounded-full text-white font-bold shadow-2xl hover:scale-105 transition inline-flex items-center no-underline gap-3 ${isMobile ? 'px-6 py-3 text-base' : isTablet ? 'px-8 py-3 text-lg' : 'px-10 py-4 text-lg'}`} style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 4L10 11L17 4M3 4H17V14H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Get In Touch
                </a>
              )}
            </div>
          </section>
        );

      case 'specialties':
        return [1, 2, 3, 4].some(n => formData[`specialty${n}`]) ? (
          <section data-section="specialties" key="specialties" className={`bg-slate-50 ${isMobile ? 'py-8' : 'py-16'}`}>
            <div className={`max-w-5xl mx-auto ${isMobile ? 'px-4' : 'px-8'}`}>
              <div className={`flex justify-center flex-wrap ${isMobile ? 'gap-2' : 'gap-4'}`}>
                {[1, 2, 3, 4].map(n => formData[`specialty${n}`] ? (
                  <div key={n} className={`bg-white rounded-full border-2 font-semibold flex items-center gap-3 hover:scale-105 transition shadow-sm ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'}`} style={{ borderColor: formData.primaryColor, color: formData.primaryColor }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2L11.5 7.5L17 8L13 12L14 17.5L9 15L4 17.5L5 12L1 8L6.5 7.5L9 2Z" /></svg>
                    {formData[`specialty${n}`]}
                  </div>
                ) : null)}
              </div>
            </div>
          </section>
        ) : null;

      case 'samples':
        return [1, 2, 3, 4].some(n => formData[`sample${n}Title`]) ? (
          <section data-section="samples" key="samples" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className={`font-black text-slate-900 mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Featured Work</h2>
                <p className={`text-slate-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>A curated selection of my best writing samples</p>
              </div>
              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {[1, 2, 3, 4].map(n => {
                  if (!formData[`sample${n}Title`]) return null;
                  return (
                    <article key={n} className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      <div className={`flex items-center justify-center text-6xl ${isMobile ? 'h-32 text-4xl' : isTablet ? 'h-40 text-5xl' : 'h-48'}`} style={{ background: `linear-gradient(135deg, ${formData.primaryColor}20, ${formData.accentColor}20)` }}>📄</div>
                      <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                        <span className={`inline-block rounded-full text-xs font-bold uppercase tracking-wide mb-3 ${isMobile ? 'px-3 py-1' : 'px-4 py-1'}`} style={{ background: `${formData.primaryColor}15`, color: formData.primaryColor }}>{formData[`sample${n}Type`] || 'Article'}</span>
                        <h3 className={`font-bold text-slate-900 mb-3 leading-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>{formData[`sample${n}Title`]}</h3>
                        <p className={`text-slate-600 leading-relaxed mb-4 ${isMobile ? 'text-sm' : 'text-sm'}`}>{formData[`sample${n}Description`] || 'Click to read more...'}</p>
                        <button className={`font-bold rounded-lg transition hover:scale-105 ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'}`} style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, color: 'white' }}>Read Sample</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;

      case 'testimonials':
        return [1, 2, 3].some(n => formData[`testimonial${n}`]) ? (
          <section key="testimonials" data-section="testimonials" className={`bg-slate-50 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className={`font-black text-slate-900 mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Client Testimonials</h2>
                <p className={`text-slate-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>What clients say about working with me</p>
              </div>
              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {[1, 2, 3].map(n => {
                  if (!formData[`testimonial${n}`]) return null;
                  const author = formData[`testimonial${n}Author`] || 'Anonymous';
                  return (
                    <div key={n} className={`bg-white border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all ${isMobile ? 'p-6' : 'p-8'}`}>
                      <div className={`text-yellow-400 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>★★★★★</div>
                      <p className={`text-slate-900 italic mb-6 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>"{formData[`testimonial${n}`]}"</p>
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full flex items-center justify-center text-white font-bold ${isMobile ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl'}`} style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}>{author.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-bold text-slate-900">{author}</p>
                          <p className="text-sm text-slate-500">{formData[`testimonial${n}Role`] || 'Client'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;

      case 'contact':
        return (
          <section key="contact" data-section="contact" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-5xl mx-auto">
              <div className={`rounded-3xl text-center text-white relative overflow-hidden ${isMobile ? 'p-8' : isTablet ? 'p-12' : 'p-16'}`} style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h2 className={`font-black mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Let's Create Something Amazing</h2>
                  <p className={`mb-8 opacity-95 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Ready to elevate your content? Let's discuss your project.</p>
                  <a href={`mailto:${formData.email}`} className={`bg-white rounded-full font-bold hover:scale-105 transition shadow-2xl inline-flex items-center gap-2 ${isMobile ? 'px-6 py-3 text-base' : isTablet ? 'px-8 py-3 text-lg' : 'px-10 py-4 text-xl'}`} style={{ color: formData.primaryColor }}>
                    Start a Conversation
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        );

      case 'footer':
        return (
          <footer key="footer" data-section="footer" className="py-8 text-center bg-slate-50">
            <p className="text-slate-500">Built with <span className="text-blue-600 font-semibold">Foliobase</span> ✨</p>
          </footer>
        );

      default:
        return null;
    }
  };

  const renderModernSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <section 
            key="hero" 
            data-section="hero" 
            className={`min-h-screen flex items-center justify-center text-center relative overflow-hidden ${isMobile ? 'px-6 py-16' : 'px-8 py-16'}`} 
            style={{ background: `linear-gradient(135deg, ${formData.primaryColor}20, ${formData.accentColor}10)` }}
          >
            <div className={`relative z-10 max-w-3xl mx-auto ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-3xl'}`}>
              {/* Avatar - Letter or Image */}
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage} 
                  alt={formData.fullName || 'Profile'} 
                  className={`rounded-full mx-auto mb-8 object-cover ${isMobile ? 'w-36 h-36' : isTablet ? 'w-40 h-40' : 'w-38 h-38'}`} 
                  style={{ 
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              ) : (
                <div 
                  className={`rounded-full mx-auto mb-8 flex items-center justify-center text-white font-black ${isMobile ? 'w-36 h-36 text-5xl' : isTablet ? 'w-40 h-40 text-6xl' : 'w-38 h-38 text-6xl'}`} 
                  style={{ 
                    background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900
                  }}
                >
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              {/* Title with Space Grotesk font */}
              <h1 
                className={`font-bold mb-4 leading-tight ${isMobile ? 'text-5xl' : isTablet ? 'text-6xl' : 'text-7xl'}`} 
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700
                }}
              >
                {formData.fullName || 'Sarah Mitchell'}
              </h1>

              {/* Tagline with Space Grotesk */}
              <p 
                className={`font-medium mb-6 ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}
                style={{ 
                  color: 'var(--text, #0f172a)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 500
                }}
              >
                {formData.tagline || 'Freelance Writer & Content Strategist'}
              </p>

              {/* Bio with Inter font */}
              <p 
                className={`text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'}`}
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.8,
                  color: 'var(--text-muted, #64748b)'
                }}
              >
                {formData.bio || 'Crafting compelling narratives that engage audiences and drive results. Specializing in long-form content, brand storytelling, and editorial strategy across digital platforms.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-4 justify-center flex-wrap mb-16">
                <a 
                  href="#contact" 
                  className={`rounded-full text-white font-semibold transition-all ${isMobile ? 'px-8 py-3 text-base' : 'px-10 py-4 text-base'}`} 
                  style={{ 
                    background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`,
                    boxShadow: `0 10px 30px ${formData.primaryColor}40`,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 15px 40px ${formData.primaryColor}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${formData.primaryColor}40`;
                  }}
                >
                  Get In Touch
                </a>
                <a 
                  href="#case-studies" 
                  className={`rounded-full bg-transparent border-2 font-semibold transition-all ${isMobile ? 'px-8 py-3 text-base' : 'px-10 py-4 text-base'}`} 
                  style={{ 
                    borderColor: 'var(--border, #e2e8f0)', 
                    color: 'var(--text, #0f172a)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = formData.primaryColor;
                    e.currentTarget.style.color = formData.primaryColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                    e.currentTarget.style.color = 'var(--text, #0f172a)';
                  }}
                >
                  View Work
                </a>
              </div>

              {/* Scroll Indicator */}
              <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
                <span style={{ fontFamily: "'Inter', sans-serif" }}>Scroll to explore</span>
                <div 
                  className="w-6 h-10 border-2 border-slate-400 rounded-xl relative"
                  style={{ animation: 'scroll 2s infinite' }}
                >
                  <div 
                    className="absolute top-2 left-1/2 w-1 h-2 bg-slate-400 rounded-full"
                    style={{
                      transform: 'translateX(-50%)',
                      animation: 'scroll-dot 2s infinite'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes scroll {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              @keyframes scroll-dot {
                0% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(12px); }
                100% { transform: translateX(-50%) translateY(0); }
              }
            `}</style>
          </section>
        );

      case 'about':
        return (
          <section 
            key="about" 
            data-section="about" 
            className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
            style={{ background: 'var(--bg-alt, #f8fafc)' }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 
                className={`font-bold mb-6 ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'}`} 
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700
                }}
              >
                About Me
              </h2>
              <p 
                className={`leading-relaxed ${isMobile ? 'text-base' : 'text-xl'}`}
                style={{
                  color: 'var(--text-muted, #64748b)',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.7
                }}
              >
                {formData.bio || 'Your bio will appear here...'}
              </p>
            </div>
          </section>
        );

      case 'skills':
        return [1, 2, 3, 4, 5, 6].some(n => formData[`skill${n}`]) ? (
          <section 
            key="skills" 
            data-section="skills" 
            className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
            style={{ background: 'var(--bg-alt, #f8fafc)' }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 
                className={`font-bold text-center mb-16 ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'}`} 
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  marginBottom: '3rem'
                }}
              >
                Skills & Expertise
              </h2>
              <div 
                className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}
                style={{ marginTop: '4rem' }}
              >
                {[
                  { num: 1, emoji: '✍️' },
                  { num: 2, emoji: '📖' },
                  { num: 3, emoji: '🎯' },
                  { num: 4, emoji: '📝' },
                  { num: 5, emoji: '📰' },
                  { num: 6, emoji: '🔍' }
                ].map(({ num, emoji }) => formData[`skill${num}`] ? (
                  <div 
                    key={num} 
                    className="bg-white border-2 rounded-2xl p-10 text-center transition-all cursor-pointer"
                    style={{ 
                      borderColor: 'var(--border, #e2e8f0)',
                      background: 'var(--bg, #ffffff)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                      e.currentTarget.style.borderColor = formData.primaryColor;
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="text-5xl mb-4">{emoji}</div>
                    <h3 
                      className="font-semibold text-xl"
                      style={{ 
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        color: 'var(--text, #0f172a)',
                        fontSize: '1.25rem'
                      }}
                    >
                      {formData[`skill${num}`]}
                    </h3>
                  </div>
                ) : null)}
              </div>
            </div>
          </section>
        ) : null;

      case 'case-studies':
        return [1, 2, 3].some(n => formData[`case${n}Title`]) ? (
          <section 
            key="case-studies" 
            data-section="case-studies" 
            className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
          >
            <div className="max-w-6xl mx-auto">
              <h2 
                className={`font-bold text-center mb-16 ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'}`} 
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  marginBottom: '3rem'
                }}
              >
                Featured Work
              </h2>
              <div 
                className={`grid gap-12 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}
                style={{ marginTop: '4rem' }}
              >
                {[
                  { num: 1, emoji: '📚' },
                  { num: 2, emoji: '🌱' },
                  { num: 3, emoji: '📖' }
                ].map(({ num, emoji }) => {
                  if (!formData[`case${num}Title`]) return null;
                  return (
                    <article 
                      key={num} 
                      className="border-2 rounded-2xl overflow-hidden transition-all"
                      style={{ 
                        borderColor: 'var(--border, #e2e8f0)',
                        background: 'var(--bg-alt, #f8fafc)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = formData.primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                      }}
                    >
                      {/* Case Image */}
                      <div 
                        className="h-64 flex items-center justify-center text-7xl relative overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${formData.primaryColor}30, ${formData.accentColor}20)` 
                        }}
                      >
                        {emoji}
                      </div>

                      {/* Case Content */}
                      <div className="p-8">
                        {/* Meta */}
                        <div className="flex gap-4 mb-4 text-sm flex-wrap">
                          <span 
                            className="font-semibold"
                            style={{ 
                              color: formData.primaryColor,
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600
                            }}
                          >
                            {formData[`case${num}Client`] || 'Client Name'}
                          </span>
                          <span 
                            style={{ 
                              color: 'var(--text-muted, #64748b)',
                              fontFamily: "'Inter', sans-serif"
                            }}
                          >
                            {formData[`case${num}Role`] || 'Role'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 
                          className="font-bold text-2xl mb-4 leading-tight"
                          style={{ 
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 700,
                            color: 'var(--text, #0f172a)',
                            fontSize: '1.5rem',
                            lineHeight: 1.3
                          }}
                        >
                          {formData[`case${num}Title`]}
                        </h3>

                        {/* Description */}
                        <p 
                          className="mb-6 leading-relaxed"
                          style={{ 
                            fontFamily: "'Inter', sans-serif",
                            lineHeight: 1.7,
                            color: 'var(--text-muted, #64748b)'
                          }}
                        >
                          {formData[`case${num}Description`] || 'Case study description goes here...'}
                        </p>

                        {/* Tags */}
                        {formData[`case${num}Tags`] && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {formData[`case${num}Tags`].split(',').map((tag: string, idx: number) => (
                              <span 
                                key={idx}
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  background: 'var(--bg, #ffffff)',
                                  border: '1px solid var(--border, #e2e8f0)',
                                  color: 'var(--text-muted, #64748b)',
                                  fontFamily: "'Inter', sans-serif",
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  padding: '0.375rem 0.875rem',
                                  borderRadius: '20px'
                                }}
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Read More Button */}
                        <button 
                          className="bg-transparent border-none font-semibold cursor-pointer transition-all"
                          style={{
                            color: formData.primaryColor,
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            padding: 0
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(5px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          Read Full Case Study →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;

      case 'blog':
        return [1, 2, 3].some(n => formData[`blog${n}Title`]) ? (
          <section 
            key="blog" 
            data-section="blog" 
            className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
            style={{ background: 'var(--bg-alt, #f8fafc)' }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 
                className={`font-bold text-center mb-16 ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'}`} 
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  marginBottom: '3rem'
                }}
              >
                Latest Articles
              </h2>
              <div 
                className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}
                style={{ marginTop: '4rem' }}
              >
                {[1, 2, 3].map(n => {
                  if (!formData[`blog${n}Title`]) return null;
                  return (
                    <article 
                      key={n} 
                      className="bg-white border-2 rounded-2xl overflow-hidden transition-all"
                      style={{ 
                        borderColor: 'var(--border, #e2e8f0)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = formData.primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                      }}
                    >
                      {/* Blog Header Image */}
                      <div 
                        className="h-40 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                        }}
                      >
                        {formData[`blog${n}Category`] && (
                          <span 
                            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ 
                              background: formData.primaryColor,
                              fontFamily: "'Inter', sans-serif"
                            }}
                          >
                            {formData[`blog${n}Category`]}
                          </span>
                        )}
                      </div>

                      {/* Blog Content */}
                      <div className="p-6">
                        {/* Meta Info */}
                        <div 
                          className="text-xs mb-2"
                          style={{
                            color: 'var(--text-muted, #64748b)',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {formData[`blog${n}Date`] || 'Recent'} • {formData[`blog${n}ReadTime`] || '5'} min read
                        </div>

                        {/* Title */}
                        <h3 
                          className="font-bold text-lg mb-2"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 700,
                            color: 'var(--text, #0f172a)'
                          }}
                        >
                          {formData[`blog${n}Title`]}
                        </h3>

                        {/* Excerpt */}
                        <p 
                          className="text-sm mb-4"
                          style={{
                            color: 'var(--text-muted, #64748b)',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {formData[`blog${n}Excerpt`] || 'Article excerpt...'}
                        </p>

                        {/* Read More Link */}
                        <a 
                          href={formData[`blog${n}Link`] || '#'} 
                          className="font-bold text-sm inline-flex items-center gap-2 transition-all"
                          style={{ 
                            color: formData.primaryColor,
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.gap = '0.75rem';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.gap = '0.5rem';
                          }}
                        >
                          Read More <span>→</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;

      case 'contact':
        return (
          <section 
            key="contact" 
            data-section="contact" 
            className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
            style={{ background: 'var(--bg-alt, #f8fafc)' }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 
                className={`font-bold text-center mb-8 ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'}`} 
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  marginBottom: '3rem'
                }}
              >
                Let's Work Together
              </h2>

              <div className="text-center max-w-2xl mx-auto">
                {/* Contact Text */}
                <p 
                  className={`mb-8 ${isMobile ? 'text-lg' : 'text-xl'}`}
                  style={{
                    color: 'var(--text-muted, #64748b)',
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.6,
                    fontSize: '1.375rem',
                    marginBottom: '2rem'
                  }}
                >
                  Have a writing project in mind? Let's bring your story to life.
                </p>

                {/* Email Link */}
                <a 
                  href={`mailto:${formData.email}`}
                  className="inline-block text-2xl font-bold mb-12 relative"
                  style={{
                    color: 'var(--text, #0f172a)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '2rem',
                    textDecoration: 'none',
                    marginBottom: '3rem',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = formData.primaryColor;
                    const after = e.currentTarget.querySelector('.email-underline');
                    if (after) (after as HTMLElement).style.width = '100%';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text, #0f172a)';
                    const after = e.currentTarget.querySelector('.email-underline');
                    if (after) (after as HTMLElement).style.width = '0';
                  }}
                >
                  {formData.email || 'sarah@example.com'}
                  <span 
                    className="email-underline"
                    style={{
                      position: 'absolute',
                      bottom: '-5px',
                      left: 0,
                      width: 0,
                      height: '3px',
                      background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`,
                      transition: 'width 0.3s'
                    }}
                  ></span>
                </a>

                {/* Social Links */}
                <div className="flex justify-center gap-6 flex-wrap mt-12">
                  {formData.linkedin && (
                    <a 
                      href={formData.linkedin}
                      className="flex items-center gap-3 px-7 py-3 bg-white border-2 rounded-full transition-all"
                      style={{
                        borderColor: 'var(--border, #e2e8f0)',
                        color: 'var(--text, #0f172a)',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = formData.primaryColor;
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.background = formData.primaryColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = 'var(--text, #0f172a)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  )}
                  
                  {formData.github && (
                    <a 
                      href={formData.github}
                      className="flex items-center gap-3 px-7 py-3 bg-white border-2 rounded-full transition-all"
                      style={{
                        borderColor: 'var(--border, #e2e8f0)',
                        color: 'var(--text, #0f172a)',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = formData.primaryColor;
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.background = formData.primaryColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = 'var(--text, #0f172a)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </a>
                  )}
                  
                  {formData.twitter && (
                    <a 
                      href={formData.twitter}
                      className="flex items-center gap-3 px-7 py-3 bg-white border-2 rounded-full transition-all"
                      style={{
                        borderColor: 'var(--border, #e2e8f0)',
                        color: 'var(--text, #0f172a)',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = formData.primaryColor;
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.background = formData.primaryColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = 'var(--text, #0f172a)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      
      case 'footer':
        return (
          <footer 
            key="footer" 
            data-section="footer" 
            className="py-12 border-t"
            style={{
              background: 'var(--bg, #ffffff)',
              borderColor: 'var(--border, #e2e8f0)',
              borderTopWidth: '2px'
            }}
          >
            <div className="container mx-auto px-8 flex justify-between items-center">
              <p 
                style={{
                  color: 'var(--text-muted, #64748b)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9375rem'
                }}
              >
                © 2026 {formData.fullName || 'Sarah Mitchell'}. Built with{' '}
                <a 
                  href="https://foliobase.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: formData.primaryColor,
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Foliobase
                </a>
              </p>
            </div>
          </footer>
        );

      default:
        return null;
    }
  };
  
  const renderSection = (sectionId: string) => {
    if (templateId === 'modern-writer-template') {
      return renderModernSection(sectionId);
    }
    return renderProfessionalSection(sectionId);
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className={`bg-white transition-all duration-500 ${isDesktop ? 'w-full max-w-7xl mx-auto' : isTablet ? 'w-[768px] mx-auto' : 'w-[375px] mx-auto'}`}>
        {visibleSections.map((section: { id: string; }) => renderSection(section.id))}
      </div>
    </div>
  );
}

function SampleModal({ isOpen, currentSample, formData, onChange, onClose, onFileChange }: any) {
  if (!isOpen) return null;

  const sampleTypes = [
    { value: "", label: "Select type...", emoji: "" },
    { value: "Blog Post", emoji: "📝" },
    { value: "Case Study", emoji: "📊" },
    { value: "White Paper", emoji: "📄" },
    { value: "Article", emoji: "✍️" },
    { value: "Email Campaign", emoji: "📧" },
    { value: "Social Media", emoji: "📱" },
    { value: "Newsletter", emoji: "📮" },
    { value: "Press Release", emoji: "📰" },
    { value: "eBook", emoji: "📚" },
    { value: "Guide", emoji: "🗺️" },
    { value: "Tutorial", emoji: "💡" },
    { value: "Research", emoji: "🔬" },
    { value: "Report", emoji: "📈" },
    { value: "Landing Page", emoji: "🎯" },
    { value: "Product Description", emoji: "🏷️" },
    { value: "Script", emoji: "🎬" },
    { value: "Technical Documentation", emoji: "⚙️" },
    { value: "User Manual", emoji: "📖" }
  ];

  const currentImage = formData[`sample${currentSample}Image`];

  const handleImageRemove = () => {
    onChange(`sample${currentSample}Image`, '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        {/* Header */}
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold">Edit Sample #{currentSample}</h3>
            <p className="text-sm text-slate-400 mt-1">Add your writing sample details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData[`sample${currentSample}Title`] || ''}
              onChange={(e) => onChange(`sample${currentSample}Title`, e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
              placeholder="e.g., How AI is Transforming Marketing"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Type
            </label>
            <select
              value={formData[`sample${currentSample}Type`] || ''}
              onChange={(e) => onChange(`sample${currentSample}Type`, e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition cursor-pointer"
            >
              {sampleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label || type.value}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              An icon will be shown based on the type (if no image is uploaded)
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Cover Image (Optional)
            </label>

            {currentImage ? (
              <div className="relative">
                <img
                  src={currentImage}
                  alt="Sample cover"
                  className="w-full h-48 object-cover rounded-xl border-2 border-slate-700"
                />
                <button
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-yellow-400 transition bg-slate-900/30">
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-sm text-slate-400">Click to upload image</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileChange && onFileChange(`sample${currentSample}Image`, e)}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-slate-500 mt-1">
              If no image is uploaded, an emoji icon will be shown based on the type
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Short Description
            </label>
            <textarea
              value={formData[`sample${currentSample}Description`] || ''}
              onChange={(e) => onChange(`sample${currentSample}Description`, e.target.value)}
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar transition"
              placeholder="A brief summary that appears on the card..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Full Content (Optional)
            </label>
            <textarea
              value={formData[`sample${currentSample}Content`] || ''}
              onChange={(e) => onChange(`sample${currentSample}Content`, e.target.value)}
              rows={6}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar transition"
              placeholder="Full article content that will appear in a modal..."
            />
            <p className="text-xs text-slate-500 mt-1">
              If provided, a "Read Sample" button will be shown
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              External Link (Optional)
            </label>
            <input
              type="url"
              value={formData[`sample${currentSample}Link`] || ''}
              onChange={(e) => onChange(`sample${currentSample}Link`, e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
              placeholder="https://example.com/your-article"
            />
            <p className="text-xs text-slate-500 mt-1">
              Link to the published article or external source
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialModal({ isOpen, currentTestimonial, formData, onChange, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div><h3 className="text-xl font-bold">Edit Testimonial #{currentTestimonial}</h3><p className="text-sm text-slate-400 mt-1">Add client feedback</p></div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-5">
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Testimonial *</label><textarea value={formData[`testimonial${currentTestimonial}`] || ''} onChange={(e) => onChange(`testimonial${currentTestimonial}`, e.target.value)} rows={5} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar" placeholder="What did the client say?" /></div>
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Name *</label><input type="text" value={formData[`testimonial${currentTestimonial}Author`] || ''} onChange={(e) => onChange(`testimonial${currentTestimonial}Author`, e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Michael Chen" /></div>
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Role/Company</label><input type="text" value={formData[`testimonial${currentTestimonial}Role`] || ''} onChange={(e) => onChange(`testimonial${currentTestimonial}Role`, e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Marketing Director, TechCorp" /></div>
          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2"><Check className="w-5 h-5" />Done</button>
            <button onClick={onClose} className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ isOpen, onClose, onDeploy, onLater, deploying, deployUrl, portfolioSlug }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full animate-slideUp">
        <div className="relative mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-slate-50">Portfolio Saved!</h2>
            <p className="text-slate-400 text-lg">What would you like to do next?</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {portfolioSlug && (
            <a
              href={`${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolioSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600/50 hover:border-blue-400 text-slate-200 rounded-xl font-bold group transition-all"
            >
              <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Preview Portfolio
            </a>
          )}

          <button
            onClick={onDeploy}
            disabled={deploying}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
          >
            {deploying ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Deploy to Vercel
              </>
            )}
          </button>

          <button
            onClick={onLater}
            className="w-full px-6 py-3 text-slate-400 hover:text-slate-200 font-semibold transition-colors"
          >
            I'll do this later
          </button>
        </div>

        {/* Deployed URL */}
        {deployUrl && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 font-semibold mb-2">✅ Successfully Deployed!</p>
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:text-green-200 break-all underline text-sm"
            >
              {deployUrl}
            </a>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              You can deploy or add a custom domain anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseStudyModal({ isOpen, currentCase, formData, onChange, onClose, onFileChange }: any) {
  if (!isOpen) return null;

  const currentImage = formData[`case${currentCase}Image`];

  const handleImageRemove = () => {
    onChange(`case${currentCase}Image`, '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        {/* Header */}
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold">Edit Case Study #{currentCase}</h3>
            <p className="text-sm text-slate-400 mt-1">Add your case study details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Cover Image (Optional)
            </label>

            {currentImage ? (
              <div className="relative">
                <img
                  src={currentImage}
                  alt="Case study cover"
                  className="w-full h-48 object-cover rounded-xl border-2 border-slate-700"
                />
                <button
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-yellow-400 transition bg-slate-900/30">
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-sm text-slate-400">Click to upload image</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onFileChange) onFileChange(`case${currentCase}Image`, file);
                  }}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-slate-500 mt-1">
              If no image is uploaded, an emoji icon will be shown
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData[`case${currentCase}Title`] || ''}
              onChange={(e) => onChange(`case${currentCase}Title`, e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
              placeholder="e.g., Feature Series: The Future of Work"
            />
          </div>

          {/* Client and Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Client <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData[`case${currentCase}Client`] || ''}
                onChange={(e) => onChange(`case${currentCase}Client`, e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                placeholder="e.g., TechVenture Magazine"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={formData[`case${currentCase}Role`] || ''}
                onChange={(e) => onChange(`case${currentCase}Role`, e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                placeholder="e.g., Contributing Writer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData[`case${currentCase}Description`] || ''}
              onChange={(e) => onChange(`case${currentCase}Description`, e.target.value)}
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar transition"
              placeholder="Brief summary that appears on the card..."
            />
          </div>

          {/* Challenge */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              🎯 Challenge (Optional)
            </label>
            <textarea
              value={formData[`case${currentCase}Challenge`] || ''}
              onChange={(e) => onChange(`case${currentCase}Challenge`, e.target.value)}
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar transition"
              placeholder="What was the main challenge or problem?"
            />
          </div>

          {/* Solution */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              💡 Solution (Optional)
            </label>
            <textarea
              value={formData[`case${currentCase}Solution`] || ''}
              onChange={(e) => onChange(`case${currentCase}Solution`, e.target.value)}
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar transition"
              placeholder="How did you approach and solve it?"
            />
          </div>

          {/* Results */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              📊 Results (Optional)
            </label>
            <textarea
              value={formData[`case${currentCase}Results`] || ''}
              onChange={(e) => onChange(`case${currentCase}Results`, e.target.value)}
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar transition"
              placeholder="What were the outcomes and impact?"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={formData[`case${currentCase}Tags`] || ''}
              onChange={(e) => onChange(`case${currentCase}Tags`, e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
              placeholder="e.g., Journalism, Research, Interview (comma separated)"
            />
            <p className="text-xs text-slate-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogModal({ isOpen, currentBlog, formData, onChange, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        {/* Header */}
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold">Edit Blog Article #{currentBlog}</h3>
            <p className="text-sm text-slate-400 mt-1">Add your blog article details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData[`blog${currentBlog}Title`] || ''}
              onChange={(e) => onChange(`blog${currentBlog}Title`, e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
              placeholder="e.g., The Future of Web Design"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData[`blog${currentBlog}Excerpt`] || ''}
              onChange={(e) => onChange(`blog${currentBlog}Excerpt`, e.target.value)}
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar transition"
              placeholder="A brief summary of the article..."
            />
          </div>

          {/* Category, Date, and Read Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData[`blog${currentBlog}Category`] || ''}
                onChange={(e) => onChange(`blog${currentBlog}Category`, e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Design"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Date
              </label>
              <input
                type="text"
                value={formData[`blog${currentBlog}Date`] || ''}
                onChange={(e) => onChange(`blog${currentBlog}Date`, e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Jan 15, 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={formData[`blog${currentBlog}ReadTime`] || ''}
                onChange={(e) => onChange(`blog${currentBlog}ReadTime`, e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                placeholder="5"
              />
            </div>
          </div>

          {/* External Link */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Article Link (Optional)
            </label>
            <input
              type="url"
              value={formData[`blog${currentBlog}Link`] || ''}
              onChange={(e) => onChange(`blog${currentBlog}Link`, e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
              placeholder="https://example.com/your-article"
            />
            <p className="text-xs text-slate-500 mt-1">
              Link to the published article
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorPopup({ error, onClose }: { error: string; onClose: () => void }) {
  if (!error) return null;

  return (
    <div className="fixed top-16 right-6 z-50 animate-slideIn">
      <div className="bg-red-500/20 border-red-500/30  rounded-xl p-4 pr-12 backdrop-blur-sm shadow-2xl max-w-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-red-500 font-semibold mb-1">Error</h3>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      
      * {
        font-family: 'Inter', -apple-system, system-ui, sans-serif;
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.3);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #facc15, #eab308);
        border-radius: 10px;
        border: 2px solid rgba(15, 23, 42, 0.3);
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #eab308, #ca8a04);
      }
      
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #facc15 rgba(15, 23, 42, 0.3);
      }
      
      input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 8px;
      }
      
      input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 4px;
        border-radius: 12px;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
      
      .animate-slideUp {
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );
}