export function renderModernSection(sectionId: string, formData: Record<string, string>, isMobile: boolean, isTablet: boolean) {
  const pc = formData.primaryColor || '#6366f1';
  const ac = formData.accentColor || '#ec4899';
  const colorKey = `${pc}-${ac}`;
  const gradText = { background: `linear-gradient(135deg, ${pc}, ${ac})`, WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const, backgroundClip: 'text' as const };
  const ff = { fontFamily: "'Inter', sans-serif" };
  const ffG = { fontFamily: "'Space Grotesk', sans-serif" };

  switch (sectionId) {
    case 'hero':
      return (
        <section key="hero" data-section="hero"
          className={`min-h-screen flex items-center justify-center text-center relative overflow-hidden ${isMobile ? 'px-6 py-16' : 'px-8 py-16'}`}
          style={{ background: `linear-gradient(135deg, ${pc}20, ${ac}10)` }}>
          <div className={`relative z-10 mx-auto ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-3xl'}`}>
            {formData.profileImage ? (
              <img src={formData.profileImage} alt={formData.fullName || 'Profile'}
                className={`rounded-full mx-auto mb-8 object-cover ${isMobile ? 'w-36 h-36' : 'w-40 h-40'}`}
                style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
            ) : (
              <div className={`rounded-full mx-auto mb-8 flex items-center justify-center text-white font-black ${isMobile ? 'w-36 h-36 text-5xl' : 'w-40 h-40 text-6xl'}`}
                style={{ background: `linear-gradient(135deg, ${pc}, ${ac})`, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', ...ffG, fontWeight: 900 }}>
                {formData.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
            )}
            <h1 key={`hero-${colorKey}`} className={`font-bold mb-4 leading-tight ${isMobile ? 'text-5xl' : isTablet ? 'text-6xl' : 'text-7xl'}`}
              style={{ ...gradText, ...ffG, fontWeight: 700 }}>
              {formData.fullName || 'Sarah Mitchell'}
            </h1>
            <p className={`font-medium mb-6 ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: 'var(--text, #0f172a)', ...ffG, fontWeight: 500 }}>
              {formData.tagline || 'Freelance Writer & Content Strategist'}
            </p>
            <p className={`text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed ${isMobile ? 'text-base' : 'text-xl'}`}
              style={{ ...ff, lineHeight: 1.8, color: 'var(--text-muted, #64748b)' }}>
              {formData.bio || 'Crafting compelling narratives that engage audiences and drive results.'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="#contact" className={`rounded-full text-white font-semibold transition-all ${isMobile ? 'px-8 py-3 text-base' : 'px-10 py-4 text-base'}`}
                style={{ background: `linear-gradient(135deg, ${pc}, ${ac})`, boxShadow: `0 10px 30px ${pc}40`, ...ff, fontWeight: 600 }}>
                Get In Touch
              </a>
              <a href="#case-studies" className={`rounded-full border-2 font-semibold transition-all ${isMobile ? 'px-8 py-3 text-base' : 'px-10 py-4 text-base'}`}
                style={{ borderColor: 'var(--border, #e2e8f0)', color: 'var(--text, #0f172a)', ...ff, fontWeight: 600 }}>
                View Work
              </a>
            </div>
          </div>
        </section>
      );

    case 'about':
      return (
        <section key="about" data-section="about"
          className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
          style={{ background: 'var(--bg-alt, #f8fafc)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 key={`about-${colorKey}`} className={`font-bold mb-6 ${isMobile ? 'text-4xl' : 'text-6xl'}`}
              style={{ ...gradText, ...ffG, fontWeight: 700 }}>About Me</h2>
            <p className={`leading-relaxed ${isMobile ? 'text-base' : 'text-xl'}`}
              style={{ color: 'var(--text-muted, #64748b)', ...ff, lineHeight: 1.7 }}>
              {formData.bio || 'Your bio will appear here...'}
            </p>
          </div>
        </section>
      );

    case 'skills':
      return [1, 2, 3, 4, 5, 6].some(n => formData[`skill${n}`]) ? (
        <section key="skills" data-section="skills"
          className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
          style={{ background: 'var(--bg, #f8fafc)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 key={`skills-${colorKey}`} className={`font-bold text-center mb-16 ${isMobile ? 'text-4xl' : 'text-6xl'}`}
              style={{ ...gradText, ...ffG, fontWeight: 700 }}>Skills & Expertise</h2>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-4'}`} style={{ marginTop: '4rem' }}>
              {[{ n: 1, e: '✍️' }, { n: 2, e: '📖' }, { n: 3, e: '🎯' }, { n: 4, e: '📝' }, { n: 5, e: '📰' }, { n: 6, e: '🔍' }].map(({ n, e }) =>
                formData[`skill${n}`] ? (
                  <div key={n} className="bg-white border-2 rounded-2xl p-10 text-center transition-all"
                    style={{ borderColor: 'var(--border, #e2e8f0)' }}>
                    <div className="text-5xl mb-4">{e}</div>
                    <h3 className="font-semibold text-xl" style={{ ...ff, fontWeight: 600, color: 'var(--text, #0f172a)' }}>
                      {formData[`skill${n}`]}
                    </h3>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </section>
      ) : null;

    case 'case-studies':
      return [1, 2, 3].some(n => formData[`case${n}Title`]) ? (
        <section key="case-studies" data-section="case-studies"
          className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
          style={{ background: 'var(--bg-alt, #f8fafc)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 key={`cases-${colorKey}`} className={`font-bold text-center mb-16 ${isMobile ? 'text-4xl' : 'text-6xl'}`}
              style={{ ...gradText, ...ffG, fontWeight: 700 }}>Featured Work</h2>
            <div className={`grid gap-12 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`} style={{ marginTop: '4rem' }}>
              {[{ n: 1, e: '📚' }, { n: 2, e: '🌱' }, { n: 3, e: '📖' }].map(({ n, e }) => {
                if (!formData[`case${n}Title`]) return null;
                return (
                  <article key={n} className="border-2 rounded-2xl overflow-hidden transition-all" style={{ borderColor: 'var(--border, #e2e8f0)', background: 'var(--bg-alt, #f8fafc)' }}>
                    <div className="h-64 flex items-center justify-center text-7xl relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${pc}30, ${ac}20)` }}>{e}</div>
                    <div className="p-8" style={{ background: 'var(--bg, #ffffff)' }}>
                      <div className="flex gap-4 mb-4 text-sm">
                        <span style={{ color: pc, ...ff, fontWeight: 600 }}>{formData[`case${n}Client`] || 'Client'}</span>
                        <span style={{ color: 'var(--text-muted, #64748b)', ...ff }}>{formData[`case${n}Role`] || 'Role'}</span>
                      </div>
                      <h3 className="font-bold text-2xl mb-4 leading-tight" style={{ ...ff, fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                        {formData[`case${n}Title`]}
                      </h3>
                      <p className="mb-6 leading-relaxed" style={{ ...ff, lineHeight: 1.7, color: 'var(--text-muted, #64748b)' }}>
                        {formData[`case${n}Description`] || 'Case study description goes here...'}
                      </p>
                      {formData[`case${n}Tags`] && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {formData[`case${n}Tags`].split(',').map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: 'var(--bg, #ffffff)', border: '1px solid var(--border, #e2e8f0)', color: 'var(--text-muted, #64748b)', ...ff }}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <button className="font-semibold" style={{ color: pc, ...ff, fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                        Read Full Case Study →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null;

    case 'blog':
      return [1, 2, 3].some(n => formData[`blog${n}Title`]) ? (
        <section key="blog" data-section="blog"
          className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
          style={{ background: 'var(--bg, #f8fafc)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 key={`blog-${colorKey}`} className={`font-bold text-center mb-16 ${isMobile ? 'text-4xl' : 'text-6xl'}`}
              style={{ ...gradText, ...ffG, fontWeight: 700 }}>Latest Articles</h2>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`} style={{ marginTop: '4rem' }}>
              {[1, 2, 3].map(n => {
                if (!formData[`blog${n}Title`]) return null;
                return (
                  <article key={n} className="border-2 rounded-2xl overflow-hidden transition-all" style={{ borderColor: 'var(--border, #e2e8f0)', background: 'var(--bg-alt, #ffffff)' }}>
                    <div className="h-40 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                      {formData[`blog${n}Category`] && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: pc, ...ff }}>
                          {formData[`blog${n}Category`]}
                        </span>
                      )}
                      <div className="flex items-center justify-center h-full text-6xl">📄</div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs mb-2" style={{ color: 'var(--text-muted, #64748b)', ...ff }}>
                        {formData[`blog${n}Date`] || 'Recent'} • {formData[`blog${n}ReadTime`] || '5'} min read
                      </div>
                      <h3 className="font-bold text-lg mb-2" style={{ ...ff, fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                        {formData[`blog${n}Title`]}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-muted, #64748b)', ...ff }}>
                        {formData[`blog${n}Excerpt`] || 'Article excerpt...'}
                      </p>
                      <a href={formData[`blog${n}Link`] || '#'} className="font-bold text-sm inline-flex items-center gap-2"
                        style={{ color: pc, ...ff, fontWeight: 600, textDecoration: 'none' }}>
                        Read More <span>→</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null;

    case 'contact':
      return (
        <section key="contact" data-section="contact"
          className={`${isMobile ? 'py-16 px-6' : isTablet ? 'py-20 px-8' : 'py-32 px-8'}`}
          style={{ background: 'var(--bg-alt, #f8fafc)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 key={`contact-${colorKey}`} className={`font-bold text-center mb-8 ${isMobile ? 'text-4xl' : 'text-6xl'}`}
              style={{ ...gradText, ...ffG, fontWeight: 700 }}>Let's Work Together</h2>
            <div className="text-center max-w-2xl mx-auto">
              <p className={`mb-8 ${isMobile ? 'text-lg' : 'text-xl'}`} style={{ color: 'var(--text-muted, #64748b)', ...ff, lineHeight: 1.6 }}>
                Have a writing project in mind? Let's bring your story to life.
              </p>
              <a href={`mailto:${formData.email}`} className="inline-block text-2xl font-bold mb-12"
                style={{ color: 'var(--text, #0f172a)', ...ff, fontWeight: 700, textDecoration: 'none' }}>
                {formData.email || 'your@email.com'}
              </a>
              <div className="flex justify-center gap-6 flex-wrap mt-12">
                {formData.linkedin && (
                  <a href={formData.linkedin} className="flex items-center gap-3 px-7 py-3 border-2 rounded-full"
                    style={{ borderColor: 'var(--border, #e2e8f0)', color: 'var(--text, #0f172a)', ...ff, textDecoration: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    <span>LinkedIn</span>
                  </a>
                )}
                {formData.twitter && (
                  <a href={formData.twitter} className="flex items-center gap-3 px-7 py-3 border-2 rounded-full"
                    style={{ borderColor: 'var(--border, #e2e8f0)', color: 'var(--text, #0f172a)', ...ff, textDecoration: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );

    case 'footer':
      return (
        <footer key="footer" data-section="footer" className="py-12 border-t-2"
          style={{ background: 'var(--bg, #ffffff)', borderColor: 'var(--border, #e2e8f0)' }}>
          <div className="container mx-auto px-8 flex justify-between items-center">
            <p style={{ color: 'var(--text-muted, #64748b)', ...ff }}>
              © 2026 {formData.fullName || 'Portfolio'}. Built with{' '}
              <a href="https://porfilr.com" style={{ color: pc, fontWeight: 600, textDecoration: 'none' }}>Porfilr</a>
            </p>
          </div>
        </footer>
      );

    default:
      return null;
  }
}
