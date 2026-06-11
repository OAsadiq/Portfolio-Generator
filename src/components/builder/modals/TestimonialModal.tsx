import { X, Check } from 'lucide-react';

const INPUT = 'w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400';

interface Props {
  isOpen: boolean;
  currentTestimonial: number;
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onClose: () => void;
}

export default function TestimonialModal({ isOpen, currentTestimonial, formData, onChange, onClose }: Props) {
  if (!isOpen) return null;
  const p = (k: string) => `testimonial${currentTestimonial}${k}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full animate-slideUp">
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold">Edit Testimonial #{currentTestimonial}</h3>
            <p className="text-sm text-slate-400 mt-1">Add client feedback</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Testimonial <span className="text-red-400">*</span></label>
            <textarea value={formData[`testimonial${currentTestimonial}`] || ''} onChange={e => onChange(`testimonial${currentTestimonial}`, e.target.value)}
              rows={5} className={`${INPUT} resize-none custom-scrollbar`} placeholder="What did the client say?" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Name <span className="text-red-400">*</span></label>
            <input type="text" value={formData[p('Author')] || ''} onChange={e => onChange(p('Author'), e.target.value)} className={INPUT} placeholder="Michael Chen" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Role / Company</label>
            <input type="text" value={formData[p('Role')] || ''} onChange={e => onChange(p('Role'), e.target.value)} className={INPUT} placeholder="Marketing Director, TechCorp" />
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
