import { Palette } from 'lucide-react';
import { COLOR_PRESETS } from '../builder.config';

interface Props {
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onMultiChange?: (updates: Record<string, string>) => void;
  templateId: string;
}

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition';

export default function DesignTab({ formData, onChange, onMultiChange, templateId }: Props) {
  const isModern = templateId === 'modern-writer-template';

  return (
    <div className="space-y-6">

      {/* Theme toggle — Modern only */}
      {isModern && (
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Default Theme</label>
          <div className="grid grid-cols-2 gap-2">
            {(['light', 'dark'] as const).map(mode => {
              const active = formData.defaultTheme === mode || (!formData.defaultTheme && mode === 'light');
              return (
                <button key={mode} onClick={() => onChange('defaultTheme', mode)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition ${
                    active
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}>
                  {mode === 'light' ? '☀️ Light' : '🌙 Dark'}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-400 mt-2">Choose the initial theme when the portfolio loads</p>
        </div>
      )}

      {/* Availability — Modern only */}
      {isModern && (
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Availability</label>
          <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
            <div>
              <p className="text-sm font-medium text-stone-700">Available for work badge</p>
              <p className="text-xs text-stone-400">Show a green "available" pill in your hero</p>
            </div>
            <button
              type="button"
              onClick={() => onChange('availability', formData.availability === 'true' ? '' : 'true')}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${formData.availability === 'true' ? 'bg-emerald-500' : 'bg-stone-300'}`}
              aria-pressed={formData.availability === 'true'}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.availability === 'true' ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          {formData.availability === 'true' && (
            <input type="text" value={formData.availabilityText || ''} onChange={e => onChange('availabilityText', e.target.value)}
              className={`${INPUT} mt-2`} placeholder="Available for work" />
          )}
        </div>
      )}

      {/* Primary color */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Primary Color</label>
        <div className="flex gap-2 items-center">
          <input type="color" value={formData.primaryColor || '#6366f1'}
            onChange={e => onChange('primaryColor', e.target.value)}
            className="w-11 h-11 rounded-xl border-2 border-stone-200 cursor-pointer flex-shrink-0 p-0.5" />
          <input type="text" value={formData.primaryColor || '#6366f1'}
            onChange={e => onChange('primaryColor', e.target.value)}
            className={`${INPUT} font-mono`} />
        </div>
      </div>

      {/* Accent color */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Accent Color</label>
        <div className="flex gap-2 items-center">
          <input type="color" value={formData.accentColor || '#ec4899'}
            onChange={e => onChange('accentColor', e.target.value)}
            className="w-11 h-11 rounded-xl border-2 border-stone-200 cursor-pointer flex-shrink-0 p-0.5" />
          <input type="text" value={formData.accentColor || '#ec4899'}
            onChange={e => onChange('accentColor', e.target.value)}
            className={`${INPUT} font-mono`} />
        </div>
      </div>

      {/* Presets */}
      <div className="pt-4 border-t border-stone-100">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />Color Presets
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PRESETS.map(preset => (
            <button key={preset.name}
              onClick={() => onMultiChange
                ? onMultiChange({ primaryColor: preset.primary, accentColor: preset.accent })
                : onChange('primaryColor', preset.primary)}
              className="relative py-3 px-2 rounded-xl border-2 border-transparent hover:border-stone-300 transition overflow-hidden group"
              style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }}>
              <span className="relative z-10 text-white text-xs font-bold drop-shadow">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
