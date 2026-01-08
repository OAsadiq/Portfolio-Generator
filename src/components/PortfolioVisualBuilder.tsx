/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Eye, Save, Undo, Redo, Settings, Palette, Type,
  Layout, Trash2, Plus, GripVertical, X, Check, Link,
  FileText, ChevronDown, ChevronUp, Monitor, Smartphone, Tablet, Sparkles,
  Rocket, Globe, ExternalLink
} from 'lucide-react';

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  section?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
}

interface Props {
  template: Template;
  onSave: (formData: any) => void;
  onCancel: () => void;
}

interface Section {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  icon: React.ReactNode;
}

export default function PortfolioVisualBuilder({ onSave, onCancel }: Props) {
  const [sections, setSections] = useState<Section[]>([
    { id: 'hero', name: 'Hero Section', visible: true, order: 0, icon: <Layout className="w-4 h-4" /> },
    { id: 'specialties', name: 'Specialties', visible: true, order: 1, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'samples', name: 'Writing Samples', visible: true, order: 2, icon: <FileText className="w-4 h-4" /> },
    { id: 'testimonials', name: 'Testimonials', visible: true, order: 3, icon: <Type className="w-4 h-4" /> },
    { id: 'contact', name: 'Contact', visible: true, order: 4, icon: <Link className="w-4 h-4" /> },
  ]);

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

  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: 'Jane Smith',
    headline: 'B2B Content Writer | SaaS Specialist',
    bio: 'Helping tech companies tell their stories through strategic content. Specializing in long-form articles, case studies, and thought leadership pieces.',
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
    sample1Description: 'A comprehensive deep dive into artificial intelligence applications in marketing.',
    testimonial1: 'Jane delivered exceptional content that exceeded our expectations. Her ability to understand complex topics and translate them into engaging copy is remarkable.',
    testimonial1Author: 'Michael Chen',
    testimonial1Role: 'Marketing Director, TechCorp',
  });

  const [history, setHistory] = useState([formData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabs = [
    { id: 'design', label: 'Design', icon: <Palette className="w-5 h-5" /> },
    { id: 'content', label: 'Content', icon: <Type className="w-5 h-5" /> },
    { id: 'layout', label: 'Layout', icon: <Layout className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
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
    setSections(sections.map(s => 
      s.id === id ? { ...s, visible: !s.visible } : s
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

  const handleSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessModalOpen(true);
    }, 1500);
  };

  const handleDeploy = () => {
    onSave(formData);
  };

  // Mobile Warning Screen
  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Monitor className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-3">Desktop Required</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            The Visual Portfolio Builder works best on larger screens for the optimal creative experience. 
            Please switch to a desktop or laptop to access all the powerful features.
          </p>
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-left p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm text-slate-300">Real-time preview</span>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm text-slate-300">Advanced customization</span>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Layout className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm text-slate-300">Drag-and-drop sections</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-full bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-50 overflow-hidden">
      {/* Left Sidebar - Editor */}
      <div className="w-96 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col custom-scrollbar">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-50">Portfolio Builder</h2>
              <p className="text-xs text-slate-400">Pro Visual Editor</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="grid grid-cols-4 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            {activeTab === 'design' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-3">
                    Primary Color
                  </label>
                  <div className="flex gap-3">
                    <div className="relative group">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-14 h-14 rounded-xl border-2 border-slate-700 bg-slate-900 cursor-pointer transition hover:border-yellow-400"
                      />
                      <div className="absolute inset-0 rounded-xl ring-2 ring-yellow-400 ring-opacity-0 group-hover:ring-opacity-50 transition pointer-events-none"></div>
                    </div>
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-3">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    <div className="relative group">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="w-14 h-14 rounded-xl border-2 border-slate-700 bg-slate-900 cursor-pointer transition hover:border-yellow-400"
                      />
                      <div className="absolute inset-0 rounded-xl ring-2 ring-yellow-400 ring-opacity-0 group-hover:ring-opacity-50 transition pointer-events-none"></div>
                    </div>
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color Presets
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Blue', primary: '#2563eb', accent: '#0ea5e9' },
                      { name: 'Purple', primary: '#7c3aed', accent: '#a855f7' },
                      { name: 'Green', primary: '#059669', accent: '#10b981' },
                      { name: 'Orange', primary: '#ea580c', accent: '#f97316' },
                      { name: 'Pink', primary: '#db2777', accent: '#ec4899' },
                      { name: 'Teal', primary: '#0d9488', accent: '#14b8a6' },
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          handleInputChange('primaryColor', preset.primary);
                          handleInputChange('accentColor', preset.accent);
                        }}
                        className="relative p-4 rounded-xl border-2 border-slate-700 hover:border-yellow-400 transition-all group overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})`
                        }}
                      >
                        <span className="relative z-10 text-white text-xs font-bold drop-shadow-lg">{preset.name}</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'content' && (
              <>
                {/* Hero Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Hero Section
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                        placeholder="Your Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Headline</label>
                      <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) => handleInputChange('headline', e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                        placeholder="Your Professional Title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 resize-none focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition custom-scrollbar"
                        placeholder="Tell visitors about yourself..."
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Social Links
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.linkedin || ''}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                      placeholder="LinkedIn URL"
                    />
                    <input
                      type="url"
                      value={formData.twitter || ''}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                      placeholder="Twitter/X URL"
                    />
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                      placeholder="Personal Website"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Contact
                  </h3>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Specialties */}
                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Specialties
                  </h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(num => (
                      <input
                        key={num}
                        type="text"
                        value={formData[`specialty${num}`] || ''}
                        onChange={(e) => handleInputChange(`specialty${num}`, e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                        placeholder={`Specialty ${num}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Writing Samples */}
                <div className="pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Writing Samples
                    </h3>
                    <button
                      onClick={() => {
                        // Find first empty sample
                        const emptySlot = [1, 2, 3, 4].find(num => !formData[`sample${num}Title`]);
                        setCurrentSample(emptySlot || 1);
                        setSampleModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Sample
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(num => {
                      const title = formData[`sample${num}Title`];
                      if (!title) return null;
                      
                      return (
                        <div
                          key={num}
                          className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-yellow-400/50 transition cursor-pointer group"
                          onClick={() => {
                            setCurrentSample(num);
                            setSampleModalOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-100 truncate group-hover:text-yellow-400 transition">{title}</p>
                              <p className="text-xs text-slate-500 truncate mt-1">
                                {formData[`sample${num}Type`] || 'No type specified'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange(`sample${num}Title`, '');
                                handleInputChange(`sample${num}Type`, '');
                                handleInputChange(`sample${num}Description`, '');
                                handleInputChange(`sample${num}Content`, '');
                                handleInputChange(`sample${num}Link`, '');
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {![1, 2, 3, 4].some(num => formData[`sample${num}Title`]) && (
                      <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No samples added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Testimonials */}
                <div className="pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Testimonials
                    </h3>
                    <button
                      onClick={() => {
                        const emptySlot = [1, 2, 3].find(num => !formData[`testimonial${num}`]);
                        setCurrentTestimonial(emptySlot || 1);
                        setTestimonialModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Testimonial
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {[1, 2, 3].map(num => {
                      const testimonial = formData[`testimonial${num}`];
                      if (!testimonial) return null;
                      
                      return (
                        <div
                          key={num}
                          className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-yellow-400/50 transition cursor-pointer group"
                          onClick={() => {
                            setCurrentTestimonial(num);
                            setTestimonialModalOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-300 line-clamp-2 mb-2">&ldquo;{testimonial}&rdquo;</p>
                              <p className="text-xs font-bold text-slate-500">
                                {formData[`testimonial${num}Author`] || 'No author'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange(`testimonial${num}`, '');
                                handleInputChange(`testimonial${num}Author`, '');
                                handleInputChange(`testimonial${num}Role`, '');
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {![1, 2, 3].some(num => formData[`testimonial${num}`]) && (
                      <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
                        <Type className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No testimonials added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'layout' && (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Section Order
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Reorder sections or toggle visibility
                  </p>
                  
                  <div className="space-y-2">
                    {sections.map((section, index) => (
                      <div
                        key={section.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          section.visible
                            ? 'bg-slate-900/50 border-slate-700 hover:border-yellow-400/50'
                            : 'bg-slate-800/30 border-slate-700/50 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab hover:text-yellow-400 transition">
                            <GripVertical className="w-5 h-5 text-slate-500" />
                          </div>
                          
                          <div className="flex-1 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              section.visible ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-700/50 text-slate-600'
                            }`}>
                              {section.icon}
                            </div>
                            <span className="font-bold text-sm">{section.name}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveSectionUp(index)}
                              disabled={index === 0}
                              className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveSectionDown(index)}
                              disabled={index === sections.length - 1}
                              className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-2 hover:bg-slate-700 rounded-lg transition"
                              title={section.visible ? 'Hide section' : 'Show section'}
                            >
                              <Eye className={`w-4 h-4 ${section.visible ? 'text-green-400' : 'text-slate-600'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Portfolio Settings
                  </h3>
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Auto-save</span>
                      <button
                        onClick={() => setAutoSave(!autoSave)}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${
                          autoSave ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-lg transition-all ${
                          autoSave ? 'right-0.5' : 'left-0.5'
                        }`}></div>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      {autoSave ? 'Changes are saved automatically' : 'Manual save required'}
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-300 mb-1">Pro Tip</p>
                      <p className="text-xs text-blue-200/80 leading-relaxed">
                        Connect a custom domain from your dashboard to make your portfolio truly yours and increase professionalism!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-yellow-300 mb-1">Preview Mode</p>
                      <p className="text-xs text-yellow-200/80 leading-relaxed">
                        Use the device switcher above to see how your portfolio looks on different screens.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Top Toolbar */}
        <div className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition group"
              title="Undo"
            >
              <Undo className="w-5 h-5 group-hover:text-yellow-400 transition" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition group"
              title="Redo"
            >
              <Redo className="w-5 h-5 group-hover:text-yellow-400 transition" />
            </button>
            
            <div className="h-6 w-px bg-slate-700/50"></div>
            
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
              {[
                { mode: 'desktop', icon: Monitor, label: 'Desktop' },
                { mode: 'tablet', icon: Tablet, label: 'Tablet' },
                { mode: 'mobile', icon: Smartphone, label: 'Mobile' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${
                    previewMode === mode 
                      ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20' 
                      : 'hover:bg-slate-800'
                  }`}
                  title={label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save & Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Canvas - Scrollable */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 custom-scrollbar">
          <div
            className={`bg-white rounded-2xl shadow-2xl transition-all duration-500 ${
              previewMode === 'desktop' ? 'w-full max-w-6xl' :
              previewMode === 'tablet' ? 'w-[768px]' :
              'w-[375px]'
            }`}
            style={{ minHeight: '600px' }}
          >
            {/* Preview Content */}
            <div className="p-12 text-center">
              <div
                className="w-32 h-32 rounded-full mx-auto mb-6 shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`
                }}
              ></div>
              <h1 className="text-4xl font-bold mb-3 text-slate-900">
                {formData.fullName || 'Your Name'}
              </h1>
              <p className="text-xl mb-4 font-semibold" style={{ color: formData.primaryColor }}>
                {formData.headline || 'Your Professional Title'}
              </p>
              <p className="text-slate-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                {formData.bio || 'Your bio will appear here. Click "Content" tab to add your information...'}
              </p>
              
              {/* Social Links Preview */}
              {(formData.linkedin || formData.twitter || formData.website) && (
                <div className="flex gap-3 justify-center mb-6">
                  {formData.linkedin && (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                      <span className="text-slate-600 text-xs">IN</span>
                    </div>
                  )}
                  {formData.twitter && (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                      <span className="text-slate-600 text-xs">X</span>
                    </div>
                  )}
                  {formData.website && (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </div>
              )}
              
              {[1, 2, 3, 4].some(num => formData[`specialty${num}`]) && (
                <div className="flex gap-3 justify-center flex-wrap mb-8">
                  {[1, 2, 3, 4].map(num => {
                    const specialty = formData[`specialty${num}`];
                    if (!specialty) return null;
                    return (
                      <div
                        key={num}
                        className="px-4 py-2 rounded-full border-2 font-semibold transition hover:scale-105"
                        style={{ 
                          borderColor: formData.primaryColor, 
                          color: formData.primaryColor 
                        }}
                      >
                        {specialty}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                className="px-8 py-3 rounded-full text-white font-bold shadow-lg transition hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`
                }}
              >
                Get In Touch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Modal */}
      {sampleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar animate-slideUp">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
              <div>
                <h3 className="text-xl font-bold">Edit Writing Sample #{currentSample}</h3>
                <p className="text-sm text-slate-400 mt-1">Add content or external link</p>
              </div>
              <button
                onClick={() => setSampleModalOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData[`sample${currentSample}Title`] || ''}
                  onChange={(e) => handleInputChange(`sample${currentSample}Title`, e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  placeholder="e.g., How AI is Transforming Marketing"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Type</label>
                <input
                  type="text"
                  value={formData[`sample${currentSample}Type`] || ''}
                  onChange={(e) => handleInputChange(`sample${currentSample}Type`, e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  placeholder="e.g., Blog Post, Case Study, Article"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Short Description</label>
                <textarea
                  value={formData[`sample${currentSample}Description`] || ''}
                  onChange={(e) => handleInputChange(`sample${currentSample}Description`, e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition custom-scrollbar"
                  placeholder="Brief summary for the card..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Full Content
                  <span className="text-xs text-slate-500 font-normal ml-2">(For modal view)</span>
                </label>
                <textarea
                  value={formData[`sample${currentSample}Content`] || ''}
                  onChange={(e) => handleInputChange(`sample${currentSample}Content`, e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition custom-scrollbar"
                  placeholder="Full article content or excerpt..."
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Leave empty if you only want to link to external article
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">External Link</label>
                <input
                  type="url"
                  value={formData[`sample${currentSample}Link`] || ''}
                  onChange={(e) => handleInputChange(`sample${currentSample}Link`, e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  placeholder="https://example.com/article"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-700/50">
                <button
                  onClick={() => setSampleModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-400/20 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Done
                </button>
                <button
                  onClick={() => setSampleModalOpen(false)}
                  className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {testimonialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar animate-slideUp">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
              <div>
                <h3 className="text-xl font-bold">Edit Testimonial #{currentTestimonial}</h3>
                <p className="text-sm text-slate-400 mt-1">Add client feedback</p>
              </div>
              <button
                onClick={() => setTestimonialModalOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Testimonial *</label>
                <textarea
                  value={formData[`testimonial${currentTestimonial}`] || ''}
                  onChange={(e) => handleInputChange(`testimonial${currentTestimonial}`, e.target.value)}
                  rows={5}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition custom-scrollbar"
                  placeholder="What did the client say about working with you?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Client Name *</label>
                <input
                  type="text"
                  value={formData[`testimonial${currentTestimonial}Author`] || ''}
                  onChange={(e) => handleInputChange(`testimonial${currentTestimonial}Author`, e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  placeholder="e.g., Michael Chen"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Client Role/Company</label>
                <input
                  type="text"
                  value={formData[`testimonial${currentTestimonial}Role`] || ''}
                  onChange={(e) => handleInputChange(`testimonial${currentTestimonial}Role`, e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  placeholder="e.g., Marketing Director, TechCorp"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-700/50">
                <button
                  onClick={() => setTestimonialModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-400/20 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Done
                </button>
                <button
                  onClick={() => setTestimonialModalOpen(false)}
                  className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-slideUp">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-50 mb-3">Portfolio Saved!</h2>
              <p className="text-slate-400 text-lg">
                Your portfolio is ready. What would you like to do next?
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDeploy}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-400/20 transition group"
              >
                <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Deploy to Vercel
              </button>

              <button
                onClick={() => {
                  // Handle custom domain setup
                  setSuccessModalOpen(false);
                  handleDeploy();
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600/50 hover:border-yellow-400 text-slate-200 rounded-xl font-bold transition group"
              >
                <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Deploy with Custom Domain
              </button>

              <button
                onClick={() => {
                  setSuccessModalOpen(false);
                  onCancel();
                }}
                className="w-full px-6 py-3 text-slate-400 hover:text-slate-200 font-semibold transition"
              >
                I'll do this later
              </button>
            </div>

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
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
        }
        
        /* Custom Scrollbar */
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
    </div>
  );
}