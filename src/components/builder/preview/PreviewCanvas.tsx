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

  // Sections that get an editorial "01 —" number in the Modern template.
  const NUMBERED = new Set(['about', 'services', 'skills', 'case-studies', 'gallery', 'blog', 'testimonials', 'contact']);
  let counter = 0;

  const renderSection = (id: string) => {
    if (!isModern) return renderProfessionalSection(id, formData, isMobile, isTablet);
    const num = NUMBERED.has(id) ? String(++counter).padStart(2, '0') : undefined;
    return renderModernSection(id, formData, isMobile, isTablet, num);
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-stone-100">
      <div
        className={`transition-all duration-500 ${isDesktop ? 'w-full max-w-7xl mx-auto' : isTablet ? 'w-[768px] mx-auto' : 'w-[375px] mx-auto'}`}
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
