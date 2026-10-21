import { useState } from 'react';
import { PRESET_TAGS, POSITIVE_TAG, isNegative, normalizeTag, MAX_CUSTOM_TAG_LENGTH } from '../../api/_lib/tags.js';

/**
 * Execution tags on the trade form.
 *
 * Tagging is never required — an untagged trade saves fine and is simply invisible to the
 * Execution Score. That's deliberate: a required field here would get satisfied with
 * whatever's quickest, and a score built on careless input is worse than no score.
 *
 * Reflection usually happens after a trade closes, so the same picker appears on the edit
 * form and tags can be changed at any time.
 */

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Custom tags this user has already used, offered for re-selection. */
  suggestions?: string[];
  disabled?: boolean;
}

export default function TagPicker({ value, onChange, suggestions = [], disabled = false }: Props) {
  const [draft, setDraft] = useState('');
  const selected = Array.isArray(value) ? value : [];

  const has = (tag: string) => selected.some((t) => t.toLowerCase() === tag.toLowerCase());

  const toggle = (tag: string) => {
    if (disabled) return;
    onChange(has(tag) ? selected.filter((t) => t.toLowerCase() !== tag.toLowerCase()) : [...selected, tag]);
  };

  const addDraft = () => {
    const tag = normalizeTag(draft);
    setDraft('');
    // normalizeTag maps a typed preset back onto the real preset, so "fomo entry" selects
    // the FOMO entry chip instead of creating a neutral custom that the score ignores.
    if (!tag || has(tag)) return;
    onChange([...selected, tag]);
  };

  // Customs the user picked or typed, shown after the presets.
  const customs = selected.filter((t) => !PRESET_TAGS.some((p) => p.toLowerCase() === t.toLowerCase()));
  const unusedSuggestions = suggestions.filter(
    (s) => !has(s) && !PRESET_TAGS.some((p) => p.toLowerCase() === s.toLowerCase()),
  );

  const chip = (tag: string, kind: 'positive' | 'negative' | 'custom') => {
    const on = has(tag);
    const palette = on
      ? kind === 'positive'
        ? 'bg-emerald-600 border-emerald-600 text-white'
        : kind === 'negative'
        ? 'bg-red-500 border-red-500 text-white'
        : 'bg-stone-900 border-stone-900 text-white'
      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300';
    return (
      <button
        key={tag}
        type="button"
        onClick={() => toggle(tag)}
        disabled={disabled}
        aria-pressed={on}
        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition disabled:opacity-50 ${palette}`}
      >
        {tag}
      </button>
    );
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
        How did you execute? <span className="text-stone-400 normal-case font-normal tracking-normal">— optional</span>
      </label>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {chip(POSITIVE_TAG, 'positive')}
        {PRESET_TAGS.filter(isNegative).map((t) => chip(t, 'negative'))}
      </div>

      {(customs.length > 0 || unusedSuggestions.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {customs.map((t) => chip(t, 'custom'))}
          {unusedSuggestions.slice(0, 8).map((t) => chip(t, 'custom'))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, MAX_CUSTOM_TAG_LENGTH))}
        onKeyDown={(e) => {
          // Enter adds a tag; it must not submit the trade form.
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addDraft(); }
        }}
        onBlur={addDraft}
        disabled={disabled}
        placeholder="Add your own tag, then press Enter"
        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
      />

      <p className="text-stone-400 text-[11px] mt-1.5 leading-relaxed">
        Your own tags are for filtering — only the preset ones count toward your execution score.
      </p>
    </div>
  );
}
