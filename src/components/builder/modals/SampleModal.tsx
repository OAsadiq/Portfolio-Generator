import { X, Upload, Trash2 } from 'lucide-react';

const SAMPLE_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'Blog Post', emoji: '📝' },
  { value: 'Case Study', emoji: '📊' },
  { value: 'White Paper', emoji: '📄' },
  { value: 'Article', emoji: '✍️' },
  { value: 'Email Campaign', emoji: '📧' },
  { value: 'Social Media', emoji: '📱' },
  { value: 'Newsletter', emoji: '📮' },
  { value: 'Press Release', emoji: '📰' },
  { value: 'eBook', emoji: '📚' },
  { value: 'Guide', emoji: '🗺️' },
  { value: 'Tutorial', emoji: '💡' },
  { value: 'Research', emoji: '🔬' },
  { value: 'Report', emoji: '📈' },
  { value: 'Landing Page', emoji: '🎯' },
  { value: 'Product Description', emoji: '🏷️' },
  { value: 'Script', emoji: '🎬' },
  { value: 'Technical Documentation', emoji: '⚙️' },
  { value: 'User Manual', emoji: '📖' },
];

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition';
const LABEL = 'block text-xs font-semibold text-stone-600 mb-1.5';

interface Props {
  isOpen: boolean;
  currentSample: number;
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onFileChange?: (field: string, file: File | null) => void;
  onClose: () => void;
}

export default function SampleModal({ isOpen, currentSample, formData, onChange, onFileChange, onClose }: Props) {
  if (!isOpen) return null;
  const p = (k: string) => `sample${currentSample}${k}`;
  const currentImage = formData[p('Image')];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto builder-scrollbar animate-slideUp">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900">Writing Sample #{currentSample}</h3>
            <p className="text-xs text-stone-500 mt-0.5">Add your writing sample details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition"><X className="w-4 h-4 text-stone-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={LABEL}>Title <span className="text-red-500">*</span></label>
            <input type="text" value={formData[p('Title')] || ''} onChange={e => onChange(p('Title'), e.target.value)} className={INPUT} placeholder="e.g., How AI is Transforming Marketing" />
          </div>

          <div>
            <label className={LABEL}>Type</label>
            <select value={formData[p('Type')] || ''} onChange={e => onChange(p('Type'), e.target.value)} className={`${INPUT} cursor-pointer`}>
              {SAMPLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji ? `${t.emoji} ${t.value}` : t.label}</option>)}
            </select>
          </div>

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
                  <p className="text-xs text-stone-400 mt-0.5">PNG, JPG up to 5MB</p>
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => onFileChange && onFileChange(p('Image'), e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

          <div>
            <label className={LABEL}>Short Description</label>
            <textarea value={formData[p('Description')] || ''} onChange={e => onChange(p('Description'), e.target.value)} rows={3}
              className={`${INPUT} resize-none`} placeholder="A brief summary that appears on the card..." />
          </div>

          <div>
            <label className={LABEL}>Full Content (Optional)</label>
            <textarea value={formData[p('Content')] || ''} onChange={e => onChange(p('Content'), e.target.value)} rows={5}
              className={`${INPUT} resize-none`} placeholder="Full article content shown in a modal when someone clicks 'Read Sample'..." />
          </div>

          <div>
            <label className={LABEL}>External Link (Optional)</label>
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
