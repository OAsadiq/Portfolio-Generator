import { X, Check, Upload, Trash2 } from 'lucide-react';

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

const INPUT = 'w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition';

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
  const currentImage = formData[`sample${currentSample}Image`];
  const p = (k: string) => `sample${currentSample}${k}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold">Edit Sample #{currentSample}</h3>
            <p className="text-sm text-slate-400 mt-1">Add your writing sample details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title <span className="text-red-400">*</span></label>
            <input type="text" value={formData[p('Title')] || ''} onChange={e => onChange(p('Title'), e.target.value)} className={INPUT} placeholder="e.g., How AI is Transforming Marketing" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Type</label>
            <select value={formData[p('Type')] || ''} onChange={e => onChange(p('Type'), e.target.value)} className={`${INPUT} cursor-pointer`}>
              {SAMPLE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.emoji ? `${t.emoji} ${t.value}` : t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Cover Image (Optional)</label>
            {currentImage ? (
              <div className="relative">
                <img src={currentImage} alt="Sample cover" className="w-full h-48 object-cover rounded-xl border-2 border-slate-700" />
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
                  onChange={e => onFileChange && onFileChange(p('Image'), e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Short Description</label>
            <textarea value={formData[p('Description')] || ''} onChange={e => onChange(p('Description'), e.target.value)} rows={3}
              className={`${INPUT} resize-none custom-scrollbar`} placeholder="A brief summary that appears on the card..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Full Content (Optional)</label>
            <textarea value={formData[p('Content')] || ''} onChange={e => onChange(p('Content'), e.target.value)} rows={6}
              className={`${INPUT} resize-none custom-scrollbar`} placeholder="Full article content that will appear in a modal..." />
            <p className="text-xs text-slate-500 mt-1">If provided, a "Read Sample" button will be shown</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">External Link (Optional)</label>
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
