/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Eye, AlertCircle, Undo, Redo, Settings, Palette, Type,
  Layout, Trash2, Plus, GripVertical, X, Check, Link,
  FileText, ChevronDown, ChevronUp, Monitor, Smartphone, Tablet, Sparkles,
  Rocket, Globe, ExternalLink, Footprints,
  User,
  BookOpen,
  MessageSquare,
  Mail
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


export default function PortfolioVisualBuilder({ onCancel }: any) {
  const { slug } = useParams();
  const isEditing = !!slug;
  const navigate = useNavigate();
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [activeTab, setActiveTab] = useState('design');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentSample, setCurrentSample] = useState(1);
  const [currentTestimonial, setCurrentTestimonial] = useState(1);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
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

  const [formData, setFormData] = useState({
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
    sample1Title: 'How AI is Transforming B2B Marketing',
    sample1Type: 'Blog Post',
    sample1Description: 'A comprehensive deep dive into AI applications.',
    testimonial1: 'Jane delivered exceptional content that exceeded expectations.',
    testimonial1Author: 'Michael Chen',
    testimonial1Role: 'Marketing Director, TechCorp',
  });

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
    setSections(prev => prev.map(section => 
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

      console.log('Portfolio loaded successfully');

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

      const endpoint = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/templates/update-portfolio`
        : `${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`;

      const sectionsForSave = convertSectionsForSave(sections);

      const body = {
        slug: portfolioSlug,
        templateId: 'professional-writer-template',
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
      console.log('Response from API:', data);

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
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'save'} portfolio`);
      }
      
      if (!isEditing && data.portfolioSlug) {
        setPortfolioSlug(data.portfolioSlug);
      }
      
      setSuccessModalOpen(true);
      
      console.log(`Portfolio ${isEditing ? 'Updated' : 'Created'}:`, {
        formData,
        sections,
        portfolioSlug: portfolioSlug || data.portfolioSlug,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Save error:', err);
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
      {/* Left Sidebar */}
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
                className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition ${
                  activeTab === tab.id ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:text-slate-200'
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
              onDeleteSample={handleDeleteSample}
              onDeleteTestimonial={handleDeleteTestimonial}
            />
          )}
          {activeTab === 'layout' && (
            <LayoutTab 
              sections={sections} 
              onToggle={toggleSection} 
              onMoveUp={moveSectionUp} 
              onMoveDown={moveSectionDown} 
            />
          )}
          {activeTab === 'design' && <DesignTab formData={formData} onChange={handleInputChange} />}
          {activeTab === 'settings' && <SettingsTab autoSave={autoSave} onToggleAutoSave={() => setAutoSave(!autoSave)} />}
        </div>
      </div>

      {/* Main Canvas */}
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

        <PreviewCanvas formData={formData} previewMode={previewMode} sections={sections}/>
      </div>

      <SampleModal isOpen={sampleModalOpen} currentSample={currentSample} formData={formData} onChange={handleInputChange} onClose={() => setSampleModalOpen(false)} />
      <TestimonialModal isOpen={testimonialModalOpen} currentTestimonial={currentTestimonial} formData={formData} onChange={handleInputChange} onClose={() => setTestimonialModalOpen(false)} />
      <SuccessModal isOpen={successModalOpen} onClose={handleCloseModal} onDeploy={handleDeploy} onLater={handleLater} deploying={deploying} deployUrl={deployUrl} portfolioSlug={portfolioSlug}/>          
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

function ContentTab({ formData, onChange, onFileChange, onOpenSampleModal, onOpenTestimonialModal, onDeleteSample, onDeleteTestimonial }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Layout className="w-4 h-4" />Hero Section</h3>
        <div className="space-y-4">
          {/* Profile Image Input */}
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
                      <Plus className="w-6 h-6 text-yellow-400" />
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
            <input type="text" value={formData.fullName} onChange={(e) => onChange('fullName', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Your Name" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Headline</label>
            <input type="text" value={formData.headline} onChange={(e) => onChange('headline', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Your Professional Title" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Bio</label>
            <textarea value={formData.bio} onChange={(e) => onChange('bio', e.target.value)} rows={4} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar" placeholder="Tell visitors about yourself..." />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Globe className="w-4 h-4" />Social Links</h3>
        <div className="space-y-3">
          <input type="url" value={formData.linkedin || ''} onChange={(e) => onChange('linkedin', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="LinkedIn URL" />
          <input type="url" value={formData.twitter || ''} onChange={(e) => onChange('twitter', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Twitter/X URL" />
          <input type="url" value={formData.website || ''} onChange={(e) => onChange('website', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Other Links" />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Link className="w-4 h-4" />Contact</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => onChange('email', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="your@email.com" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" />Specialties</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(num => (
            <input key={num} type="text" value={formData[`specialty${num}`] || ''} onChange={(e) => onChange(`specialty${num}`, e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder={`Specialty ${num}`} />
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><FileText className="w-4 h-4" />Writing Samples</h3>
          <button onClick={() => { const slot = [1,2,3,4].find(n => !formData[`sample${n}Title`]); onOpenSampleModal(slot || 1); }} className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add</button>
        </div>
        <div className="space-y-2">
          {[1,2,3,4].map(num => formData[`sample${num}Title`] ? (
            <div key={num} onClick={() => onOpenSampleModal(num)} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-yellow-400/50 transition cursor-pointer group">
              <div className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate group-hover:text-yellow-400">{formData[`sample${num}Title`]}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">{formData[`sample${num}Type`] || 'No type'}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDeleteSample(num); }} className="p-2 h-fit hover:bg-red-500/20 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ) : null)}
          {![1,2,3,4].some(n => formData[`sample${n}Title`]) && (
            <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No samples added yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><Type className="w-4 h-4" />Testimonials</h3>
          <button onClick={() => { const slot = [1,2,3].find(n => !formData[`testimonial${n}`]); onOpenTestimonialModal(slot || 1); }} className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add</button>
        </div>
        <div className="space-y-2">
          {[1,2,3].map(num => formData[`testimonial${num}`] ? (
            <div key={num} onClick={() => onOpenTestimonialModal(num)} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-yellow-400/50 transition cursor-pointer group">
              <div className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 line-clamp-2 mb-2">&ldquo;{formData[`testimonial${num}`]}&rdquo;</p>
                  <p className="text-xs font-bold text-slate-500">{formData[`testimonial${num}Author`] || 'No author'}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDeleteTestimonial(num); }} className="p-2 h-fit hover:bg-red-500/20 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ) : null)}
          {![1,2,3].some(n => formData[`testimonial${n}`]) && (
            <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
              <Type className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No testimonials added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LayoutTab({ sections, onToggle, onMoveUp, onMoveDown }: any) {
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

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
        <Layout className="w-4 h-4" />
        Section Order
      </h3>
      <p className="text-xs text-slate-400 mb-4">Reorder sections or toggle visibility</p>
      <div className="space-y-2">
        {sections.map((section: any, i: number) => {
          const isVisible = section.visible !== undefined ? section.visible : true;
          const sectionName = section.name || section.id || 'Unknown Section';
          const sectionIcon = section.icon || <FileText className="w-4 h-4" />;

          return (
            <div 
              key={section.id || i} 
              className={`p-4 rounded-xl border-2 transition ${
                isVisible 
                  ? 'bg-slate-900/50 border-slate-700' 
                  : 'bg-slate-800/30 border-slate-700/50 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-slate-500 cursor-grab" />
                <div className="flex-1 flex items-center gap-3">
                  <div className={`w-8 h-8 p-2 rounded-lg flex items-center justify-center ${
                    isVisible 
                      ? 'bg-yellow-400/20 text-yellow-400' 
                      : 'bg-slate-700/50 text-slate-600'
                  }`}>
                    {sectionIcon}
                  </div>
                  <span className="font-bold text-sm">{sectionName}</span>
                </div>
                <button 
                  onClick={() => onMoveUp(i)} 
                  disabled={i === 0} 
                  className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onMoveDown(i)} 
                  disabled={i === sections.length - 1} 
                  className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onToggle(section.id)} 
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <Eye className={`w-4 h-4 ${
                    isVisible ? 'text-green-400' : 'text-slate-600'
                  }`} />
                </button>
              </div>
            </div>
          );
        })}
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

function PreviewCanvas({ formData, previewMode, sections }: any) {
  const isMobile = previewMode === 'mobile';
  const isTablet = previewMode === 'tablet';
  const isDesktop = previewMode === 'desktop';

  const visibleSections = sections
    .filter((s: any) => s.visible)
    .sort((a: any, b: any) => a.order - b.order);

  const renderSection = (sectionId: string) => {
    switch(sectionId) {
      case 'hero':
        return (
          <section key="hero" className={`min-h-screen flex items-center justify-center text-center relative overflow-hidden ${isMobile ? 'px-4 py-8' : 'px-8 py-16'}`}>
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
                    <a 
                      href={formData.linkedin} 
                      className={`rounded-full text-slate-900 bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-slate-100 transition cursor-pointer ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  {formData.twitter && (
                    <a
                      href={formData.twitter}  
                      className={`rounded-full text-slate-900 bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-slate-100 transition cursor-pointer ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {formData.website && (
                    <a 
                      href={formData.website}
                      className={`rounded-full text-slate-900 bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-slate-100 transition cursor-pointer ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                    >
                      <Globe className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </a>
                  )}
                </div>
              )}

              {formData.email && (
                <a 
                  href={`mailto:${formData.email}`}
                  className={`rounded-full text-white font-bold shadow-2xl hover:scale-105 transition inline-flex items-center no-underline gap-3 ${isMobile ? 'px-6 py-3 text-base' : isTablet ? 'px-8 py-3 text-lg' : 'px-10 py-4 text-lg'}`}
                  style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 4L10 11L17 4M3 4H17V14H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Get In Touch
                </a>
              )}
            </div>
          </section>
        );

      case 'specialties':
        return [1,2,3,4].some(n => formData[`specialty${n}`]) ? (
          <section key="specialties" className={`bg-slate-50 ${isMobile ? 'py-8' : 'py-16'}`}>
            <div className={`max-w-5xl mx-auto ${isMobile ? 'px-4' : 'px-8'}`}>
              <div className={`flex justify-center flex-wrap ${isMobile ? 'gap-2' : 'gap-4'}`}>
                {[1,2,3,4].map(n => formData[`specialty${n}`] ? (
                  <div 
                    key={n} 
                    className={`bg-white rounded-full border-2 font-semibold flex items-center gap-3 hover:scale-105 transition shadow-sm ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'}`}
                    style={{ borderColor: formData.primaryColor, color: formData.primaryColor }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2L11.5 7.5L17 8L13 12L14 17.5L9 15L4 17.5L5 12L1 8L6.5 7.5L9 2Z"/>
                    </svg>
                    {formData[`specialty${n}`]}
                  </div>
                ) : null)}
              </div>
            </div>
          </section>
        ) : null;

      case 'samples':
        return [1,2,3,4].some(n => formData[`sample${n}Title`]) ? (
          <section key="samples" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className={`font-black text-slate-900 mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Featured Work</h2>
                <p className={`text-slate-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>A curated selection of my best writing samples</p>
              </div>
              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {[1,2,3,4].map(n => {
                  if (!formData[`sample${n}Title`]) return null;
                  return (
                    <article key={n} className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      <div 
                        className={`flex items-center justify-center text-6xl ${isMobile ? 'h-32 text-4xl' : isTablet ? 'h-40 text-5xl' : 'h-48'}`}
                        style={{ background: `linear-gradient(135deg, ${formData.primaryColor}20, ${formData.accentColor}20)` }}
                      >
                        📄
                      </div>
                      <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                        <span 
                          className={`inline-block rounded-full text-xs font-bold uppercase tracking-wide mb-3 ${isMobile ? 'px-3 py-1' : 'px-4 py-1'}`}
                          style={{ background: `${formData.primaryColor}15`, color: formData.primaryColor }}
                        >
                          {formData[`sample${n}Type`] || 'Article'}
                        </span>
                        <h3 className={`font-bold text-slate-900 mb-3 leading-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>
                          {formData[`sample${n}Title`]}
                        </h3>
                        <p className={`text-slate-600 leading-relaxed mb-4 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {formData[`sample${n}Description`] || 'Click to read more...'}
                        </p>
                        <button 
                          className={`font-bold rounded-lg transition hover:scale-105 ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'}`}
                          style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`, color: 'white' }}
                        >
                          Read Sample
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;

      case 'testimonials':
        return [1,2,3].some(n => formData[`testimonial${n}`]) ? (
          <section key="testimonials" className={`bg-slate-50 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className={`font-black text-slate-900 mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Client Testimonials</h2>
                <p className={`text-slate-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>What clients say about working with me</p>
              </div>
              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {[1,2,3].map(n => {
                  if (!formData[`testimonial${n}`]) return null;
                  const author = formData[`testimonial${n}Author`] || 'Anonymous';
                  return (
                    <div key={n} className={`bg-white border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all ${isMobile ? 'p-6' : 'p-8'}`}>
                      <div className={`text-yellow-400 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>★★★★★</div>
                      <p className={`text-slate-900 italic mb-6 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                        "{formData[`testimonial${n}`]}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div 
                          className={`rounded-full flex items-center justify-center text-white font-bold ${isMobile ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl'}`}
                          style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}
                        >
                          {author.charAt(0).toUpperCase()}
                        </div>
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
          <section key="contact" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-5xl mx-auto">
              <div 
                className={`rounded-3xl text-center text-white relative overflow-hidden ${isMobile ? 'p-8' : isTablet ? 'p-12' : 'p-16'}`}
                style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h2 className={`font-black mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Let's Create Something Amazing</h2>
                  <p className={`mb-8 opacity-95 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Ready to elevate your content? Let's discuss your project.</p>
                  <a 
                    href={`mailto:${formData.email}`}
                    className={`bg-white rounded-full font-bold hover:scale-105 transition shadow-2xl inline-flex items-center gap-2 ${isMobile ? 'px-6 py-3 text-base' : isTablet ? 'px-8 py-3 text-lg' : 'px-10 py-4 text-xl'}`}
                    style={{ color: formData.primaryColor }}
                  >
                    Start a Conversation
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        );

      case 'footer':
        return (
          <footer className="py-12 text-center bg-slate-50">
            <p className="text-slate-500">Built with <span className="text-blue-600 font-semibold">Foliobase</span> ✨</p>
          </footer>
        )

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className={`bg-white transition-all duration-500 ${isDesktop ? 'w-full max-w-7xl mx-auto' : isTablet ? 'w-[768px] mx-auto' : 'w-[375px] mx-auto'}`}>
        
        {/* Render sections in order set by Layout Tab */}
        {visibleSections.map((section: { id: string; }) => renderSection(section.id))}
      </div>
    </div>
  );
}

function SampleModal({ isOpen, currentSample, formData, onChange, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div><h3 className="text-xl font-bold">Edit Sample #{currentSample}</h3><p className="text-sm text-slate-400 mt-1">Add content or link</p></div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-5">
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Title *</label><input type="text" value={formData[`sample${currentSample}Title`] || ''} onChange={(e) => onChange(`sample${currentSample}Title`, e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="e.g., How AI is Transforming Marketing" /></div>
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Type</label><input type="text" value={formData[`sample${currentSample}Type`] || ''} onChange={(e) => onChange(`sample${currentSample}Type`, e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Blog Post, Case Study..." /></div>
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Description</label><textarea value={formData[`sample${currentSample}Description`] || ''} onChange={(e) => onChange(`sample${currentSample}Description`, e.target.value)} rows={3} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar" placeholder="Brief summary..." /></div>
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Content</label><textarea value={formData[`sample${currentSample}Content`] || ''} onChange={(e) => onChange(`sample${currentSample}Content`, e.target.value)} rows={6} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 custom-scrollbar" placeholder="Full content..." /></div>
          <div><label className="block text-sm font-bold text-slate-300 mb-2">Link</label><input type="url" value={formData[`sample${currentSample}Link`] || ''} onChange={(e) => onChange(`sample${currentSample}Link`, e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="https://..." /></div>
          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2"><Check className="w-5 h-5" />Done</button>
            <button onClick={onClose} className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold">Cancel</button>
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