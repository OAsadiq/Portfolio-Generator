import { X } from 'lucide-react';

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition';
const LABEL = 'block text-xs font-semibold text-stone-600 mb-1.5';

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
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto builder-scrollbar animate-slideUp">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900">Blog Article #{currentBlog}</h3>
            <p className="text-xs text-stone-500 mt-0.5">Add your article details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition"><X className="w-4 h-4 text-stone-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={LABEL}>Title <span className="text-red-500">*</span></label>
            <input type="text" value={formData[p('Title')] || ''} onChange={e => onChange(p('Title'), e.target.value)} className={INPUT} placeholder="e.g., The Future of Web Design" />
          </div>

          <div>
            <label className={LABEL}>Excerpt</label>
            <textarea value={formData[p('Excerpt')] || ''} onChange={e => onChange(p('Excerpt'), e.target.value)} rows={3}
              className={`${INPUT} resize-none`} placeholder="A brief summary of the article..." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Category</label>
              <input type="text" value={formData[p('Category')] || ''} onChange={e => onChange(p('Category'), e.target.value)} className={INPUT} placeholder="Design" />
            </div>
            <div>
              <label className={LABEL}>Date</label>
              <input type="text" value={formData[p('Date')] || ''} onChange={e => onChange(p('Date'), e.target.value)} className={INPUT} placeholder="Jan 15, 2026" />
            </div>
            <div>
              <label className={LABEL}>Read Time</label>
              <input type="text" value={formData[p('ReadTime')] || ''} onChange={e => onChange(p('ReadTime'), e.target.value)} className={INPUT} placeholder="5 min" />
            </div>
          </div>

          <div>
            <label className={LABEL}>Article Link (Optional)</label>
            <input type="url" value={formData[p('Link')] || ''} onChange={e => onChange(p('Link'), e.target.value)} className={INPUT} placeholder="https://example.com/your-article" />
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
