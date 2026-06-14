import { X } from 'lucide-react';

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition';
const LABEL = 'block text-xs font-semibold text-stone-600 mb-1.5';

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
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-md animate-slideUp">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900">Testimonial #{currentTestimonial}</h3>
            <p className="text-xs text-stone-500 mt-0.5">Add client feedback</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition"><X className="w-4 h-4 text-stone-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={LABEL}>Testimonial <span className="text-red-500">*</span></label>
            <textarea value={formData[`testimonial${currentTestimonial}`] || ''} onChange={e => onChange(`testimonial${currentTestimonial}`, e.target.value)}
              rows={5} className={`${INPUT} resize-none`} placeholder="What did the client say about working with you?" />
          </div>
          <div>
            <label className={LABEL}>Name <span className="text-red-500">*</span></label>
            <input type="text" value={formData[p('Author')] || ''} onChange={e => onChange(p('Author'), e.target.value)} className={INPUT} placeholder="Michael Chen" />
          </div>
          <div>
            <label className={LABEL}>Role / Company</label>
            <input type="text" value={formData[p('Role')] || ''} onChange={e => onChange(p('Role'), e.target.value)} className={INPUT} placeholder="Marketing Director, TechCorp" />
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
