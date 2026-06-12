import { Settings, Globe, Sparkles } from 'lucide-react';

export default function SettingsTab() {
  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
        <Settings className="w-3.5 h-3.5" />Settings
      </p>

      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Globe className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">Auto-published</p>
          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">Every save goes live to your portfolio URL instantly — no extra steps.</p>
        </div>
      </div>

      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">Pro Tip</p>
          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">Connect a custom domain from your dashboard to make your portfolio truly yours.</p>
        </div>
      </div>
    </div>
  );
}
