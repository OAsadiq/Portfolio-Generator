import { X, Upload, Trash2 } from 'lucide-react';

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition';
const LABEL = 'block text-xs font-semibold text-stone-600 mb-1.5';

interface Props {
  isOpen: boolean;
  currentCase: number;
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onFileChange?: (field: string, file: File) => void;
  onClose: () => void;
}

export default function CaseStudyModal({ isOpen, currentCase, formData, onChange, onFileChange, onClose }: Props) {
  if (!isOpen) return null;
  const p = (k: string) => `case${currentCase}${k}`;
  const currentImage = formData[p('Image')];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto builder-scrollbar animate-slideUp">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900">Case Study #{currentCase}</h3>
            <p className="text-xs text-stone-500 mt-0.5">Add your case study details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition"><X className="w-4 h-4 text-stone-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={LABEL}>Cover Image (Optional)</label>
            {currentImage ? (
              <div className="relative rounded-xl overflow-hidden border border-stone-200">
                <img src={currentImage} alt="Cover" className="w-full h-40 object-cover" />
                <button onClick={() => onChange(p('Image'), '')} className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="w-full bg-stone-50 border-2 border-dashed border-stone-200 hover:border-orange-400 rounded-xl py-6 text-center transition group">
                  <Upload className="w-5 h-5 text-stone-400 group-hover:text-orange-500 mx-auto mb-1 transition" />
                  <p className="text-xs text-stone-500 font-medium">Click to upload</p>
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f && onFileChange) onFileChange(p('Image'), f); }} />
              </label>
            )}
          </div>

          <div>
            <label className={LABEL}>Title <span className="text-red-500">*</span></label>
            <input type="text" value={formData[p('Title')] || ''} onChange={e => onChange(p('Title'), e.target.value)} className={INPUT} placeholder="e.g., Feature Series: The Future of Work" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Client <span className="text-red-500">*</span></label>
              <input type="text" value={formData[p('Client')] || ''} onChange={e => onChange(p('Client'), e.target.value)} className={INPUT} placeholder="TechVenture Magazine" />
            </div>
            <div>
              <label className={LABEL}>Role</label>
              <input type="text" value={formData[p('Role')] || ''} onChange={e => onChange(p('Role'), e.target.value)} className={INPUT} placeholder="Contributing Writer" />
            </div>
          </div>

          <div>
            <label className={LABEL}>Description</label>
            <textarea value={formData[p('Description')] || ''} onChange={e => onChange(p('Description'), e.target.value)} rows={3}
              className={`${INPUT} resize-none`} placeholder="Brief summary shown on the card..." />
          </div>

          <div>
            <label className={LABEL}>🎯 Challenge (Optional)</label>
            <textarea value={formData[p('Challenge')] || ''} onChange={e => onChange(p('Challenge'), e.target.value)} rows={2}
              className={`${INPUT} resize-none`} placeholder="What was the main challenge?" />
          </div>

          <div>
            <label className={LABEL}>💡 Solution (Optional)</label>
            <textarea value={formData[p('Solution')] || ''} onChange={e => onChange(p('Solution'), e.target.value)} rows={2}
              className={`${INPUT} resize-none`} placeholder="How did you approach and solve it?" />
          </div>

          <div>
            <label className={LABEL}>📊 Results (Optional)</label>
            <textarea value={formData[p('Results')] || ''} onChange={e => onChange(p('Results'), e.target.value)} rows={2}
              className={`${INPUT} resize-none`} placeholder="What were the outcomes and impact?" />
          </div>

          <div>
            <label className={LABEL}>Tags (comma separated)</label>
            <input type="text" value={formData[p('Tags')] || ''} onChange={e => onChange(p('Tags'), e.target.value)} className={INPUT} placeholder="Journalism, Research, Interview" />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-stone-100">
          <button onClick={onClose} className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-700 text-white rounded-xl text-sm font-semibold transition">Done</button>
          <button onClick={onClose} className="px-4 py-2.5 border border-stone-200 hover:border-stone-300 text-stone-600 rounded-xl text-sm font-medium transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}
