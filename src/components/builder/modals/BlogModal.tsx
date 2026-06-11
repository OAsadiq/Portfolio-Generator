import { X, Check } from 'lucide-react';

const INPUT = 'w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition';

interface Props {
  isOpen: boolean;
  currentBlog: number;
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onClose: () => void;
}

export default function BlogModal({ isOpen, currentBlog, formData, onChange, onClose }: Props) {
  if (!isOpen) return null;
  const p = (k: string) => `blog${currentBlog}${k}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold">Edit Blog Article #{currentBlog}</h3>
            <p className="text-sm text-slate-400 mt-1">Add your blog article details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title <span className="text-red-400">*</span></label>
            <input type="text" value={formData[p('Title')] || ''} onChange={e => onChange(p('Title'), e.target.value)} className={INPUT} placeholder="e.g., The Future of Web Design" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Excerpt</label>
            <textarea value={formData[p('Excerpt')] || ''} onChange={e => onChange(p('Excerpt'), e.target.value)} rows={3}
              className={`${INPUT} resize-none custom-scrollbar`} placeholder="A brief summary of the article..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Category</label>
              <input type="text" value={formData[p('Category')] || ''} onChange={e => onChange(p('Category'), e.target.value)} className={INPUT} placeholder="Design" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Date</label>
              <input type="text" value={formData[p('Date')] || ''} onChange={e => onChange(p('Date'), e.target.value)} className={INPUT} placeholder="Jan 15, 2026" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Read Time (min)</label>
              <input type="text" value={formData[p('ReadTime')] || ''} onChange={e => onChange(p('ReadTime'), e.target.value)} className={INPUT} placeholder="5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Article Link (Optional)</label>
            <input type="url" value={formData[p('Link')] || ''} onChange={e => onChange(p('Link'), e.target.value)} className={INPUT} placeholder="https://example.com/your-article" />
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
