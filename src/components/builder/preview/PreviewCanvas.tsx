import { SectionItem } from '../builder.config';
import { renderProfessionalSection } from './ProfessionalTemplate';
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

  const visibleSections = sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  const renderSection = (id: string) =>
    isModern
      ? renderModernSection(id, formData, isMobile, isTablet)
      : renderProfessionalSection(id, formData, isMobile, isTablet);

  return (
    <div className="flex-1 overflow-auto p-6 bg-stone-100">
      <div
        className={`transition-all duration-500 ${isDesktop ? 'w-full max-w-7xl mx-auto' : isTablet ? 'w-[768px] mx-auto' : 'w-[375px] mx-auto'}`}
        {...(isModern ? { 'data-theme': formData.defaultTheme || 'light' } : {})}
        style={{ background: isModern && formData.defaultTheme === 'dark' ? '#0f172a' : '#ffffff' }}
      >
        {isModern && (
          <style>{`
            [data-theme="light"] {
              --primary: ${formData.primaryColor || '#6366f1'};
              --accent: ${formData.accentColor || '#ec4899'};
              --bg: #ffffff; --bg-alt: #f8fafc;
              --text: #0f172a; --text-muted: #64748b;
              --border: #e2e8f0;
            }
            [data-theme="dark"] {
              --primary: ${formData.primaryColor || '#6366f1'};
              --accent: ${formData.accentColor || '#ec4899'};
              --bg: #0f172a; --bg-alt: #1e293b;
              --text: #f1f5f9; --text-muted: #94a3b8;
              --border: #334155;
            }
          `}</style>
        )}
        {visibleSections.map(s => renderSection(s.id))}
      </div>
    </div>
  );
}
