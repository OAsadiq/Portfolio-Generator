/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Eye, Save, Undo, Redo, Settings, Palette, Type,
  Layout, Trash2, Plus, GripVertical, X, Check, Link,
  FileText, ChevronDown, ChevronUp, Monitor, Smartphone, Tablet, Sparkles,
  Rocket, Globe, ExternalLink
} from 'lucide-react';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const COLOR_PRESETS = [
  { name: 'Blue', primary: '#2563eb', accent: '#0ea5e9' },
  { name: 'Purple', primary: '#7c3aed', accent: '#a855f7' },
  { name: 'Green', primary: '#059669', accent: '#10b981' },
  { name: 'Orange', primary: '#ea580c', accent: '#f97316' },
  { name: 'Pink', primary: '#db2777', accent: '#ec4899' },
  { name: 'Teal', primary: '#0d9488', accent: '#14b8a6' },
];

const INITIAL_SECTIONS = [
  { id: 'hero', name: 'Hero Section', visible: true, order: 0, icon: <Layout className="w-4 h-4" /> },
  { id: 'specialties', name: 'Specialties', visible: true, order: 1, icon: <Sparkles className="w-4 h-4" /> },
  { id: 'samples', name: 'Writing Samples', visible: true, order: 2, icon: <FileText className="w-4 h-4" /> },
  { id: 'testimonials', name: 'Testimonials', visible: true, order: 3, icon: <Type className="w-4 h-4" /> },
  { id: 'contact', name: 'Contact', visible: true, order: 4, icon: <Link className="w-4 h-4" /> },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PortfolioVisualBuilder({ onSave, onCancel }: any) {
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

  // ============================================================================
  // FIXED HANDLERS
  // ============================================================================

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
    setSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
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

  // FIX: Proper delete handlers
  const handleDeleteSample = (num: number) => {
    const updates: any = {};
    updates[`sample${num}Title`] = '';
    updates[`sample${num}Type`] = '';
    updates[`sample${num}Description`] = '';
    updates[`sample${num}Content`] = '';
    updates[`sample${num}Link`] = '';
    
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Add to history
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
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // FIX: Proper save handler
  const handleSubmit = () => {
    setSaving(true);
    
    // Simulate save process
    setTimeout(() => {
      setSaving(false);
      setSuccessModalOpen(true);
      
      // Log the data for debugging
      console.log('Portfolio Data Saved:', {
        formData,
        sections,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  };

  const handleDeploy = () => {
    console.log('Deploying portfolio with data:', formData);
    onSave({
      formData,
      sections,
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    });
  };

  // Mobile warning
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
              <Sparkles className="w-5 h-5 text-slate-900" />
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

          <div className="flex gap-3">
            <button onClick={onCancel} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition">
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={saving} 
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
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

        <PreviewCanvas formData={formData} previewMode={previewMode} />
      </div>

      {/* Modals */}
      <SampleModal isOpen={sampleModalOpen} currentSample={currentSample} formData={formData} onChange={handleInputChange} onClose={() => setSampleModalOpen(false)} />
      <TestimonialModal isOpen={testimonialModalOpen} currentTestimonial={currentTestimonial} formData={formData} onChange={handleInputChange} onClose={() => setTestimonialModalOpen(false)} />
      <SuccessModal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)} onDeploy={handleDeploy} onLater={() => { setSuccessModalOpen(false); onCancel(); }} />

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
          <input type="url" value={formData.website || ''} onChange={(e) => onChange('website', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="Personal Website" />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Link className="w-4 h-4" />Contact</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => onChange('email', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Phone Number (Optional)</label>
            <input type="tel" value={formData.phone || ''} onChange={(e) => onChange('phone', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="+1 (555) 123-4567" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Location (Optional)</label>
            <input type="text" value={formData.location || ''} onChange={(e) => onChange('location', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" placeholder="San Francisco, CA" />
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
                <button onClick={(e) => { e.stopPropagation(); onDeleteSample(num); }} className="p-2 hover:bg-red-500/20 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
                <button onClick={(e) => { e.stopPropagation(); onDeleteTestimonial(num); }} className="p-2 hover:bg-red-500/20 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Layout className="w-4 h-4" />Section Order</h3>
      <p className="text-xs text-slate-400 mb-4">Reorder sections or toggle visibility</p>
      <div className="space-y-2">
        {sections.map((section: any, i: number) => (
          <div key={section.id} className={`p-4 rounded-xl border-2 transition ${section.visible ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50 opacity-50'}`}>
            <div className="flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-slate-500 cursor-grab" />
              <div className="flex-1 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section.visible ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-700/50 text-slate-600'}`}>
                  {section.icon}
                </div>
                <span className="font-bold text-sm">{section.name}</span>
              </div>
              <button onClick={() => onMoveUp(i)} disabled={i === 0} className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => onMoveDown(i)} disabled={i === sections.length - 1} className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"><ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => onToggle(section.id)} className="p-2 hover:bg-slate-700 rounded-lg transition"><Eye className={`w-4 h-4 ${section.visible ? 'text-green-400' : 'text-slate-600'}`} /></button>
            </div>
          </div>
        ))}
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

function PreviewCanvas({ formData, previewMode }: any) {
  return (
    <div className="flex-1 overflow-auto p-8 flex items-start justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 custom-scrollbar">
      <div className={`bg-white rounded-2xl shadow-2xl transition-all duration-500 ${previewMode === 'desktop' ? 'w-full max-w-6xl' : previewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'}`} style={{ minHeight: '600px' }}>
        <div className="p-12 text-center">
          {/* Profile Image - shows uploaded image or gradient placeholder */}
          {formData.profileImage ? (
            <img 
              src={formData.profileImage} 
              alt={formData.fullName || 'Profile'} 
              className="w-32 h-32 rounded-full mx-auto mb-6 shadow-2xl object-cover border-4 border-white"
              style={{ boxShadow: `0 20px 25px -5px rgba(0,0,0,0.1), 0 0 0 8px ${formData.primaryColor}20` }}
            />
          ) : (
            <div 
              className="w-32 h-32 rounded-full mx-auto mb-6 shadow-2xl flex items-center justify-center text-white text-4xl font-bold" 
              style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}
            >
              {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-3 text-slate-900">{formData.fullName || 'Your Name'}</h1>
          <p className="text-xl mb-4 font-semibold" style={{ color: formData.primaryColor }}>{formData.headline || 'Your Title'}</p>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">{formData.bio || 'Your bio...'}</p>
          
          {(formData.linkedin || formData.twitter || formData.website) && (
            <div className="flex gap-3 justify-center mb-6">
              {formData.linkedin && <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center"><span className="text-slate-600 text-xs">IN</span></div>}
              {formData.twitter && <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center"><span className="text-slate-600 text-xs">X</span></div>}
              {formData.website && <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center"><Globe className="w-5 h-5 text-slate-600" /></div>}
            </div>
          )}
          
          {[1,2,3,4].some(n => formData[`specialty${n}`]) && (
            <div className="flex gap-3 justify-center flex-wrap mb-8">
              {[1,2,3,4].map(n => formData[`specialty${n}`] ? (
                <div key={n} className="px-4 py-2 rounded-full border-2 font-semibold" style={{ borderColor: formData.primaryColor, color: formData.primaryColor }}>{formData[`specialty${n}`]}</div>
              ) : null)}
            </div>
          )}

          <button className="px-8 py-3 rounded-full text-white font-bold shadow-lg hover:scale-105 transition" style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})` }}>Get In Touch</button>
        </div>
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

function SuccessModal({ isOpen, onClose, onDeploy, onLater }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full animate-slideUp">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-green-400" /></div>
          <h2 className="text-3xl font-bold mb-3">Portfolio Saved!</h2>
          <p className="text-slate-400 text-lg">What would you like to do next?</p>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <button onClick={onDeploy} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg group"><Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />Deploy to Vercel</button>
          <button onClick={onDeploy} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600/50 hover:border-yellow-400 text-slate-200 rounded-xl font-bold group"><Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />Deploy with Custom Domain</button>
          <button onClick={onLater} className="w-full px-6 py-3 text-slate-400 hover:text-slate-200 font-semibold">I'll do this later</button>
        </div>
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">You can deploy or add a custom domain anytime from your dashboard.</p>
          </div>
        </div>
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