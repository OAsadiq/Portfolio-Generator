/* eslint-disable @typescript-eslint/no-explicit-any */
import { Undo, Redo, Palette, Type, Layout, Settings, Monitor, Tablet, Smartphone, AlertCircle, X } from 'lucide-react';
import { useBuilderState } from './useBuilderState';
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

const TABS = [
  { id: 'design',   label: 'Design',   icon: <Palette className="w-5 h-5" /> },
  { id: 'content',  label: 'Content',  icon: <Type className="w-5 h-5" /> },
  { id: 'layout',   label: 'Layout',   icon: <Layout className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface Props {
  onCancel?: () => void;
}

export default function PortfolioBuilder({ onCancel }: Props) {
  const state = useBuilderState(onCancel);

  // ── Loading ──────────────────────────────────────────
  if (state.loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  // ── Mobile blocked ───────────────────────────────────
  if (state.isMobile) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Monitor className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Desktop required</h2>
          <p className="text-stone-500 mb-6">The Visual Portfolio Builder works best on larger screens. Please switch to a desktop or laptop.</p>
          <button onClick={onCancel} className="w-full bg-stone-900 hover:bg-stone-700 text-white px-6 py-3 rounded-xl font-semibold transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-50 overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <div className="w-96 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
        {/* Logo + Tabs */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Porfilr</h2>
              <p className="text-xs text-slate-400">Pro Visual Editor</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => state.setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition ${state.activeTab === tab.id ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}>
                {tab.icon}
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {state.activeTab === 'design' && (
            <DesignTab formData={state.formData} onChange={state.handleInputChange} templateId={state.selectedTemplate} />
          )}
          {state.activeTab === 'content' && (
            <ContentTab
              formData={state.formData}
              onChange={state.handleInputChange}
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
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Top bar */}
        <div className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6 relative">
          <div className="flex items-center gap-4">
            <button onClick={state.undo} disabled={state.historyIndex === 0} className="p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-30 transition">
              <Undo className="w-5 h-5" />
            </button>
            <button onClick={state.redo} disabled={state.historyIndex === state.historyLength - 1} className="p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-30 transition">
              <Redo className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-slate-700/50" />

            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl">
              {[{ mode: 'desktop', Icon: Monitor }, { mode: 'tablet', Icon: Tablet }, { mode: 'mobile', Icon: Smartphone }].map(({ mode, Icon }) => (
                <button key={mode} onClick={() => state.setPreviewMode(mode)}
                  className={`p-2 rounded-lg transition ${state.previewMode === mode ? 'bg-yellow-400 text-slate-900' : 'hover:bg-slate-800'}`}>
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={state.handleCancel} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition">
              Cancel
            </button>
            <button onClick={state.handleSubmit} disabled={state.saving}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {state.saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  {state.isEditing ? 'Updating...' : 'Saving...'}
                </span>
              ) : (
                state.isEditing ? 'Update Portfolio' : 'Save Portfolio'
              )}
            </button>
          </div>

          {/* Error popup */}
          {state.error && (
            <div className="fixed top-16 right-6 z-50">
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 pr-12 backdrop-blur-sm shadow-2xl max-w-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-red-500 font-semibold mb-1">Error</h3>
                    <p className="text-red-400 text-sm">{state.error}</p>
                  </div>
                </div>
                <button onClick={() => state.setError('')} className="absolute top-3 right-3 p-1.5 hover:bg-red-500/20 rounded-lg transition">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cancel confirm dialog */}
        {state.showCancelConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Discard Changes?</h3>
                  <p className="text-sm text-slate-400">Your unsaved changes will be lost</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => state.setShowCancelConfirm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl font-semibold transition">
                  Keep Editing
                </button>
                <button onClick={state.confirmCancel} className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-semibold transition">
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <PreviewCanvas formData={state.formData} previewMode={state.previewMode} sections={state.sections} templateId={state.selectedTemplate} />
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      <SampleModal isOpen={state.sampleModalOpen} currentSample={state.currentSample} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setSampleModalOpen(false)} />
      <TestimonialModal isOpen={state.testimonialModalOpen} currentTestimonial={state.currentTestimonial} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setTestimonialModalOpen(false)} />
      <CaseStudyModal isOpen={state.caseModalOpen} currentCase={state.currentCase} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setCaseModalOpen(false)} />
      <BlogModal isOpen={state.blogModalOpen} currentBlog={state.currentBlog} formData={state.formData} onChange={state.handleInputChange} onClose={() => state.setBlogModalOpen(false)} />
      <SuccessModal isOpen={state.successModalOpen} portfolioSlug={state.portfolioSlug} onClose={() => state.setSuccessModalOpen(false)} />

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      * { font-family: 'Inter', -apple-system, system-ui, sans-serif; }
      .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15,23,42,0.3); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#facc15,#eab308); border-radius: 10px; border: 2px solid rgba(15,23,42,0.3); }
      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #facc15 rgba(15,23,42,0.3); }
      input[type="color"]::-webkit-color-swatch { border: none; border-radius: 8px; }
      input[type="color"]::-webkit-color-swatch-wrapper { padding: 4px; border-radius: 12px; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1); }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    `}</style>
  );
}
