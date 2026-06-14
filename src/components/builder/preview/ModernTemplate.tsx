// Clean, minimal, universal "Modern" template preview renderer.
// Mirrors api/templates/modern-writer-template/_index.js using the same field model.
// Relies on CSS vars injected by PreviewCanvas: --primary (accent), --bg, --bg-alt, --text, --text-muted, --border.

export function renderModernSection(sectionId: string, formData: Record<string, string>, isMobile: boolean, isTablet: boolean) {
  const accent = formData.primaryColor || '#0a0a0a';
  const ff = { fontFamily: "'Inter', sans-serif" } as const;
  const pad = isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-24 px-8';

  const SectionHeader = ({ title, count }: { title: string; count?: string }) => (
    <div className="flex items-baseline gap-3 mb-12" style={{ borderTop: '1px solid var(--border, #e5e7eb)', paddingTop: '0' }}>
      <h2 className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ ...ff, color: 'var(--text, #0a0a0a)' }}>{title}</h2>
      {count && <span className="text-sm" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{count}</span>}
    </div>
  );

  switch (sectionId) {
    case 'hero': {
      const role = formData.tagline || formData.headline || '';
      return (
        <section key="hero" data-section="hero" className={`flex items-center ${isMobile ? 'px-6 py-16' : 'px-8 py-20'}`} style={{ background: 'var(--bg, #fff)', minHeight: isMobile ? 'auto' : '70vh' }}>
          <div className={`w-full mx-auto grid items-center gap-10 ${isMobile ? 'grid-cols-1 max-w-md' : 'grid-cols-[1fr_auto] max-w-5xl'}`}>
            <div>
              {role && (
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase mb-5 px-3.5 py-1.5 rounded-full"
                  style={{ color: accent, border: `1px solid ${accent}`, letterSpacing: '0.04em', ...ff }}>
                  {role}
                </span>
              )}
              <h1 className={`font-bold leading-tight mb-6 ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'}`}
                style={{ letterSpacing: '-0.03em', color: 'var(--text, #0a0a0a)', ...ff }}>
                {formData.fullName || 'Your Name'}
              </h1>
              {formData.bio && (
                <p className={`mb-8 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`} style={{ color: 'var(--text-muted, #6b7280)', maxWidth: '34rem', ...ff }}>
                  {formData.bio}
                </p>
              )}
              <div className="flex gap-3 flex-wrap">
                <a href="#work" className="inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-sm font-medium" style={{ background: accent, color: '#fff', ...ff }}>View Work</a>
                {formData.email && (
                  <a href={`mailto:${formData.email}`} className="inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-sm font-medium"
                    style={{ background: 'transparent', color: 'var(--text, #0a0a0a)', border: '1px solid var(--border, #e5e7eb)', ...ff }}>Get in touch ↗</a>
                )}
              </div>
            </div>
            {!isMobile && (
              <div className="rounded-[20px] overflow-hidden flex-shrink-0" style={{ width: 200, height: 200, background: 'var(--bg-alt, #f7f7f7)', border: '1px solid var(--border, #e5e7eb)' }}>
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.fullName || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--text-muted, #6b7280)', letterSpacing: '-0.03em', ...ff }}>
                    {formData.fullName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'about':
      return formData.bio ? (
        <section key="about" data-section="about" className={pad} style={{ background: 'var(--bg, #fff)' }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="About" />
            <p className={`leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`} style={{ color: 'var(--text-muted, #6b7280)', maxWidth: '47rem', ...ff }}>{formData.bio}</p>
          </div>
        </section>
      ) : null;

    case 'skills':
      return [1, 2, 3, 4, 5, 6].some(n => formData[`skill${n}`]) ? (
        <section key="skills" data-section="skills" className={pad} style={{ background: 'var(--bg, #fff)' }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="Skills & Tools" />
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4, 5, 6].map(n => formData[`skill${n}`] ? (
                <span key={n} className="text-sm font-medium px-4 py-2 rounded-full" style={{ border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #0a0a0a)', ...ff }}>
                  {formData[`skill${n}`]}
                </span>
              ) : null)}
            </div>
          </div>
        </section>
      ) : null;

    case 'case-studies': {
      const nums = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => formData[`case${n}Title`]);
      return nums.length ? (
        <section key="case-studies" data-section="case-studies" className={pad} style={{ background: 'var(--bg, #fff)' }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="Selected Work" count={`${nums.length} project${nums.length > 1 ? 's' : ''}`} />
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {nums.map(n => {
                const tags = (formData[`case${n}Tags`] || '').split(',').map(t => t.trim()).filter(Boolean);
                return (
                  <article key={n} className="rounded-[14px] overflow-hidden" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)' }}>
                    <div className="relative" style={{ height: 180, background: 'var(--bg-alt, #f7f7f7)' }}>
                      {formData[`case${n}Image`] ? (
                        <img src={formData[`case${n}Image`]} alt={formData[`case${n}Title`]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" style={{ opacity: 0.2, color: 'var(--text, #0a0a0a)' }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {(formData[`case${n}Client`] || formData[`case${n}Role`]) && (
                        <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>
                          {formData[`case${n}Client`] && <span style={{ color: accent, fontWeight: 500 }}>{formData[`case${n}Client`]}</span>}
                          {formData[`case${n}Client`] && formData[`case${n}Role`] && <span style={{ color: 'var(--border, #e5e7eb)' }}>·</span>}
                          {formData[`case${n}Role`] && <span>{formData[`case${n}Role`]}</span>}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold mb-2 leading-snug" style={{ letterSpacing: '-0.01em', color: 'var(--text, #0a0a0a)', ...ff }}>{formData[`case${n}Title`]}</h3>
                      {formData[`case${n}Description`] && <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{formData[`case${n}Description`]}</p>}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((t, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--bg-alt, #f7f7f7)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-muted, #6b7280)', ...ff }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null;
    }

    case 'blog': {
      const nums = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => formData[`blog${n}Title`]);
      return nums.length ? (
        <section key="blog" data-section="blog" className={pad} style={{ background: 'var(--bg, #fff)' }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="Writing" />
            <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {nums.map(n => (
                <a key={n} href={formData[`blog${n}Link`] || '#'} className="block rounded-[14px] p-7" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)', textDecoration: 'none' }}>
                  {formData[`blog${n}Category`] && <span className="inline-block text-xs font-semibold uppercase mb-3" style={{ color: accent, letterSpacing: '0.06em', ...ff }}>{formData[`blog${n}Category`]}</span>}
                  <h3 className="text-lg font-semibold mb-2 leading-snug" style={{ color: 'var(--text, #0a0a0a)', ...ff }}>{formData[`blog${n}Title`]}</h3>
                  {formData[`blog${n}Excerpt`] && <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{formData[`blog${n}Excerpt`]}</p>}
                  <div className="text-xs" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{[formData[`blog${n}Date`], formData[`blog${n}ReadTime`] ? `${formData[`blog${n}ReadTime`]} min read` : ''].filter(Boolean).join(' · ')}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null;
    }

    case 'testimonials': {
      const nums = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => formData[`testimonial${n}`]);
      return nums.length ? (
        <section key="testimonials" data-section="testimonials" className={pad} style={{ background: 'var(--bg, #fff)' }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="Testimonials" />
            <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {nums.map(n => {
                const author = formData[`testimonial${n}Author`] || '';
                return (
                  <blockquote key={n} className="rounded-[14px] p-7" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)' }}>
                    <p className="text-sm leading-relaxed mb-5 italic" style={{ color: 'var(--text, #0a0a0a)', ...ff }}>"{formData[`testimonial${n}`]}"</p>
                    {(author || formData[`testimonial${n}Role`]) && (
                      <footer className="flex items-center gap-3">
                        {formData[`testimonial${n}Image`] ? (
                          <img src={formData[`testimonial${n}Image`]} alt={author} className="w-9 h-9 rounded-full object-cover" style={{ border: '1px solid var(--border, #e5e7eb)' }} />
                        ) : author ? (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'var(--bg-alt, #f7f7f7)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-muted, #6b7280)' }}>{author.charAt(0).toUpperCase()}</div>
                        ) : null}
                        <div className="flex flex-col">
                          {author && <strong className="text-sm font-semibold" style={{ color: 'var(--text, #0a0a0a)', ...ff }}>{author}</strong>}
                          {formData[`testimonial${n}Role`] && <span className="text-xs" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{formData[`testimonial${n}Role`]}</span>}
                        </div>
                      </footer>
                    )}
                  </blockquote>
                );
              })}
            </div>
          </div>
        </section>
      ) : null;
    }

    case 'contact':
      return (
        <section key="contact" data-section="contact" className={pad} style={{ background: 'var(--bg, #fff)' }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="Get In Touch" />
            <div className="flex flex-col items-start gap-6">
              <a href={`mailto:${formData.email}`} className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`} style={{ color: 'var(--text, #0a0a0a)', letterSpacing: '-0.025em', textDecoration: 'none', ...ff }}>
                {formData.email || 'your@email.com'}
              </a>
              <p className="text-base" style={{ color: 'var(--text-muted, #6b7280)', maxWidth: '30rem', ...ff }}>Open to freelance projects, full-time roles, and interesting conversations.</p>
              <div className="flex items-center gap-1">
                {formData.linkedin && (
                  <a href={formData.linkedin} className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ color: 'var(--text-muted, #6b7280)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </a>
                )}
                {formData.twitter && (
                  <a href={formData.twitter} className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ color: 'var(--text-muted, #6b7280)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                )}
                {formData.github && (
                  <a href={formData.github} className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ color: 'var(--text-muted, #6b7280)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );

    case 'footer':
      return (
        <footer key="footer" data-section="footer" className="py-8 px-8" style={{ borderTop: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)' }}>
          <div className="max-w-5xl mx-auto flex justify-between items-center text-xs" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>
            <span>© {new Date().getFullYear()} {formData.fullName || 'Portfolio'}</span>
            <span>Made with <a href="https://porfilr.com" style={{ color: 'var(--text-muted, #6b7280)', textDecoration: 'none' }}>Porfilr</a></span>
          </div>
        </footer>
      );

    default:
      return null;
  }
}
