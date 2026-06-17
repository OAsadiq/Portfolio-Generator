// Professional template preview renderer — split sidebar layout.
// Mirrors api/templates/professional-writer-template/_index.js.
// CSS vars injected by PreviewCanvas: --primary, --accent, --grad, --bg, --bg-2, --text, --text-2, --border.

import { collectSocials, SocialIcon } from './socialIcons';

const ff = { fontFamily: "'Inter', sans-serif" } as const;
const serif = { fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif" } as const;
const POP = '#0d9488';
const gradText = { background: 'var(--grad)', WebkitBackgroundClip: 'text' as const, backgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const };

export function renderProfessionalSidebar(formData: Record<string, string>, isMobile: boolean) {
  const name = formData.fullName || 'Your Name';
  const socials = collectSocials(formData);

  return (
    <aside key="sidebar" data-section="sidebar"
      className={`flex flex-col gap-5 ${isMobile ? 'p-6 border-b' : 'p-8 border-r sticky top-0 self-start'}`}
      style={{ background: 'var(--bg-2, #f8fafc)', borderColor: 'var(--border, #e9edf2)', ...(isMobile ? {} : { minHeight: 560 }) }}>
      <div className="rounded-[20px] overflow-hidden" style={{ width: 88, height: 88, background: 'var(--grad)', boxShadow: '0 12px 30px rgba(15,23,42,.16)', border: '3px solid #fff' }}>
        {formData.profileImage
          ? <img src={formData.profileImage} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-white" style={{ fontSize: '2.1rem', fontWeight: 700, ...serif }}>{name.charAt(0).toUpperCase()}</div>}
      </div>
      <div>
        <div className="leading-tight" style={{ fontSize: '1.7rem', fontWeight: 600, letterSpacing: '-0.02em', ...gradText, ...serif }}>{name}</div>
        <div className="font-semibold mt-1.5" style={{ fontSize: '.95rem', color: 'var(--text, #0f172a)', ...ff }}>{formData.headline || 'Your role'}</div>
        {formData.location && (
          <div className="flex items-center gap-1.5 mt-1.5" style={{ fontSize: '.82rem', color: 'var(--text-2, #64748b)', ...ff }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {formData.location}
          </div>
        )}
      </div>
      {formData.availability === 'true' && (
        <span className="inline-flex items-center gap-2 w-fit" style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--text-2, #64748b)', padding: '.3rem .7rem', border: '1px solid var(--border, #e9edf2)', borderRadius: 100, background: 'var(--bg, #fff)', ...ff }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,.2)' }} />
          {formData.availabilityText || 'Available for work'}
        </span>
      )}
      <div className="flex flex-col gap-2 mt-auto pt-4">
        {formData.email && <a href={`mailto:${formData.email}`} className="inline-flex items-center justify-center gap-2 font-semibold" style={{ padding: '.7rem 1rem', borderRadius: 10, fontSize: '.9rem', background: 'var(--grad)', color: '#fff', textDecoration: 'none', ...ff }}>Get in touch</a>}
        {formData.resumeUrl && <a href={formData.resumeUrl} className="inline-flex items-center justify-center gap-2 font-semibold" style={{ padding: '.7rem 1rem', borderRadius: 10, fontSize: '.9rem', border: '1px solid var(--border, #e9edf2)', color: 'var(--text, #0f172a)', background: 'var(--bg, #fff)', textDecoration: 'none', ...ff }}>Resume ↓</a>}
        {socials.length > 0 && (
          <div className="flex gap-1.5 mt-1">
            {socials.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border, #e9edf2)', color: 'var(--text-2, #64748b)', background: 'var(--bg, #fff)' }}><SocialIcon url={url} /></a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export function renderProfessionalHeader(formData: Record<string, string>, isMobile: boolean) {
  const name = formData.fullName || 'Your Name';
  const socials = collectSocials(formData);

  return (
    <header key="header" className="text-center mx-auto" style={{ maxWidth: 680, padding: isMobile ? '2.5rem 1.25rem 2rem' : '4rem 2rem 3rem' }}>
      <div className="mx-auto mb-5 rounded-[24px] overflow-hidden" style={{ width: 100, height: 100, background: 'var(--grad)', boxShadow: '0 12px 30px rgba(15,23,42,.16)', border: '3px solid #fff' }}>
        {formData.profileImage
          ? <img src={formData.profileImage} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-white" style={{ fontSize: '2.5rem', fontWeight: 700, ...serif }}>{name.charAt(0).toUpperCase()}</div>}
      </div>
      <h1 style={{ fontSize: isMobile ? '2.4rem' : '3.1rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05, ...gradText, ...serif }}>{name}</h1>
      <p className="font-semibold" style={{ fontSize: '1.05rem', color: 'var(--text, #0f172a)', marginTop: '.6rem', ...ff }}>{formData.headline || 'Your role'}</p>
      {formData.location && (
        <p className="inline-flex items-center gap-1.5 justify-center" style={{ fontSize: '.85rem', color: 'var(--text-2, #64748b)', marginTop: '.5rem', ...ff }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{formData.location}
        </p>
      )}
      {formData.availability === 'true' && (
        <div className="mt-4">
          <span className="inline-flex items-center gap-2" style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--text-2, #64748b)', padding: '.3rem .7rem', border: '1px solid var(--border, #e9edf2)', borderRadius: 100, background: 'var(--bg, #fff)', ...ff }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,.2)' }} />
            {formData.availabilityText || 'Available for work'}
          </span>
        </div>
      )}
      {formData.statement && (
        <p style={{ ...serif, fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 500, lineHeight: 1.35, color: 'var(--text-2, #64748b)', maxWidth: 560, margin: '1.5rem auto 0', letterSpacing: '-0.01em' }}>{formData.statement}</p>
      )}
      <div className="flex justify-center items-center gap-3 flex-wrap mt-7">
        {formData.email && <a href={`mailto:${formData.email}`} className="inline-flex items-center gap-2 font-semibold" style={{ padding: '.7rem 1.3rem', borderRadius: 10, fontSize: '.9rem', background: 'var(--grad)', color: '#fff', textDecoration: 'none', ...ff }}>Get in touch</a>}
        {formData.resumeUrl && <a href={formData.resumeUrl} className="inline-flex items-center gap-2 font-semibold" style={{ padding: '.7rem 1.3rem', borderRadius: 10, fontSize: '.9rem', border: '1px solid var(--border, #e9edf2)', color: 'var(--text, #0f172a)', background: 'var(--bg, #fff)', textDecoration: 'none', ...ff }}>Resume ↓</a>}
      </div>
      {socials.length > 0 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {socials.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border, #e9edf2)', color: 'var(--text-2, #64748b)', background: 'var(--bg, #fff)' }}><SocialIcon url={url} /></a>
          ))}
        </div>
      )}
    </header>
  );
}

function SecHead({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <div className="mb-7">
      {kicker && (
        <div className="inline-flex items-center gap-2 mb-2.5" style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: POP, ...ff }}>
          <span style={{ width: 22, height: 1, background: POP, display: 'inline-block' }} />{kicker}
        </div>
      )}
      <h2 style={{ fontSize: '1.9rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text, #0f172a)', ...serif }}>{title}</h2>
    </div>
  );
}

const SECTION_PAD = { padding: '2.5rem 0', borderTop: '1px solid var(--border, #e9edf2)' } as const;

export function renderProfessionalSection(sectionId: string, formData: Record<string, string>, isMobile: boolean) {
  switch (sectionId) {
    case 'about':
      return formData.bio ? (
        <section key="about" data-section="about" style={SECTION_PAD}>
          <SecHead title="About" kicker="Profile" />
          <p style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', lineHeight: 1.65, color: 'var(--text, #0f172a)', letterSpacing: '-0.01em', ...ff }}>{formData.bio}</p>
        </section>
      ) : null;

    case 'experience': {
      const nums = [1, 2, 3, 4, 5, 6].filter(n => formData[`exp${n}Role`]);
      return nums.length ? (
        <section key="experience" data-section="experience" style={SECTION_PAD}>
          <SecHead title="Experience" kicker="Career" />
          <div>
            {nums.map((n, idx) => (
              <div key={n} className={`grid gap-6 py-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-[150px_1fr]'}`} style={idx < nums.length - 1 ? { borderBottom: '1px solid var(--border, #e9edf2)' } : {}}>
                <div style={{ fontSize: '.85rem', color: 'var(--text-2, #64748b)', fontWeight: 500, ...ff }}>{formData[`exp${n}Period`] || ''}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--text, #0f172a)', ...ff }}>{formData[`exp${n}Role`]}</span>
                    {formData[`exp${n}Company`] && <><span style={{ fontSize: '.9rem', color: 'var(--text-2, #64748b)' }}>at</span><span className="font-semibold" style={{ fontSize: '1rem', color: 'var(--primary, #4f46e5)', ...ff }}>{formData[`exp${n}Company`]}</span></>}
                  </div>
                  {formData[`exp${n}Description`] && <p style={{ fontSize: '.95rem', color: 'var(--text-2, #64748b)', lineHeight: 1.6, ...ff }}>{formData[`exp${n}Description`]}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null;
    }

    case 'specialties': // legacy id → fall through to services
    case 'services': {
      const nums = [1, 2, 3, 4, 5, 6].filter(n => formData[`service${n}Title`]);
      return nums.length ? (
        <section key="services" data-section="services" style={SECTION_PAD}>
          <SecHead title="Services" kicker="Offerings" />
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {nums.map(n => (
              <div key={n} className="rounded-[16px] p-6" style={{ border: '1px solid var(--border, #e9edf2)', background: 'var(--bg, #fff)' }}>
                <h3 className="font-bold mb-1.5" style={{ fontSize: '1.15rem', color: 'var(--text, #0f172a)', ...ff }}>{formData[`service${n}Title`]}</h3>
                {formData[`service${n}Desc`] && <p style={{ fontSize: '.92rem', color: 'var(--text-2, #64748b)', lineHeight: 1.6, ...ff }}>{formData[`service${n}Desc`]}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null;
    }

    case 'samples': {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8].filter(n => formData[`sample${n}Title`]);
      return nums.length ? (
        <section key="samples" data-section="samples" style={SECTION_PAD}>
          <SecHead title="Selected Work" kicker="Portfolio" />
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {nums.map(n => (
              <article key={n} className="rounded-[16px] overflow-hidden flex flex-col" style={{ border: '1px solid var(--border, #e9edf2)' }}>
                <div className="flex items-center justify-center" style={{ height: 150, background: 'var(--bg-2, #f8fafc)' }}>
                  {formData[`sample${n}Image`]
                    ? <img src={formData[`sample${n}Image`]} alt={formData[`sample${n}Title`]} className="w-full h-full object-cover" />
                    : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" style={{ opacity: 0.3, color: 'var(--primary, #4f46e5)' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {formData[`sample${n}Type`] && <span className="font-bold uppercase mb-1.5" style={{ fontSize: '.7rem', letterSpacing: '.06em', color: 'var(--primary, #4f46e5)', ...ff }}>{formData[`sample${n}Type`]}</span>}
                  <h3 className="font-bold mb-1.5" style={{ fontSize: '1.15rem', color: 'var(--text, #0f172a)', ...ff }}>{formData[`sample${n}Title`]}</h3>
                  {formData[`sample${n}Description`] && <p className="flex-1" style={{ fontSize: '.92rem', color: 'var(--text-2, #64748b)', lineHeight: 1.6, ...ff }}>{formData[`sample${n}Description`]}</p>}
                  {(formData[`sample${n}Content`] || formData[`sample${n}Link`]) && (
                    <div className="mt-3 font-semibold" style={{ fontSize: '.9rem', color: 'var(--primary, #4f46e5)', ...ff }}>View details →</div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null;
    }

    case 'testimonials': {
      const nums = [1, 2, 3, 4, 5, 6].filter(n => formData[`testimonial${n}`]);
      return nums.length ? (
        <section key="testimonials" data-section="testimonials" style={SECTION_PAD}>
          <SecHead title="Testimonials" kicker="Praise" />
          <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {nums.map(n => {
              const author = formData[`testimonial${n}Author`] || '';
              return (
                <blockquote key={n} className="rounded-[16px] p-7" style={{ border: '1px solid var(--border, #e9edf2)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary, #4f46e5)', opacity: 0.18, marginBottom: '.5rem' }}><path d="M9.5 4C6.46 4 4 6.46 4 9.5c0 2.5 1.67 4.6 3.95 5.28-.13.9-.6 2.1-1.95 3.22-.3.25-.1.75.3.7C9.9 18.1 12 14.5 12 10.5V9.5C12 6.46 9.54 4 9.5 4zm9 0C15.46 4 13 6.46 13 9.5c0 2.5 1.67 4.6 3.95 5.28-.13.9-.6 2.1-1.95 3.22-.3.25-.1.75.3.7C18.9 18.1 21 14.5 21 10.5V9.5C21 6.46 18.54 4 18.5 4z" /></svg>
                  <p style={{ fontSize: '1rem', lineHeight: 1.65, color: 'var(--text, #0f172a)', marginBottom: '1.25rem', ...ff }}>{formData[`testimonial${n}`]}</p>
                  {(author || formData[`testimonial${n}Role`]) && (
                    <footer className="flex items-center gap-3">
                      {formData[`testimonial${n}Image`]
                        ? <img src={formData[`testimonial${n}Image`]} alt={author} className="rounded-full object-cover" style={{ width: 40, height: 40 }} />
                        : author ? <div className="rounded-full flex items-center justify-center text-white font-bold" style={{ width: 40, height: 40, background: 'var(--grad)' }}>{author.charAt(0).toUpperCase()}</div> : null}
                      <div className="flex flex-col">
                        {author && <strong style={{ fontSize: '.92rem', color: 'var(--text, #0f172a)', ...ff }}>{author}</strong>}
                        {formData[`testimonial${n}Role`] && <span style={{ fontSize: '.82rem', color: 'var(--text-2, #64748b)', ...ff }}>{formData[`testimonial${n}Role`]}</span>}
                      </div>
                    </footer>
                  )}
                </blockquote>
              );
            })}
          </div>
        </section>
      ) : null;
    }

    case 'education': {
      const nums = [1, 2, 3, 4, 5, 6].filter(n => formData[`edu${n}Title`]);
      return nums.length ? (
        <section key="education" data-section="education" style={SECTION_PAD}>
          <SecHead title="Education & Certifications" kicker="Background" />
          <div>
            {nums.map((n, idx) => (
              <div key={n} className={`grid gap-6 py-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-[90px_1fr]'}`} style={idx < nums.length - 1 ? { borderBottom: '1px solid var(--border, #e9edf2)' } : {}}>
                <div style={{ fontSize: '.85rem', color: 'var(--text-2, #64748b)', fontWeight: 500, ...ff }}>{formData[`edu${n}Year`] || ''}</div>
                <div>
                  <div className="font-bold" style={{ fontSize: '1.05rem', color: 'var(--text, #0f172a)', ...ff }}>{formData[`edu${n}Title`]}</div>
                  {formData[`edu${n}School`] && <div style={{ fontSize: '.92rem', color: 'var(--text-2, #64748b)', ...ff }}>{formData[`edu${n}School`]}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null;
    }

    case 'contact': {
      if (!formData.email) return null;
      const inputStyle: React.CSSProperties = { width: '100%', padding: '.85rem 1rem', borderRadius: 10, border: '1px solid var(--border, #e9edf2)', background: 'var(--bg, #fff)', color: 'var(--text, #0f172a)', fontSize: '.95rem', ...ff };
      return (
        <section key="contact" data-section="contact" style={SECTION_PAD}>
          <SecHead title="Get in Touch" kicker="Contact" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem', maxWidth: 540 }}>
            <div style={{ display: 'flex', gap: '.85rem', flexDirection: isMobile ? 'column' : 'row' }}>
              <input style={inputStyle} placeholder="Your name" disabled />
              <input style={inputStyle} placeholder="Your email" disabled />
            </div>
            <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} placeholder="Tell me about your project…" disabled />
            <button style={{ alignSelf: 'flex-start', padding: '.85rem 1.9rem', borderRadius: 10, border: 'none', background: 'var(--grad)', color: '#fff', fontSize: '.95rem', fontWeight: 600, ...ff }} disabled>Send message</button>
          </div>
        </section>
      );
    }

    // Legacy 'hero'/'footer' ids from old saved portfolios — sidebar/credit handle these now.
    case 'hero':
    case 'footer':
    default:
      return null;
  }
}
