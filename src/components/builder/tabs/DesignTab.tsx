import { Palette, Moon } from 'lucide-react';
import { COLOR_PRESETS } from '../builder.config';

interface Props {
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  templateId: string;
}

export default function DesignTab({ formData, onChange, templateId }: Props) {
  const isModern = templateId === 'modern-writer-template';

  return (
    <div className="space-y-6">
      {isModern && (
        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Moon className="w-4 h-4" />Default Theme
              </h3>
              <p className="text-xs text-slate-500 mt-1">Choose the initial theme when the page loads</p>
            </div>
            <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
              {(['light', 'dark'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => onChange('defaultTheme', mode)}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition ${
                    (formData.defaultTheme === mode || (!formData.defaultTheme && mode === 'light'))
                      ? mode === 'light' ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'light' ? '☀️ Light' : '🌙 Dark'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(['primary', 'accent'] as const).map(type => (
        <div key={type}>
          <label className="block text-sm font-bold text-slate-300 mb-3 capitalize">{type} Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              value={formData[`${type}Color`] || '#6366f1'}
              onChange={e => onChange(`${type}Color`, e.target.value)}
              className="w-14 h-14 rounded-xl border-2 border-slate-700 cursor-pointer"
            />
            <input
              type="text"
              value={formData[`${type}Color`] || '#6366f1'}
              onChange={e => onChange(`${type}Color`, e.target.value)}
              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      ))}

      <div className="pt-6 border-t border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />Color Presets
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => { onChange('primaryColor', preset.primary); onChange('accentColor', preset.accent); }}
              className="relative p-4 rounded-xl border-2 border-slate-700 hover:border-yellow-400 transition overflow-hidden group"
              style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }}
            >
              <span className="relative z-10 text-white text-xs font-bold drop-shadow-lg">{preset.name}</span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
