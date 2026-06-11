import { useState, useEffect } from 'react';
import {
  User, Globe, Mail, Sparkles, BookOpen, MessageSquare, FileText,
  Plus, Trash2, Edit2, Check, Upload,
} from 'lucide-react';
import { SKILL_OPTIONS, getTemplateConfig } from '../builder.config';

interface Props {
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onFileChange: (field: string, file: File | null) => void;
  onOpenSampleModal: (num: number) => void;
  onOpenTestimonialModal: (num: number) => void;
  onOpenCaseModal: (num: number) => void;
  onOpenBlogModal: (num: number) => void;
  onDeleteSample: (num: number) => void;
  onDeleteTestimonial: (num: number) => void;
  onDeleteCase: (num: number) => void;
  onDeleteBlog: (num: number) => void;
  templateId: string;
}

const INPUT = 'w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400';
const SECTION_HDR = 'pt-6 border-t border-slate-700/50';

function countItems(formData: Record<string, string>, prefix: string, titleKey: string) {
  let count = 0;
  for (let i = 1; i <= 100; i++) {
    if (formData[`${prefix}${i}${titleKey}`]) count = i;
  }
  return count;
}

export default function ContentTab({
  formData, onChange, onFileChange,
  onOpenSampleModal, onOpenTestimonialModal, onOpenCaseModal, onOpenBlogModal,
  onDeleteSample, onDeleteTestimonial, onDeleteCase, onDeleteBlog,
  templateId,
}: Props) {
  const config = getTemplateConfig(templateId);
  const blocks = config.contentBlocks;

  const [totalSamples, setTotalSamples] = useState(() => countItems(formData, 'sample', 'Title'));
  const [totalCases, setTotalCases] = useState(() => countItems(formData, 'case', 'Title'));
  const [totalBlogs, setTotalBlogs] = useState(() => countItems(formData, 'blog', 'Title'));

  useEffect(() => {
    setTotalSamples(countItems(formData, 'sample', 'Title'));
    setTotalCases(countItems(formData, 'case', 'Title'));
    setTotalBlogs(countItems(formData, 'blog', 'Title'));
  }, [formData]);

  const isModern = templateId === 'modern-writer-template';

  return (
    <div className="space-y-6">

      {/* ── Hero ─────────────────────────────────────────── */}
      {blocks.includes('hero') && (
        <div>
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />Hero Section
          </h3>
          <div className="space-y-4">
            {/* Profile image */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Profile Image</label>
              {formData.profileImage && (
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-xl mb-3">
                  <img src={formData.profileImage} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 font-semibold">Image uploaded</p>
                    <p className="text-xs text-slate-500">Click below to change</p>
                  </div>
                  <button onClick={() => onChange('profileImage', '')} className="p-2 hover:bg-red-500/20 rounded-lg transition">
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
                    <p className="text-sm font-semibold text-slate-300">{formData.profileImage ? 'Change Image' : 'Upload Profile Image'}</p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange('profileImage', f); }} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
              <input type="text" value={formData.fullName || ''} onChange={e => onChange('fullName', e.target.value)} className={INPUT} placeholder="Your Name" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">{isModern ? 'Tagline' : 'Headline'}</label>
              <input type="text"
                value={isModern ? (formData.tagline || '') : (formData.headline || '')}
                onChange={e => onChange(isModern ? 'tagline' : 'headline', e.target.value)}
                className={INPUT}
                placeholder={isModern ? 'Creative Professional' : 'Your Professional Title'}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Bio</label>
              <textarea value={formData.bio || ''} onChange={e => onChange('bio', e.target.value)} rows={4}
                className={`${INPUT} resize-none custom-scrollbar`} placeholder="Tell visitors about yourself..." />
            </div>
          </div>
        </div>
      )}

      {/* ── Social Links ─────────────────────────────────── */}
      {blocks.includes('social') && (
        <div className={SECTION_HDR}>
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" />Social Links
          </h3>
          <div className="space-y-3">
            <input type="url" value={formData.linkedin || ''} onChange={e => onChange('linkedin', e.target.value)} className={INPUT} placeholder="LinkedIn URL" />
            <input type="url" value={formData.twitter || ''} onChange={e => onChange('twitter', e.target.value)} className={INPUT} placeholder="Twitter/X URL" />
            {isModern && (
              <input type="url" value={formData.github || ''} onChange={e => onChange('github', e.target.value)} className={INPUT} placeholder="GitHub URL" />
            )}
            <input type="url" value={formData.website || ''} onChange={e => onChange('website', e.target.value)} className={INPUT} placeholder="Website URL" />
          </div>
        </div>
      )}

      {/* ── Contact ─────────────────────────────────────── */}
      {blocks.includes('contact') && (
        <div className={SECTION_HDR}>
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />Contact
          </h3>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
            <input type="email" value={formData.email || ''} onChange={e => onChange('email', e.target.value)} className={INPUT} placeholder="your@email.com" />
          </div>
        </div>
      )}

      {/* ── Skills (Modern only) ─────────────────────────── */}
      {blocks.includes('skills') && (
        <div className={SECTION_HDR}>
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />Skills
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {SKILL_OPTIONS.map(skill => {
              const isSelected = [1, 2, 3, 4, 5, 6].some(n => formData[`skill${n}`] === skill.name);
              const selectedCount = [1, 2, 3, 4, 5, 6].filter(n => formData[`skill${n}`]).length;
              const canSelect = selectedCount < 6;
              return (
                <button
                  key={skill.name}
                  disabled={!isSelected && !canSelect}
                  onClick={() => {
                    if (isSelected) {
                      const slot = [1, 2, 3, 4, 5, 6].find(n => formData[`skill${n}`] === skill.name);
                      if (slot) {
                        for (let i = slot; i < 6; i++) onChange(`skill${i}`, formData[`skill${i + 1}`] || '');
                        onChange('skill6', '');
                      }
                    } else if (canSelect) {
                      const empty = [1, 2, 3, 4, 5, 6].find(n => !formData[`skill${n}`]);
                      if (empty) onChange(`skill${empty}`, skill.name);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                    : canSelect ? 'bg-slate-900/50 border-slate-700 hover:border-yellow-400/50'
                    : 'bg-slate-900/30 border-slate-700/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{skill.icon}</span>
                    <span className="flex-1 font-semibold text-sm">{skill.name}</span>
                    {isSelected && <Check className="w-5 h-5 text-yellow-400" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-slate-400 text-center">
            {[1, 2, 3, 4, 5, 6].filter(n => formData[`skill${n}`]).length} / 6 skills selected
          </div>
        </div>
      )}

      {/* ── Case Studies (Modern only) ────────────────────── */}
      {blocks.includes('case-studies') && (
        <div className={SECTION_HDR}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />Case Studies
            </h3>
            <button onClick={() => onOpenCaseModal(totalCases + 1)}
              className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />Add
            </button>
          </div>
          {totalCases === 0 ? (
            <div className="text-center py-8 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-700">
              <p className="text-slate-400 text-sm mb-3">No case studies added yet</p>
              <button onClick={() => onOpenCaseModal(1)} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-lg text-sm font-bold transition">
                Add Your First Case Study
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: totalCases }, (_, i) => i + 1).map(num => {
                const title = formData[`case${num}Title`];
                if (!title) return null;
                return (
                  <div key={num} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-yellow-400/30 transition group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-200 mb-1 truncate">{title}</h4>
                        {formData[`case${num}Client`] && (
                          <span className="inline-block px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-semibold">{formData[`case${num}Client`]}</span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onOpenCaseModal(num)} className="p-2 hover:bg-slate-700 rounded-lg transition">
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button onClick={() => onDeleteCase(num)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition">
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
      )}

      {/* ── Blog Articles (Modern only) ───────────────────── */}
      {blocks.includes('blog') && (
        <div className={SECTION_HDR}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />Blog Articles
            </h3>
            <button onClick={() => onOpenBlogModal(totalBlogs + 1)}
              className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />Add
            </button>
          </div>
          {totalBlogs === 0 ? (
            <div className="text-center py-8 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-700">
              <p className="text-slate-400 text-sm mb-3">No blog articles added yet</p>
              <button onClick={() => onOpenBlogModal(1)} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-lg text-sm font-bold transition">
                Add Your First Article
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: totalBlogs }, (_, i) => i + 1).map(num => {
                const title = formData[`blog${num}Title`];
                if (!title) return null;
                return (
                  <div key={num} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-yellow-400/30 transition group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-200 mb-1 truncate">{title}</h4>
                        {formData[`blog${num}Category`] && (
                          <span className="inline-block px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs font-semibold">{formData[`blog${num}Category`]}</span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onOpenBlogModal(num)} className="p-2 hover:bg-slate-700 rounded-lg transition">
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button onClick={() => onDeleteBlog(num)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition">
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
      )}

      {/* ── Specialties (Professional only) ──────────────── */}
      {blocks.includes('specialties') && (
        <div className={SECTION_HDR}>
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />Specialties
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(num => (
              <input key={num} type="text"
                value={formData[`specialty${num}`] || ''} onChange={e => onChange(`specialty${num}`, e.target.value)}
                className={INPUT} placeholder={`Specialty ${num}`} />
            ))}
          </div>
        </div>
      )}

      {/* ── Writing Samples (Professional only) ──────────── */}
      {blocks.includes('samples') && (
        <div className={SECTION_HDR}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />Writing Samples
            </h3>
            <button onClick={() => onOpenSampleModal(totalSamples + 1)}
              className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />Add
            </button>
          </div>
          {totalSamples === 0 ? (
            <div className="text-center py-8 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-700">
              <p className="text-slate-400 text-sm mb-3">No samples added yet</p>
              <button onClick={() => onOpenSampleModal(1)} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-lg text-sm font-bold transition">
                Add Your First Sample
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: totalSamples }, (_, i) => i + 1).map(num => {
                const title = formData[`sample${num}Title`];
                if (!title) return null;
                const image = formData[`sample${num}Image`];
                const type = formData[`sample${num}Type`];
                return (
                  <div key={num} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-yellow-400/30 transition group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {image
                          ? <img src={image} alt={title} className="w-16 h-16 rounded-lg object-cover border-2 border-slate-600" />
                          : <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 border-2 border-slate-600 flex items-center justify-center text-3xl">📄</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-bold text-slate-200 mb-1 truncate">{title}</h4>
                            {type && <span className="inline-block px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-semibold">{type}</span>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onOpenSampleModal(num)} className="p-2 hover:bg-slate-700 rounded-lg transition">
                              <Edit2 className="w-4 h-4 text-slate-400" />
                            </button>
                            <button onClick={() => onDeleteSample(num)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {formData[`sample${num}Description`] && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{formData[`sample${num}Description`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Testimonials (Professional only) ─────────────── */}
      {blocks.includes('testimonials') && (
        <div className={SECTION_HDR}>
          <div className="flex justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />Testimonials
            </h3>
            <button
              onClick={() => { const slot = [1, 2, 3].find(n => !formData[`testimonial${n}`]); onOpenTestimonialModal(slot || 1); }}
              className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
          {![1, 2, 3].some(n => formData[`testimonial${n}`]) ? (
            <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No testimonials added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3].map(num => formData[`testimonial${num}`] ? (
                <div key={num} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-yellow-400/50 transition group">
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 line-clamp-2 mb-2">"{formData[`testimonial${num}`]}"</p>
                      <p className="text-xs font-bold text-slate-500">{formData[`testimonial${num}Author`] || 'No author'}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onOpenTestimonialModal(num)} className="p-2 hover:bg-slate-700 rounded-lg transition">
                        <Edit2 className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); onDeleteTestimonial(num); }} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
