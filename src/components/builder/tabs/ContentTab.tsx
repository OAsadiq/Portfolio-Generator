import { useState, useEffect } from 'react';
import { User, Globe, Mail, Sparkles, BookOpen, MessageSquare, FileText, Plus, Trash2, Edit2, Check, Upload, TrendingUp, Briefcase, Building2, Image as ImageIcon, GraduationCap } from 'lucide-react';
import { SKILL_OPTIONS, getTemplateConfig } from '../builder.config';
import { SocialIcon } from '../preview/socialIcons';

interface Props {
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onMultiChange?: (updates: Record<string, string>) => void;
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

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition';
const LABEL = 'block text-xs font-semibold text-stone-600 mb-1.5';
const DIVIDER = 'pt-5 mt-1 border-t border-stone-100';
const SECTION_HDR = 'text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5';
const ADD_BTN = 'px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition';

function countItems(formData: Record<string, string>, prefix: string, titleKey: string) {
  let count = 0;
  for (let i = 1; i <= 100; i++) {
    if (formData[`${prefix}${i}${titleKey}`]) count = i;
  }
  return count;
}

export default function ContentTab({
  formData, onChange, onMultiChange, onFileChange,
  onOpenSampleModal, onOpenTestimonialModal, onOpenCaseModal, onOpenBlogModal,
  onDeleteSample, onDeleteTestimonial, onDeleteCase, onDeleteBlog,
  templateId,
}: Props) {
  const config = getTemplateConfig(templateId);
  const blocks = config.contentBlocks;
  const isModern = templateId === 'modern-writer-template';
  const isProfessional = templateId === 'professional-writer-template';

  const [customSkill, setCustomSkill] = useState('');
  const selectedSkills = [1, 2, 3, 4, 5, 6].map(n => formData[`skill${n}`]).filter(Boolean);

  // Write the full skill1..6 set in a single update (avoids stale-closure clobber).
  const setSkills = (arr: string[]) => {
    const updates: Record<string, string> = {};
    for (let i = 1; i <= 6; i++) updates[`skill${i}`] = arr[i - 1] || '';
    if (onMultiChange) onMultiChange(updates);
    else for (let i = 1; i <= 6; i++) onChange(`skill${i}`, arr[i - 1] || '');
  };
  const addSkill = (name: string) => {
    const v = name.trim();
    if (!v || selectedSkills.length >= 6) return;
    if (selectedSkills.some(s => s.toLowerCase() === v.toLowerCase())) return;
    setSkills([...selectedSkills, v]);
  };
  const removeSkill = (name: string) => setSkills(selectedSkills.filter(s => s !== name));

  const [totalSamples, setTotalSamples] = useState(() => countItems(formData, 'sample', 'Title'));
  const [totalCases, setTotalCases]     = useState(() => countItems(formData, 'case', 'Title'));
  const [totalBlogs, setTotalBlogs]     = useState(() => countItems(formData, 'blog', 'Title'));

  useEffect(() => {
    setTotalSamples(countItems(formData, 'sample', 'Title'));
    setTotalCases(countItems(formData, 'case', 'Title'));
    setTotalBlogs(countItems(formData, 'blog', 'Title'));
  }, [formData]);

  return (
    <div className="space-y-5">

      {/* ── Hero ─────────────────────────────────────────── */}
      {blocks.includes('hero') && (
        <div className="space-y-4">
          <p className={SECTION_HDR}><User className="w-3.5 h-3.5" />Hero</p>

          {/* Profile image */}
          <div>
            <label className={LABEL}>Profile Image</label>
            {formData.profileImage && (
              <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl mb-2">
                <img src={formData.profileImage} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-stone-200" />
                <div className="flex-1">
                  <p className="text-sm text-stone-700 font-medium">Photo uploaded</p>
                  <p className="text-xs text-stone-400">Click below to replace</p>
                </div>
                <button onClick={() => onChange('profileImage', '')} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            )}
            <label className="block cursor-pointer">
              <div className="w-full bg-stone-50 border-2 border-dashed border-stone-200 hover:border-orange-400 rounded-xl px-4 py-4 text-center transition group">
                <Upload className="w-5 h-5 text-stone-400 group-hover:text-orange-500 mx-auto mb-1 transition" />
                <p className="text-xs text-stone-500 font-medium">{formData.profileImage ? 'Replace photo' : 'Upload profile photo'}</p>
                <p className="text-xs text-stone-400 mt-0.5">PNG, JPG up to 5MB</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange('profileImage', f); }} />
            </label>
          </div>

          <div>
            <label className={LABEL}>Full Name</label>
            <input type="text" value={formData.fullName || ''} onChange={e => onChange('fullName', e.target.value)} className={INPUT} placeholder="Your Name" />
          </div>

          <div>
            <label className={LABEL}>{isModern ? 'Tagline' : 'Headline'}</label>
            <input type="text"
              value={isModern ? (formData.tagline || '') : (formData.headline || '')}
              onChange={e => onChange(isModern ? 'tagline' : 'headline', e.target.value)}
              className={INPUT} placeholder={isModern ? 'Creative Professional' : 'Your Professional Title'} />
          </div>

          <div>
            <label className={LABEL}>Bio</label>
            <textarea value={formData.bio || ''} onChange={e => onChange('bio', e.target.value)} rows={4}
              className={`${INPUT} resize-none builder-scrollbar`} placeholder="Tell visitors about yourself..." />
          </div>

          {isProfessional && (
            <>
              <div>
                <label className={LABEL}>Location <span className="text-stone-400 font-normal normal-case">(optional)</span></label>
                <input type="text" value={formData.location || ''} onChange={e => onChange('location', e.target.value)} className={INPUT} placeholder="San Francisco, CA" />
              </div>
              <div>
                <label className={LABEL}>Opening statement <span className="text-stone-400 font-normal normal-case">(optional)</span></label>
                <textarea value={formData.statement || ''} onChange={e => onChange('statement', e.target.value)} rows={2}
                  className={`${INPUT} resize-none`} placeholder="One bold line that sums up what you do…" />
              </div>
            </>
          )}

          {(isModern || isProfessional) && (
            <div>
              <label className={LABEL}>Resume / CV link <span className="text-stone-400 font-normal normal-case">(optional)</span></label>
              <input type="url" value={formData.resumeUrl || ''} onChange={e => onChange('resumeUrl', e.target.value)} className={INPUT} placeholder="https://link-to-your-resume.pdf" />
            </div>
          )}
        </div>
      )}

