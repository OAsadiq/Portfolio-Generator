import { useState } from 'react';
import { Undo, Redo, Palette, Type, Layout, Settings, Monitor, Tablet, Smartphone, AlertCircle, X, Check } from 'lucide-react';
import { useBuilderState } from './useBuilderState';
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../../lib/supabase';
import { track } from '../../lib/track';
import DesignTab from './tabs/DesignTab';
import ContentTab from './tabs/ContentTab';
import LayoutTab from './tabs/LayoutTab';
import SettingsTab from './tabs/SettingsTab';
import PreviewCanvas from './preview/PreviewCanvas';
import SampleModal from './modals/SampleModal';
import TestimonialModal from './modals/TestimonialModal';
import CaseStudyModal from './modals/CaseStudyModal';
import BlogModal from './modals/BlogModal';
import SuccessModal from './modals/SuccessModal';
import Logo from "../Logo";
import TutorialTour, { TourStep } from '../tutorial/TutorialTour';

const BUILDER_TOUR: TourStep[] = [
  { title: "Welcome to the Pro Editor", body: "This is where you design your portfolio live. Here's a 30-second tour — replay it anytime from the ? button.", placement: "center" },
  { selector: '[data-tour="tour-tabs"]', title: "Four ways to edit", body: "Design controls colors & fonts. Content is your text, work and photos. Layout reorders or hides sections. Settings handles the rest.", placement: "right" },
  { selector: '[data-tour="tour-panel"]', title: "Edit on the left", body: "Whatever you change here updates the preview instantly — no save needed to see it.", placement: "right" },
  { selector: '[data-tour="tour-viewport"]', title: "Check every screen", body: "Preview how your portfolio looks on desktop, tablet, and mobile before you publish.", placement: "bottom" },
  { selector: '[data-tour="tour-save"]', title: "Save when you're ready", body: "Hit Save to publish your portfolio. It goes live instantly, and you can come back to edit anytime.", placement: "bottom" },
];

