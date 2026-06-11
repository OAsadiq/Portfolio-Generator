import { X, Check, Upload, Trash2 } from 'lucide-react';

const INPUT = 'w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition';

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
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold">Edit Case Study #{currentCase}</h3>
            <p className="text-sm text-slate-400 mt-1">Add your case study details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Cover Image (Optional)</label>
            {currentImage ? (
              <div className="relative">
                <img src={currentImage} alt="Cover" className="w-full h-48 object-cover rounded-xl border-2 border-slate-700" />
                <button onClick={() => onChange(p('Image'), '')} className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-yellow-400 transition bg-slate-900/30">
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-sm text-slate-400">Click to upload image</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f && onFileChange) onFileChange(p('Image'), f); }} />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title <span className="text-red-400">*</span></label>
            <input type="text" value={formData[p('Title')] || ''} onChange={e => onChange(p('Title'), e.target.value)} className={INPUT} placeholder="e.g., Feature Series: The Future of Work" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Client <span className="text-red-400">*</span></label>
              <input type="text" value={formData[p('Client')] || ''} onChange={e => onChange(p('Client'), e.target.value)} className={INPUT} placeholder="e.g., TechVenture Magazine" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Role</label>
              <input type="text" value={formData[p('Role')] || ''} onChange={e => onChange(p('Role'), e.target.value)} className={INPUT} placeholder="e.g., Contributing Writer" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
            <textarea value={formData[p('Description')] || ''} onChange={e => onChange(p('Description'), e.target.value)} rows={3}
              className={`${INPUT} resize-none custom-scrollbar`} placeholder="Brief summary that appears on the card..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">🎯 Challenge (Optional)</label>
            <textarea value={formData[p('Challenge')] || ''} onChange={e => onChange(p('Challenge'), e.target.value)} rows={3}
              className={`${INPUT} resize-none custom-scrollbar`} placeholder="What was the main challenge or problem?" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">💡 Solution (Optional)</label>
            <textarea value={formData[p('Solution')] || ''} onChange={e => onChange(p('Solution'), e.target.value)} rows={3}
              className={`${INPUT} resize-none custom-scrollbar`} placeholder="How did you approach and solve it?" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">📊 Results (Optional)</label>
            <textarea value={formData[p('Results')] || ''} onChange={e => onChange(p('Results'), e.target.value)} rows={3}
              className={`${INPUT} resize-none custom-scrollbar`} placeholder="What were the outcomes and impact?" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Tags (Optional)</label>
            <input type="text" value={formData[p('Tags')] || ''} onChange={e => onChange(p('Tags'), e.target.value)} className={INPUT} placeholder="e.g., Journalism, Research, Interview (comma separated)" />
            <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2 transition">
              <Check className="w-5 h-5" />Done
            </button>
            <button onClick={onClose} className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold transition">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
