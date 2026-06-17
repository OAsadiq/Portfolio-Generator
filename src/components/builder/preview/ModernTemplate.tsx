// Clean, minimal, universal "Modern" template preview renderer.
// Mirrors api/templates/modern-writer-template/_index.js using the same field model.
// Relies on CSS vars injected by PreviewCanvas: --primary (accent), --bg, --bg-alt, --text, --text-muted, --border.

import { collectSocials, SocialIcon } from './socialIcons';

export function renderModernSection(
  sectionId: string,
  formData: Record<string, string>,
  isMobile: boolean,
  isTablet: boolean,
  num?: string,
) {
  const accent = formData.primaryColor || '#4f46e5';
  const ff = { fontFamily: "'Inter', sans-serif" } as const;
  const pad = isMobile ? 'py-14 px-6' : isTablet ? 'py-20 px-8' : 'py-24 px-8';
  const wrap = `mx-auto ${isMobile ? 'max-w-md' : 'max-w-5xl'} w-full`;

  const SectionHeader = ({ title, count }: { title: string; count?: string }) => (
    <div className="flex items-baseline gap-3 mb-12">
      {num && <span className="text-xs font-semibold tracking-wider" style={{ color: accent, fontVariantNumeric: 'tabular-nums', ...ff }}>{num}</span>}
      <h2 className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`} style={{ color: 'var(--text, #0a0a0a)', ...ff }}>{title}</h2>
      {count && <span className="text-sm ml-auto" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{count}</span>}
    </div>
  );

  switch (sectionId) {
    case 'hero': {
      const role = formData.tagline || formData.headline || '';
      const showAvail = formData.availability === 'true';
      return (
        <section key="hero" data-section="hero" className={`flex items-center ${isMobile ? 'px-6 py-14' : 'px-8 py-20'}`} style={{ background: 'var(--bg, #fff)', minHeight: isMobile ? 'auto' : '72vh' }}>
          <div className={`w-full mx-auto grid items-center gap-10 ${isMobile ? 'grid-cols-1 max-w-md' : 'grid-cols-[1fr_auto] max-w-5xl'}`}>
            <div>
              {showAvail && (
                <span className="inline-flex items-center gap-2 text-xs font-medium mb-6 px-3.5 py-1.5 rounded-full" style={{ color: 'var(--text-muted, #6b7280)', border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg-alt, #f7f7f7)', ...ff }}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.25)' }} />
                  {formData.availabilityText || 'Available for work'}
                </span>
              )}
              {role && <span className="block text-sm font-semibold mb-4" style={{ color: accent, ...ff }}>{role}</span>}
              <h1 className={`font-extrabold leading-none mb-6 ${isMobile ? 'text-5xl' : isTablet ? 'text-6xl' : 'text-7xl'}`} style={{ letterSpacing: '-0.04em', color: 'var(--text, #0a0a0a)', ...ff }}>
                {formData.fullName || 'Your Name'}
              </h1>
              {formData.bio && <p className={`mb-8 leading-relaxed ${isMobile ? 'text-base' : 'text-xl'}`} style={{ color: 'var(--text-muted, #6b7280)', maxWidth: '34rem', ...ff }}>{formData.bio}</p>}
              <div className="flex gap-3 flex-wrap items-center">
                <a href="#work" className="inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-sm font-medium" style={{ background: accent, color: '#fff', ...ff }}>View Work</a>
                {formData.email && <a href={`mailto:${formData.email}`} className="inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-sm font-medium" style={{ background: 'transparent', color: 'var(--text, #0a0a0a)', border: '1px solid var(--border, #e5e7eb)', ...ff }}>Get in touch ↗</a>}
                {formData.resumeUrl && <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-medium" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>Resume ↓</a>}
              </div>
            </div>
            {!isMobile && (
              <div className="rounded-3xl overflow-hidden flex-shrink-0" style={{ width: 220, height: 220, background: 'var(--bg-alt, #f7f7f7)', border: '1px solid var(--border, #e5e7eb)' }}>
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.fullName || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--text-muted, #6b7280)', letterSpacing: '-0.03em', ...ff }}>
                    {formData.fullName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'stats': {
      const nums = [1, 2, 3, 4].filter(n => formData[`stat${n}Value`]);
      return nums.length ? (
        <section key="stats" data-section="stats" className={`${isMobile ? 'py-10 px-6' : 'py-14 px-8'}`} style={{ background: 'var(--bg, #fff)' }}>
          <div className={`${wrap} grid gap-8`} style={{ gridTemplateColumns: `repeat(${Math.min(nums.length, isMobile ? 2 : 4)}, minmax(0, 1fr))` }}>
            {nums.map(n => (
              <div key={n}>
                <div className={`font-extrabold leading-none ${isMobile ? 'text-3xl' : 'text-5xl'}`} style={{ letterSpacing: '-0.04em', color: 'var(--text, #0a0a0a)', ...ff }}>{formData[`stat${n}Value`]}</div>
                <div className="text-sm mt-2" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{formData[`stat${n}Label`]}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null;
    }

    case 'trusted-by': {
      const names = (formData.clients || '').split(',').map(s => s.trim()).filter(Boolean);
      return names.length ? (
        <section key="trusted-by" data-section="trusted-by" className={`${isMobile ? 'py-8 px-6' : 'py-10 px-8'}`} style={{ background: 'var(--bg, #fff)' }}>
          <div className={`${wrap} flex items-center gap-6 flex-wrap`}>
            <span className="text-xs font-semibold uppercase whitespace-nowrap" style={{ letterSpacing: '0.1em', color: 'var(--text-muted, #6b7280)', ...ff }}>Trusted by</span>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {names.map((nm, i) => <span key={i} className="text-base font-semibold" style={{ color: 'var(--text-muted, #6b7280)', letterSpacing: '-0.01em', ...ff }}>{nm}</span>)}
            </div>
          </div>
        </section>
      ) : null;
    }

    case 'about':
      return formData.bio ? (
        <section key="about" data-section="about" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
            <SectionHeader title="About" />
            <p className={`leading-relaxed ${isMobile ? 'text-lg' : 'text-2xl'}`} style={{ color: 'var(--text-muted, #6b7280)', maxWidth: '48rem', letterSpacing: '-0.01em', ...ff }}>{formData.bio}</p>
          </div>
        </section>
      ) : null;

    case 'services': {
      const nums = [1, 2, 3, 4, 5, 6].filter(n => formData[`service${n}Title`]);
      return nums.length ? (
        <section key="services" data-section="services" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
            <SectionHeader title="What I Do" />
            <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {nums.map((n, idx) => (
                <div key={n} className="rounded-2xl p-7" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)' }}>
                  <span className="inline-block text-xs font-semibold mb-4" style={{ color: accent, fontVariantNumeric: 'tabular-nums', ...ff }}>{String(idx + 1).padStart(2, '0')}</span>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text, #0a0a0a)', letterSpacing: '-0.01em', ...ff }}>{formData[`service${n}Title`]}</h3>
                  {formData[`service${n}Desc`] && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{formData[`service${n}Desc`]}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null;
    }

    case 'skills':
      return [1, 2, 3, 4, 5, 6].some(n => formData[`skill${n}`]) ? (
        <section key="skills" data-section="skills" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
            <SectionHeader title="Skills & Tools" />
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4, 5, 6].map(n => formData[`skill${n}`] ? (
                <span key={n} className="text-sm font-medium px-4 py-2 rounded-full" style={{ border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #0a0a0a)', ...ff }}>{formData[`skill${n}`]}</span>
              ) : null)}
            </div>
          </div>
        </section>
      ) : null;

    case 'case-studies': {
      const nums = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => formData[`case${n}Title`]);
      return nums.length ? (
        <section key="case-studies" data-section="case-studies" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
            <SectionHeader title="Selected Work" count={`${nums.length} project${nums.length > 1 ? 's' : ''}`} />
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {nums.map(n => {
                const tags = (formData[`case${n}Tags`] || '').split(',').map(t => t.trim()).filter(Boolean);
                return (
                  <article key={n} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)' }}>
                    <div className="relative" style={{ height: 200, background: 'var(--bg-alt, #f7f7f7)' }}>
                      {formData[`case${n}Image`] ? (
                        <img src={formData[`case${n}Image`]} alt={formData[`case${n}Title`]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" style={{ opacity: 0.2, color: 'var(--text, #0a0a0a)' }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {(formData[`case${n}Client`] || formData[`case${n}Role`]) && (
                        <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>
                          {formData[`case${n}Client`] && <span style={{ color: accent, fontWeight: 500 }}>{formData[`case${n}Client`]}</span>}
                          {formData[`case${n}Client`] && formData[`case${n}Role`] && <span style={{ color: 'var(--border, #e5e7eb)' }}>·</span>}
                          {formData[`case${n}Role`] && <span>{formData[`case${n}Role`]}</span>}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold mb-2 leading-snug" style={{ letterSpacing: '-0.015em', color: 'var(--text, #0a0a0a)', ...ff }}>{formData[`case${n}Title`]}</h3>
                      {formData[`case${n}Description`] && <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>{formData[`case${n}Description`]}</p>}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((t, idx) => <span key={idx} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--bg-alt, #f7f7f7)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-muted, #6b7280)', ...ff }}>{t}</span>)}
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

    case 'gallery': {
      const nums = Array.from({ length: 8 }, (_, i) => i + 1).filter(n => formData[`gallery${n}`]);
      return nums.length ? (
        <section key="gallery" data-section="gallery" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
            <SectionHeader title="Gallery" />
            <div className="grid gap-4" style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {nums.map(n => (
                <div key={n} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg-alt, #f7f7f7)', aspectRatio: '4 / 3' }}>
                  <img src={formData[`gallery${n}`]} alt={`Gallery ${n}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null;
    }

    case 'blog': {
      const nums = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => formData[`blog${n}Title`]);
      return nums.length ? (
        <section key="blog" data-section="blog" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
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
        <section key="testimonials" data-section="testimonials" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
            <SectionHeader title="Testimonials" />
            <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {nums.map(n => {
                const author = formData[`testimonial${n}Author`] || '';
                return (
                  <blockquote key={n} className="rounded-2xl p-7" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)' }}>
                    <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--text, #0a0a0a)', ...ff }}>"{formData[`testimonial${n}`]}"</p>
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
        <section key="contact" data-section="contact" className={pad} style={{ background: 'var(--bg, #fff)', borderTop: '1px solid var(--border, #e5e7eb)' }}>
          <div className={wrap}>
            <SectionHeader title="Get In Touch" />
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3 flex-wrap">
                <a href={`mailto:${formData.email}`} className={`font-extrabold ${isMobile ? 'text-2xl' : 'text-5xl'}`} style={{ color: 'var(--text, #0a0a0a)', letterSpacing: '-0.03em', textDecoration: 'none', ...ff }}>{formData.email || 'your@email.com'}</a>
                {formData.email && <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-muted, #6b7280)', ...ff }}>Copy</span>}
              </div>
              <p className="text-base" style={{ color: 'var(--text-muted, #6b7280)', maxWidth: '30rem', ...ff }}>Open to freelance projects, full-time roles, and interesting conversations.</p>
              {formData.email && (
                <div className="flex flex-col gap-3 w-full" style={{ maxWidth: '32rem' }}>
                  <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
                    <input disabled placeholder="Your name" className="flex-1 px-4 py-3 rounded-lg text-sm" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)', color: 'var(--text, #0a0a0a)', ...ff }} />
                    <input disabled placeholder="Your email" className="flex-1 px-4 py-3 rounded-lg text-sm" style={{ border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)', color: 'var(--text, #0a0a0a)', ...ff }} />
                  </div>
                  <textarea disabled placeholder="Tell me about your project…" className="px-4 py-3 rounded-lg text-sm" style={{ minHeight: '7rem', resize: 'vertical', border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)', color: 'var(--text, #0a0a0a)', ...ff }} />
                  <button disabled className="self-start px-7 py-3 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent, #4f46e5)', color: '#fff', border: 'none', ...ff }}>Send message</button>
                </div>
              )}
              <div className="flex items-center gap-1">
                {collectSocials(formData).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ color: 'var(--text-muted, #6b7280)' }}>
                    <SocialIcon url={url} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      );

    case 'footer':
      return (
        <footer key="footer" data-section="footer" className="py-10 px-8" style={{ borderTop: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #fff)' }}>
          <div className={`${wrap} flex justify-between items-center text-xs`} style={{ color: 'var(--text-muted, #6b7280)', ...ff }}>
            <span>© {new Date().getFullYear()} {formData.fullName || 'Portfolio'}</span>
            <span>Made with <a href="https://porfilr.com" style={{ color: 'var(--text-muted, #6b7280)', textDecoration: 'none' }}>Porfilr</a></span>
          </div>
        </footer>
      );

    default:
      return null;
  }
}