      {/* ── Social Links ─────────────────────────────────── */}
      {blocks.includes('social') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><Globe className="w-3.5 h-3.5" />Social Links</p>
          <p className="text-xs text-stone-400 mb-3">Paste any profile or site link — LinkedIn, GitHub, Dribbble, YouTube, your own site, anything. The icon is detected automatically.</p>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map(n => {
              const val = formData[`social${n}`] || '';
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 flex-shrink-0">
                    {val ? <SocialIcon url={val} size={16} /> : <Globe className="w-4 h-4 text-stone-300" />}
                  </span>
                  <input type="url" value={val} onChange={e => onChange(`social${n}`, e.target.value)} className={INPUT} placeholder={n === 1 ? 'https://linkedin.com/in/you' : 'https://…'} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Contact ─────────────────────────────────────── */}
      {blocks.includes('contact') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><Mail className="w-3.5 h-3.5" />Contact</p>
          <label className={LABEL}>Email Address</label>
          <input type="email" value={formData.email || ''} onChange={e => onChange('email', e.target.value)} className={INPUT} placeholder="your@email.com" />
        </div>
      )}

      {/* ── Skills ─────────────────────────────────────── */}
      {blocks.includes('skills') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><Sparkles className="w-3.5 h-3.5" />Skills</p>

          {/* Selected skills (incl. custom) as removable chips */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedSkills.map(s => (
                <button key={s} onClick={() => removeSkill(s)}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-orange-50 border border-orange-300 text-orange-700 text-xs font-medium transition hover:bg-orange-100">
                  <span className="truncate max-w-[140px]">{s}</span>
                  <Trash2 className="w-3 h-3 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Add your own */}
          <div className="flex gap-2 mb-3">
            <input type="text" value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(customSkill); setCustomSkill(''); } }}
              disabled={selectedSkills.length >= 6}
              className={INPUT} placeholder="Add your own skill…" />
            <button type="button" disabled={!customSkill.trim() || selectedSkills.length >= 6}
              onClick={() => { addSkill(customSkill); setCustomSkill(''); }}
              className={`${ADD_BTN} flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>

          {/* Quick-pick suggestions */}
          <p className="text-xs text-stone-400 mb-2">Or pick from suggestions:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {SKILL_OPTIONS.map(skill => {
              const isSelected = selectedSkills.some(s => s === skill.name);
              const canSelect = selectedSkills.length < 6;
              return (
                <button key={skill.name} disabled={!isSelected && !canSelect}
                  onClick={() => isSelected ? removeSkill(skill.name) : addSkill(skill.name)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition ${
                    isSelected ? 'bg-orange-50 border-orange-300 text-orange-700'
                    : canSelect ? 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                    : 'bg-stone-50 border-stone-100 text-stone-300 cursor-not-allowed'
                  }`}>
                  <span className="text-base leading-none">{skill.icon}</span>
                  <span className="flex-1 truncate">{skill.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-400 text-center mt-2">
            {selectedSkills.length} / 6 selected
          </p>
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────── */}
      {blocks.includes('stats') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><TrendingUp className="w-3.5 h-3.5" />Stats</p>
          <p className="text-xs text-stone-400 mb-3">Quick numbers that show your track record. Leave blank to hide.</p>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex gap-2">
                <input type="text" value={formData[`stat${n}Value`] || ''} onChange={e => onChange(`stat${n}Value`, e.target.value)} className={`${INPUT} w-1/3`} placeholder={n === 1 ? '8yrs' : 'Value'} />
                <input type="text" value={formData[`stat${n}Label`] || ''} onChange={e => onChange(`stat${n}Label`, e.target.value)} className={INPUT} placeholder={n === 1 ? 'Experience' : 'Label'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Services ──────────────────────────────────────── */}
      {blocks.includes('services') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><Briefcase className="w-3.5 h-3.5" />Services</p>
          <p className="text-xs text-stone-400 mb-3">What you offer. Leave a slot blank to hide it.</p>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <input type="text" value={formData[`service${n}Title`] || ''} onChange={e => onChange(`service${n}Title`, e.target.value)} className={INPUT} placeholder={`Service ${n} title`} />
                {formData[`service${n}Title`] && (
                  <textarea value={formData[`service${n}Desc`] || ''} onChange={e => onChange(`service${n}Desc`, e.target.value)} rows={2} className={`${INPUT} resize-none`} placeholder="Short description" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Experience ────────────────────────────────────── */}
      {blocks.includes('experience') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><Building2 className="w-3.5 h-3.5" />Experience</p>
          <p className="text-xs text-stone-400 mb-3">Work history. Leave a slot blank to hide it.</p>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <input type="text" value={formData[`exp${n}Role`] || ''} onChange={e => onChange(`exp${n}Role`, e.target.value)} className={INPUT} placeholder={`Role ${n} (e.g. Lead Designer)`} />
                {formData[`exp${n}Role`] && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={formData[`exp${n}Company`] || ''} onChange={e => onChange(`exp${n}Company`, e.target.value)} className={INPUT} placeholder="Company" />
                      <input type="text" value={formData[`exp${n}Period`] || ''} onChange={e => onChange(`exp${n}Period`, e.target.value)} className={INPUT} placeholder="2022 — Now" />
                    </div>
                    <textarea value={formData[`exp${n}Description`] || ''} onChange={e => onChange(`exp${n}Description`, e.target.value)} rows={2} className={`${INPUT} resize-none`} placeholder="What you did there" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ─────────────────────────────────────── */}
      {blocks.includes('education') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><GraduationCap className="w-3.5 h-3.5" />Education &amp; Certifications</p>
          <p className="text-xs text-stone-400 mb-3">Degrees, certifications, or courses. Leave a slot blank to hide it.</p>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <input type="text" value={formData[`edu${n}Title`] || ''} onChange={e => onChange(`edu${n}Title`, e.target.value)} className={INPUT} placeholder={`Degree or certification ${n}`} />
                {formData[`edu${n}Title`] && (
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={formData[`edu${n}School`] || ''} onChange={e => onChange(`edu${n}School`, e.target.value)} className={INPUT} placeholder="School / Issuer" />
                    <input type="text" value={formData[`edu${n}Year`] || ''} onChange={e => onChange(`edu${n}Year`, e.target.value)} className={INPUT} placeholder="Year" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Trusted By ────────────────────────────────────── */}
      {blocks.includes('trusted-by') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><Building2 className="w-3.5 h-3.5" />Trusted By</p>
          <input type="text" value={formData.clients || ''} onChange={e => onChange('clients', e.target.value)} className={INPUT} placeholder="Stripe, Figma, Linear, Vercel" />
          <p className="text-xs text-stone-400 mt-1.5">Company or client names, separated by commas.</p>
        </div>
      )}

      {/* ── Gallery ───────────────────────────────────────── */}
      {blocks.includes('gallery') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><ImageIcon className="w-3.5 h-3.5" />Gallery</p>
          <p className="text-xs text-stone-400 mb-3">Up to 8 images. Great for visual work; leave empty to hide.</p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="relative aspect-square">
                {formData[`gallery${n}`] ? (
                  <>
                    <img src={formData[`gallery${n}`]} alt="" className="w-full h-full object-cover rounded-lg border border-stone-200" />
                    <button onClick={() => onChange(`gallery${n}`, '')} className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-white rounded-md shadow transition">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex items-center justify-center bg-stone-50 border-2 border-dashed border-stone-200 hover:border-orange-300 rounded-lg cursor-pointer transition">
                    <Upload className="w-4 h-4 text-stone-300" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(`gallery${n}`, f); }} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Case Studies ─────────────────────────────────── */}
      {blocks.includes('case-studies') && (
        <div className={DIVIDER}>
          <div className="flex items-center justify-between mb-3">
            <p className={`${SECTION_HDR} mb-0`}><BookOpen className="w-3.5 h-3.5" />Case Studies</p>
            <button onClick={() => onOpenCaseModal(totalCases + 1)} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
          {totalCases === 0 ? (
            <button onClick={() => onOpenCaseModal(1)}
              className="w-full py-6 rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 text-stone-400 hover:text-orange-500 text-sm transition">
              + Add your first case study
            </button>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: totalCases }, (_, i) => i + 1).map(num => {
                if (!formData[`case${num}Title`]) return null;
                return (
                  <div key={num} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl hover:border-stone-300 transition group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{formData[`case${num}Title`]}</p>
                      {formData[`case${num}Client`] && <p className="text-xs text-stone-400 mt-0.5">{formData[`case${num}Client`]}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onOpenCaseModal(num)} className="p-1.5 hover:bg-white rounded-lg transition"><Edit2 className="w-3.5 h-3.5 text-stone-400" /></button>
                      <button onClick={() => onDeleteCase(num)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Blog Articles ─────────────────────────────────── */}
      {blocks.includes('blog') && (
        <div className={DIVIDER}>
          <div className="flex items-center justify-between mb-3">
            <p className={`${SECTION_HDR} mb-0`}><FileText className="w-3.5 h-3.5" />Blog Articles</p>
            <button onClick={() => onOpenBlogModal(totalBlogs + 1)} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
          {totalBlogs === 0 ? (
            <button onClick={() => onOpenBlogModal(1)}
              className="w-full py-6 rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 text-stone-400 hover:text-orange-500 text-sm transition">
              + Add your first article
            </button>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: totalBlogs }, (_, i) => i + 1).map(num => {
                if (!formData[`blog${num}Title`]) return null;
                return (
                  <div key={num} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl hover:border-stone-300 transition group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{formData[`blog${num}Title`]}</p>
                      {formData[`blog${num}Category`] && <p className="text-xs text-stone-400 mt-0.5">{formData[`blog${num}Category`]}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onOpenBlogModal(num)} className="p-1.5 hover:bg-white rounded-lg transition"><Edit2 className="w-3.5 h-3.5 text-stone-400" /></button>
                      <button onClick={() => onDeleteBlog(num)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Specialties ──────────────────────────────────── */}
      {blocks.includes('specialties') && (
        <div className={DIVIDER}>
          <p className={SECTION_HDR}><Sparkles className="w-3.5 h-3.5" />Specialties</p>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(n => (
              <input key={n} type="text" value={formData[`specialty${n}`] || ''}
                onChange={e => onChange(`specialty${n}`, e.target.value)}
                className={INPUT} placeholder={`Specialty ${n}`} />
            ))}
          </div>
        </div>
      )}

      {/* ── Writing Samples ───────────────────────────────── */}
      {blocks.includes('samples') && (
        <div className={DIVIDER}>
          <div className="flex items-center justify-between mb-3">
            <p className={`${SECTION_HDR} mb-0`}><BookOpen className="w-3.5 h-3.5" />Writing Samples</p>
            <button onClick={() => onOpenSampleModal(totalSamples + 1)} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
          {totalSamples === 0 ? (
            <button onClick={() => onOpenSampleModal(1)}
              className="w-full py-6 rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 text-stone-400 hover:text-orange-500 text-sm transition">
              + Add your first writing sample
            </button>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: totalSamples }, (_, i) => i + 1).map(num => {
                if (!formData[`sample${num}Title`]) return null;
                return (
                  <div key={num} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl hover:border-stone-300 transition group">
                    {formData[`sample${num}Image`]
                      ? <img src={formData[`sample${num}Image`]} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0" />
                      : <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-lg flex-shrink-0">📄</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{formData[`sample${num}Title`]}</p>
                      {formData[`sample${num}Type`] && <p className="text-xs text-stone-400 mt-0.5">{formData[`sample${num}Type`]}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onOpenSampleModal(num)} className="p-1.5 hover:bg-white rounded-lg transition"><Edit2 className="w-3.5 h-3.5 text-stone-400" /></button>
                      <button onClick={() => onDeleteSample(num)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Testimonials ─────────────────────────────────── */}
      {blocks.includes('testimonials') && (
        <div className={DIVIDER}>
          <div className="flex items-center justify-between mb-3">
            <p className={`${SECTION_HDR} mb-0`}><MessageSquare className="w-3.5 h-3.5" />Testimonials</p>
            <button
              onClick={() => { const slot = [1, 2, 3].find(n => !formData[`testimonial${n}`]); onOpenTestimonialModal(slot || 1); }}
              className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
          {![1, 2, 3].some(n => formData[`testimonial${n}`]) ? (
            <div className="py-6 text-center text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-xl">
              No testimonials yet
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3].map(num => formData[`testimonial${num}`] ? (
                <div key={num} className="flex items-start gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl hover:border-stone-300 transition group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-600 line-clamp-2">"{formData[`testimonial${num}`]}"</p>
                    <p className="text-xs text-stone-400 font-medium mt-1">{formData[`testimonial${num}Author`] || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => onOpenTestimonialModal(num)} className="p-1.5 hover:bg-white rounded-lg transition"><Edit2 className="w-3.5 h-3.5 text-stone-400" /></button>
                    <button onClick={e => { e.stopPropagation(); onDeleteTestimonial(num); }} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
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
