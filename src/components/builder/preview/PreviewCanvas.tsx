import { useMemo } from 'react';
import { SectionItem } from '../builder.config';
import { renderProfessionalSection, renderProfessionalSidebar, renderProfessionalHeader } from './ProfessionalTemplate';
import { renderModernSection } from './ModernTemplate';
// The trader preview renders the REAL published output rather than a React re-creation.
// The other two templates keep a hand-written React copy of their design here, which has
// to be updated in lockstep with the server renderer or the preview quietly lies. Feeding
// generateHTML straight into an iframe makes that class of drift impossible.
import traderTemplate from '../../../../api/templates/trader-template/_index.js';

interface Props {
  formData: Record<string, string>;
  previewMode: string;
  sections: SectionItem[];
  templateId: string;
}

// A representative rising equity curve (with a dip + recovery) for the builder preview.
// Deterministic and illustrative — the trader's real chart comes from their journal at
// publish time. Only used to show the chart's shape while editing page content.
const SAMPLE_CURVE = (() => {
  const pts: { t: string; equity: number }[] = [];
  let v = 10000, seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 90; i++) {
    let drift = 0.004;
    if (i > 40 && i < 52) drift = -0.011;       // a drawdown
    else if (i >= 52 && i < 66) drift = 0.010;  // the recovery
    v = v * (1 + drift + (rnd() - 0.45) * 0.01);
    pts.push({ t: new Date(2025, 9, 1 + i * 2).toISOString(), equity: Math.round(v) });
  }
  return pts;
})();

export default function PreviewCanvas({ formData, previewMode, sections, templateId }: Props) {
  const isMobile = previewMode === 'mobile';
  const isTablet = previewMode === 'tablet';
  const isDesktop = previewMode === 'desktop';
  const isModern = templateId === 'modern-writer-template';
  const isProfessional = templateId === 'professional-writer-template';
  const isTrader = templateId === 'trader-template';

  const visibleSections = sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  const widthClass = isDesktop ? 'w-full max-w-7xl mx-auto' : isTablet ? 'w-[768px] mx-auto' : 'w-[375px] mx-auto';

  // Recomputed only when content actually changes, so typing doesn't reload the frame
  // on every keystroke.
  const traderHtml = useMemo(() => {
    if (!isTrader) return '';
    // The builder edits page CONTENT, not the journal — so it has no real metrics.
    // Feed a representative equity curve so the trader sees the chart + design while
    // editing. It's curve-ONLY (no metric values), so the numbers still come from the
    // trader's own typed figures — only the chart shape is illustrative. The publish
    // route uses their real journal data.
    const meta = {
      slug: 'preview',
      journalEnabled: true,
      metricsCache: { curve: SAMPLE_CURVE },
    };
    return traderTemplate.generateHTML(formData, sections, meta);
  }, [isTrader, formData, sections]);

  // ── Trader: the real page, in a frame ──
  if (isTrader) {
    return (
      <div className="flex-1 p-6 bg-stone-100 flex">
        <iframe
          title="Trader portfolio preview"
          srcDoc={traderHtml}
          // sandbox="" blocks scripts: the page's contact form must not actually fire
          // while a trader is editing. Styles and layout render normally.
          sandbox=""
          className={`${widthClass} h-full border-0 rounded-sm bg-[#08080a] shadow-sm`}
        />
      </div>
    );
  }

  // ── Professional: split sidebar layout ──
  if (isProfessional) {
    const pc = formData.primaryColor || '#475569';
    const ac = formData.accentColor || '#1e293b';
    const proVars = {
      '--primary': pc, '--accent': ac, '--pop': '#0d9488',
      '--grad': `linear-gradient(135deg, ${pc}, ${ac})`,
      '--bg': '#ffffff', '--bg-2': '#f8fafc',
      '--text': '#0f172a', '--text-2': '#64748b', '--border': '#e9edf2',
      backgroundColor: '#ffffff',
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(100,116,139,0.10) 1px, transparent 0)',
      backgroundSize: '22px 22px',
    } as React.CSSProperties;

    const isStacked = (formData.layout || 'stacked') !== 'sidebar';
    const credit = (
      <p style={{ paddingTop: '2rem', fontSize: '.8rem', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
        Made with <a href="https://porfilr.com" style={{ color: pc, textDecoration: 'none', fontWeight: 600 }}>Porfilr</a>
      </p>
    );

    return (
      <div className="flex-1 overflow-auto p-6 bg-stone-100">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');`}</style>
        <div className={`transition-all duration-500 ${widthClass} overflow-hidden rounded-sm`} style={proVars}>
          {isStacked ? (
            <div>
              {renderProfessionalHeader(formData, isMobile)}
              <main style={{ maxWidth: 760, margin: '0 auto', padding: isMobile ? '0 1.25rem 2rem' : '0 2rem 2rem' }}>
                {visibleSections.map(s => renderProfessionalSection(s.id, formData, isMobile))}
                {credit}
              </main>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr' }}>
              {renderProfessionalSidebar(formData, isMobile)}
              <main style={{ padding: isMobile ? '1.25rem 1.25rem 2.5rem' : '2.5rem 3rem' }}>
                {formData.statement && (
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: isMobile ? '1.5rem' : '2.2rem', fontWeight: 500, lineHeight: 1.18, letterSpacing: '-0.02em', color: 'var(--text, #0f172a)', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border, #e9edf2)' }}>
                    {formData.statement}
                  </p>
                )}
                {visibleSections.map(s => renderProfessionalSection(s.id, formData, isMobile))}
                {credit}
              </main>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Modern: single-column ──
  const NUMBERED = new Set(['about', 'services', 'skills', 'case-studies', 'gallery', 'blog', 'testimonials', 'contact']);
  let counter = 0;
  const renderSection = (id: string) => {
    const num = NUMBERED.has(id) ? String(++counter).padStart(2, '0') : undefined;
    return renderModernSection(id, formData, isMobile, isTablet, num);
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-stone-100">
      <div
        className={`transition-all duration-500 ${widthClass}`}
        {...(isModern ? { 'data-theme': formData.defaultTheme || 'light' } : {})}
        style={{ background: isModern && formData.defaultTheme === 'dark' ? '#0a0a0a' : '#ffffff' }}
      >
        {isModern && (
          <style>{`
            [data-theme="light"] {
              --primary: ${formData.primaryColor || '#4f46e5'};
              --accent: ${formData.primaryColor || '#4f46e5'};
              --bg: #ffffff; --bg-alt: #f7f7f7;
              --text: #0a0a0a; --text-muted: #6b7280;
              --border: #e5e7eb;
            }
            [data-theme="dark"] {
              --primary: ${formData.primaryColor || '#4f46e5'};
              --accent: ${formData.primaryColor || '#4f46e5'};
              --bg: #0a0a0a; --bg-alt: #141414;
              --text: #f5f5f5; --text-muted: #9ca3af;
              --border: #262626;
            }
          `}</style>
        )}
        {visibleSections.map(s => renderSection(s.id))}
      </div>
    </div>
  );
}
