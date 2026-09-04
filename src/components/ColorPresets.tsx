import { COLOR_PRESETS } from './builder/builder.config';

type Field = { name: string; type: string };

/**
 * Colour presets, shared by the create form and the edit form.
 *
 * The swatch shows ONLY the colours this template will actually use. Templates declare
 * different colour fields — trader-template has `primaryColor` alone, professional-writer
 * has both `primaryColor` and `accentColor` — so a fixed two-tone swatch promised a pair
 * and then applied half of it on the Journal. A solid swatch for single-colour templates
 * keeps the choice and the result the same thing.
 */
export default function ColorPresets({
  fields,
  formData,
  onApply,
}: {
  fields: Field[];
  formData: Record<string, any>;
  onApply: (patch: Record<string, string>) => void;
}) {
  const names = new Set((fields || []).filter((f) => f.type === 'color').map((f) => f.name));
  const hasPrimary = names.has('primaryColor');
  const hasAccent = names.has('accentColor');
  if (!hasPrimary && !hasAccent) return null;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <h2 className="font-bold text-stone-900 text-sm mb-1">🎨 Colour</h2>
      <p className="text-stone-400 text-xs mb-4">
        Tap one, or set an exact colour below.
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {COLOR_PRESETS.map((p) => {
          const patch: Record<string, string> = {};
          if (hasPrimary) patch.primaryColor = p.primary;
          if (hasAccent) patch.accentColor = p.accent;

          // Selected only when every colour this template uses matches the preset —
          // otherwise two presets sharing a primary would both look chosen.
          const active = Object.entries(patch).every(([k, v]) =>
            String(formData?.[k] || '').toLowerCase() === v.toLowerCase()
          );

          // Split only when the template really uses both colours.
          const background = hasPrimary && hasAccent
            ? `linear-gradient(135deg, ${p.primary} 50%, ${p.accent} 50%)`
            : (hasPrimary ? p.primary : p.accent);

          return (
            <button
              key={p.name}
              type="button"
              onClick={() => onApply(patch)}
              title={p.name}
              aria-label={p.name}
              aria-pressed={active}
              className={`aspect-square rounded-xl border-2 transition ${
                active ? 'border-stone-900 scale-95' : 'border-transparent hover:border-stone-300'
              }`}
              style={{ background }}
            />
          );
        })}
      </div>
    </div>
  );
}
