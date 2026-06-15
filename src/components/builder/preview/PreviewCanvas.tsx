import { SectionItem } from '../builder.config';
import { renderProfessionalSection, renderProfessionalSidebar } from './ProfessionalTemplate';
import { renderModernSection } from './ModernTemplate';

interface Props {
  formData: Record<string, string>;
  previewMode: string;
  sections: SectionItem[];
  templateId: string;
}

export default function PreviewCanvas({ formData, previewMode, sections, templateId }: Props) {
  const isMobile = previewMode === 'mobile';
  const isTablet = previewMode === 'tablet';
  const isDesktop = previewMode === 'desktop';
  const isModern = templateId === 'modern-writer-template';
  const isProfessional = templateId === 'professional-writer-template';

  const visibleSections = sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  const widthClass = isDesktop ? 'w-full max-w-7xl mx-auto' : isTablet ? 'w-[768px] mx-auto' : 'w-[375px] mx-auto';

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

    return (
      <div className="flex-1 overflow-auto p-6 bg-stone-100">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');`}</style>
        <div className={`transition-all duration-500 ${widthClass} overflow-hidden rounded-sm`} style={proVars}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr' }}>
            {renderProfessionalSidebar(formData, isMobile)}
            <main style={{ padding: isMobile ? '1.25rem 1.25rem 2.5rem' : '2.5rem 3rem' }}>
              {formData.statement && (
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: isMobile ? '1.5rem' : '2.2rem', fontWeight: 500, lineHeight: 1.18, letterSpacing: '-0.02em', color: 'var(--text, #0f172a)', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border, #e9edf2)' }}>
                  {formData.statement}
                </p>
              )}
              {visibleSections.map(s => renderProfessionalSection(s.id, formData, isMobile, isTablet))}
              <p style={{ paddingTop: '2rem', fontSize: '.8rem', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
                Made with <a href="https://porfilr.com" style={{ color: pc, textDecoration: 'none', fontWeight: 600 }}>Porfilr</a>
              </p>
            </main>
          </div>
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