const TABS = [
  { id: 'design',   label: 'Design',   icon: <Palette className="w-4 h-4" /> },
  { id: 'content',  label: 'Content',  icon: <Type className="w-4 h-4" /> },
  { id: 'layout',   label: 'Layout',   icon: <Layout className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

interface Props {
  onCancel?: () => void;
}

export default function PortfolioBuilder({ onCancel }: Props) {
  const state = useBuilderState(onCancel);
  const navigate = useNavigate();
  const goBack = () => { if (onCancel) onCancel(); else navigate('/'); };
  const [remEmail, setRemEmail] = useState('');
  const [remStatus, setRemStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  const sendDesktopLink = async () => {
    const email = remEmail.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setRemStatus('error'); return; }
    setRemStatus('saving');
    try {
      // A DB webhook on this table fires the "finish on desktop" email (via /api/notify/domain).
      const { error } = await supabase.from('desktop_reminders').insert({
        email,
        resume_url: typeof window !== 'undefined' ? window.location.href : null,
        template_id: state.selectedTemplate,
      });
      if (error) throw error;
      // Also add them to the marketing list (they gave us their email). Ignore duplicates.
      await supabase.from('newsletter_subscribers').insert({ email, source: 'desktop_reminder', is_active: true });
      setRemStatus('done');
      track('desktop_link_requested', { template: state.selectedTemplate });
    } catch {
      setRemStatus('error');
    }
  };

  // ── Loading ──────────────────────────────────────────
  if (state.loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-sm">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  // ── Mobile blocked ───────────────────────────────────
  if (state.isMobile) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Monitor className="w-7 h-7 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Best built on desktop</h2>
          {remStatus === 'done' ? (
            <>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto my-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-stone-600 text-sm mb-6 leading-relaxed">Link sent! Check your email and open it on a laptop or desktop to finish building.</p>
              <button onClick={goBack} className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 px-6 py-3 rounded-xl font-medium transition text-sm">
                Go Back
              </button>
            </>
          ) : (
            <>
              <p className="text-stone-500 text-sm mb-5 leading-relaxed">This template's editor needs a bigger screen. Pop in your email and we'll send you a link to finish on desktop — nothing's lost.</p>
              <input
                type="email"
                value={remEmail}
                onChange={(e) => { setRemEmail(e.target.value); if (remStatus === 'error') setRemStatus('idle'); }}
                placeholder="you@example.com"
                disabled={remStatus === 'saving'}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition mb-2"
              />
              {remStatus === 'error' && <p className="text-red-500 text-xs mb-2">Enter a valid email and try again.</p>}
              <button onClick={sendDesktopLink} disabled={remStatus === 'saving'} className="w-full bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50 mb-2">
                {remStatus === 'saving' ? 'Sending…' : 'Email me the link'}
              </button>
              <button onClick={goBack} className="w-full text-stone-400 hover:text-stone-600 px-6 py-2 rounded-xl font-medium transition text-sm">
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-100 text-stone-900 overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <div className="w-88 bg-white border-r border-stone-200 flex flex-col" style={{ width: '360px' }}>

        {/* Top bar — logo + save */}
        <div className="h-14 px-4 border-b border-stone-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Link to="/"><Logo size={18} variant="orange" showWordmark = {false} /></Link>
              <span className="font-bold text-stone-900 text-sm">Porfilr</span>            
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Pro Editor</span>
          </div>

          <button
            data-tour="tour-save"
            onClick={state.handleSubmit}
            disabled={state.saving}
            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.saving
              ? <span className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />{state.isEditing ? 'Updating...' : 'Saving...'}</span>
              : state.isEditing ? 'Update' : 'Save'
            }
          </button>
        </div>

        {/* Tab nav */}
        <div className="px-3 pt-3 pb-2 border-b border-stone-100">
          <div className="grid grid-cols-4 gap-1 bg-stone-100 p-1 rounded-xl" data-tour="tour-tabs">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => state.setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition text-xs font-semibold ${
                  state.activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700'
                }`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto builder-scrollbar px-4 py-4" data-tour="tour-panel">
          {state.activeTab === 'design' && (
            <DesignTab formData={state.formData} onChange={state.handleInputChange} onMultiChange={state.handleMultiChange} templateId={state.selectedTemplate} />
          )}
          {state.activeTab === 'content' && (
            <ContentTab
              formData={state.formData}
              onChange={state.handleInputChange}
              onMultiChange={state.handleMultiChange}
              onFileChange={state.handleFileChange}
              onOpenSampleModal={num => { state.setCurrentSample(num); state.setSampleModalOpen(true); }}
              onOpenTestimonialModal={num => { state.setCurrentTestimonial(num); state.setTestimonialModalOpen(true); }}
              onOpenCaseModal={num => { state.setCurrentCase(num); state.setCaseModalOpen(true); }}
              onOpenBlogModal={num => { state.setCurrentBlog(num); state.setBlogModalOpen(true); }}
              onDeleteSample={state.handleDeleteSample}
              onDeleteTestimonial={state.handleDeleteTestimonial}
              onDeleteCase={state.handleDeleteCase}
              onDeleteBlog={state.handleDeleteBlog}
              templateId={state.selectedTemplate}
            />
          )}
          {state.activeTab === 'layout' && (
            <LayoutTab
              sections={state.sections}
              onToggle={state.toggleSection}
              onMoveUp={state.moveSectionUp}
              onMoveDown={state.moveSectionDown}
              onReorder={state.handleReorder}
            />
          )}
          {state.activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>

      {/* ── Preview pane ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Preview top bar */}
        <div className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            {/* Undo / Redo */}
            <div className="flex items-center gap-1">
              <button onClick={state.undo} disabled={state.historyIndex === 0}
                className="p-1.5 hover:bg-stone-100 rounded-lg disabled:opacity-30 transition text-stone-500" title="Undo">
                <Undo className="w-4 h-4" />
              </button>
              <button onClick={state.redo} disabled={state.historyIndex === state.historyLength - 1}
                className="p-1.5 hover:bg-stone-100 rounded-lg disabled:opacity-30 transition text-stone-500" title="Redo">
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-stone-200" />

            {/* Viewport switcher */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg" data-tour="tour-viewport">
              {[{ mode: 'desktop', Icon: Monitor }, { mode: 'tablet', Icon: Tablet }, { mode: 'mobile', Icon: Smartphone }].map(({ mode, Icon }) => (
                <button key={mode} onClick={() => state.setPreviewMode(mode)}
                  className={`p-1.5 rounded-md transition ${state.previewMode === mode ? 'bg-white shadow-sm text-orange-600 border border-stone-200' : 'text-stone-400 hover:text-stone-600'}`}
                  title={mode.charAt(0).toUpperCase() + mode.slice(1)}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <button onClick={state.handleCancel}
            className="px-3 py-1.5 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 rounded-lg text-sm font-medium transition">
            Cancel
          </button>

          {/* Error popup */}
          {state.error && (
            <div className="absolute top-16 right-4 z-50 bg-red-50 border border-red-200 rounded-xl p-4 max-w-sm shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-semibold mb-0.5">Something went wrong</p>
                  <p className="text-red-600 text-xs leading-relaxed">{state.error}</p>
                </div>
                <button onClick={() => state.setError('')} className="p-1 hover:bg-red-100 rounded-lg transition">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cancel confirm */}
        {state.showCancelConfirm && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold text-stone-900 mb-1">Discard changes?</h3>
              <p className="text-stone-500 text-sm mb-6">Any unsaved changes will be lost.</p>
              <div className="flex gap-3">
                <button onClick={() => state.setShowCancelConfirm(false)}
                  className="flex-1 border border-stone-200 hover:border-stone-300 text-stone-700 py-2.5 rounded-xl font-semibold text-sm transition">
                  Keep editing
                </button>
                <button onClick={state.confirmCancel}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-semibold text-sm transition">
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <PreviewCanvas formData={state.formData} previewMode={state.previewMode} sections={state.sections} templateId={state.selectedTemplate} journalMeta={state.journalMeta} />
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      <SampleModal isOpen={state.sampleModalOpen} currentSample={state.currentSample} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setSampleModalOpen(false)} />
      <TestimonialModal isOpen={state.testimonialModalOpen} currentTestimonial={state.currentTestimonial} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setTestimonialModalOpen(false)} />
      <CaseStudyModal isOpen={state.caseModalOpen} currentCase={state.currentCase} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setCaseModalOpen(false)} />
      <BlogModal isOpen={state.blogModalOpen} currentBlog={state.currentBlog} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setBlogModalOpen(false)} />
      <SuccessModal isOpen={state.successModalOpen} portfolioSlug={state.portfolioSlug} onClose={() => state.setSuccessModalOpen(false)} />

      <BuilderStyles />

      <TutorialTour steps={BUILDER_TOUR} storageKey="porfilr_tour_builder_v1" />
    </div>
  );
}

function BuilderStyles() {
  return (
    <style>{`
      .builder-scrollbar::-webkit-scrollbar { width: 6px; }
      .builder-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .builder-scrollbar::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 10px; }
      .builder-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
      .builder-scrollbar { scrollbar-width: thin; scrollbar-color: #d6d3d1 transparent; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
      .animate-slideUp { animation: slideUp 0.25s cubic-bezier(0.4,0,0.2,1); }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    `}</style>
  );
}
