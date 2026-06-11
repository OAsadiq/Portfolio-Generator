import { Settings, Sparkles, Globe } from 'lucide-react';

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />Settings
        </h3>

        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Auto-published</p>
              <p className="text-xs text-slate-400">Every save goes live to your portfolio URL instantly.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-300 mb-1">Pro Tip</p>
            <p className="text-xs text-blue-200/80">Connect a custom domain from your dashboard to make your portfolio truly yours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
