import { Globe } from 'lucide-react';

interface Props {
  formData: Record<string, string>;
  isMobile: boolean;
  isTablet: boolean;
}

export default function ProfessionalTemplate({ formData, isMobile, isTablet }: Props) {
  const pc = formData.primaryColor || '#2563eb';
  const ac = formData.accentColor || '#0ea5e9';

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return (
          <section key="hero" data-section="hero" className={`min-h-screen flex items-center justify-center text-center relative overflow-hidden ${isMobile ? 'px-4 py-8' : 'px-8 py-16'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
            <div className={`relative z-10 mx-auto ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-4xl'}`}>
              {formData.profileImage ? (
                <img src={formData.profileImage} alt={formData.fullName || 'Profile'}
                  className={`rounded-full mx-auto mb-6 object-cover border-4 shadow-xl ${isMobile ? 'w-24 h-24' : isTablet ? 'w-32 h-32' : 'w-40 h-40'}`}
                  style={{ borderColor: pc }} />
              ) : (
                <div className={`rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold shadow-xl ${isMobile ? 'w-24 h-24 text-2xl' : isTablet ? 'w-32 h-32 text-4xl' : 'w-40 h-40 text-5xl'}`}
                  style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                  {formData.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <h1 className={`font-bold mb-4 text-slate-900 leading-tight ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-6xl'}`} style={{ letterSpacing: '-0.03em' }}>
                {formData.fullName || 'Your Name'}
              </h1>
              <p className={`font-semibold mb-6 ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'}`} style={{ color: pc }}>
                {formData.headline || 'Your Professional Title'}
              </p>
              <p className={`text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'}`}>
                {formData.bio || 'Your bio will appear here...'}
              </p>
              {(formData.linkedin || formData.twitter || formData.website) && (
                <div className={`flex gap-4 justify-center mb-8 ${isMobile ? 'gap-2' : 'gap-4'}`}>
                  {formData.linkedin && (
                    <a href={formData.linkedin} className={`rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  )}
                  {formData.twitter && (
                    <a href={formData.twitter} className={`rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                  )}
                  {formData.website && (
                    <a href={formData.website} className={`rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                      <Globe className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                    </a>
                  )}
                </div>
              )}
              {formData.email && (
                <a href={`mailto:${formData.email}`} className={`rounded-full text-white font-bold shadow-2xl hover:scale-105 transition inline-flex items-center gap-3 no-underline ${isMobile ? 'px-6 py-3 text-base' : isTablet ? 'px-8 py-3 text-lg' : 'px-10 py-4 text-lg'}`}
                  style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                  Get In Touch
                </a>
              )}
            </div>
          </section>
        );

      case 'specialties':
        return [1, 2, 3, 4].some(n => formData[`specialty${n}`]) ? (
          <section data-section="specialties" key="specialties" className={`bg-slate-50 ${isMobile ? 'py-8' : 'py-16'}`}>
            <div className={`max-w-5xl mx-auto ${isMobile ? 'px-4' : 'px-8'}`}>
              <div className={`flex justify-center flex-wrap ${isMobile ? 'gap-2' : 'gap-4'}`}>
                {[1, 2, 3, 4].map(n => formData[`specialty${n}`] ? (
                  <div key={n} className={`bg-white rounded-full border-2 font-semibold flex items-center gap-3 hover:scale-105 transition shadow-sm ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'}`}
                    style={{ borderColor: pc, color: pc }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2L11.5 7.5L17 8L13 12L14 17.5L9 15L4 17.5L5 12L1 8L6.5 7.5L9 2Z" /></svg>
                    {formData[`specialty${n}`]}
                  </div>
                ) : null)}
              </div>
            </div>
          </section>
        ) : null;

      case 'samples':
        return [1, 2, 3, 4].some(n => formData[`sample${n}Title`]) ? (
          <section data-section="samples" key="samples" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className={`font-black text-slate-900 mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Featured Work</h2>
                <p className={`text-slate-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>A curated selection of my best writing samples</p>
              </div>
              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {[1, 2, 3, 4].map(n => {
                  if (!formData[`sample${n}Title`]) return null;
                  return (
                    <article key={n} className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      <div className={`flex items-center justify-center text-6xl ${isMobile ? 'h-32 text-4xl' : 'h-48'}`} style={{ background: `linear-gradient(135deg, ${pc}20, ${ac}20)` }}>📄</div>
                      <div className={isMobile ? 'p-4' : 'p-6'}>
                        <span className="inline-block rounded-full text-xs font-bold uppercase tracking-wide mb-3 px-4 py-1" style={{ background: `${pc}15`, color: pc }}>
                          {formData[`sample${n}Type`] || 'Article'}
                        </span>
                        <h3 className={`font-bold text-slate-900 mb-3 leading-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>{formData[`sample${n}Title`]}</h3>
                        <p className="text-slate-600 leading-relaxed mb-4 text-sm">{formData[`sample${n}Description`] || 'Click to read more...'}</p>
                        <button className="font-bold rounded-lg transition hover:scale-105 px-4 py-2 text-sm" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})`, color: 'white' }}>Read Sample</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;

      case 'testimonials':
        return [1, 2, 3].some(n => formData[`testimonial${n}`]) ? (
          <section key="testimonials" data-section="testimonials" className={`bg-slate-50 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className={`font-black text-slate-900 mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Client Testimonials</h2>
              </div>
              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {[1, 2, 3].map(n => {
                  if (!formData[`testimonial${n}`]) return null;
                  const author = formData[`testimonial${n}Author`] || 'Anonymous';
                  return (
                    <div key={n} className={`bg-white border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all ${isMobile ? 'p-6' : 'p-8'}`}>
                      <div className="text-yellow-400 mb-4 text-2xl">★★★★★</div>
                      <p className={`text-slate-900 italic mb-6 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>"{formData[`testimonial${n}`]}"</p>
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full flex items-center justify-center text-white font-bold ${isMobile ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl'}`} style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                          {author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{author}</p>
                          <p className="text-sm text-slate-500">{formData[`testimonial${n}Role`] || 'Client'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;

      case 'contact':
        return (
          <section key="contact" data-section="contact" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
            <div className="max-w-5xl mx-auto">
              <div className={`rounded-3xl text-center text-white relative overflow-hidden ${isMobile ? 'p-8' : isTablet ? 'p-12' : 'p-16'}`} style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h2 className={`font-black mb-4 ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'}`}>Let's Create Something Amazing</h2>
                  <p className={`mb-8 opacity-95 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Ready to elevate your content? Let's discuss your project.</p>
                  <a href={`mailto:${formData.email}`} className={`bg-white rounded-full font-bold hover:scale-105 transition shadow-2xl inline-flex items-center gap-2 ${isMobile ? 'px-6 py-3 text-base' : 'px-10 py-4 text-xl'}`} style={{ color: pc }}>
                    Start a Conversation
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        );

      case 'footer':
        return (
          <footer key="footer" data-section="footer" className="py-8 text-center bg-slate-50">
            <p className="text-slate-500">Built with <span className="text-blue-600 font-semibold">Porfilr</span> ✨</p>
          </footer>
        );

      default:
        return null;
    }
  };

  return <>{renderSection}</>;
}

export { ProfessionalTemplate };

// Named export for use in PreviewCanvas
export function renderProfessionalSection(sectionId: string, formData: Record<string, string>, isMobile: boolean, isTablet: boolean) {
  const pc = formData.primaryColor || '#2563eb';
  const ac = formData.accentColor || '#0ea5e9';

  switch (sectionId) {
    case 'hero': {
      return (
        <section key="hero" data-section="hero" className={`min-h-screen flex items-center justify-center text-center relative overflow-hidden ${isMobile ? 'px-4 py-8' : 'px-8 py-16'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
          <div className={`relative z-10 mx-auto ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-4xl'}`}>
            {formData.profileImage ? (
              <img src={formData.profileImage} alt={formData.fullName || 'Profile'}
                className={`rounded-full mx-auto mb-6 object-cover border-4 shadow-xl ${isMobile ? 'w-24 h-24' : isTablet ? 'w-32 h-32' : 'w-40 h-40'}`}
                style={{ borderColor: pc }} />
            ) : (
              <div className={`rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold shadow-xl ${isMobile ? 'w-24 h-24 text-2xl' : isTablet ? 'w-32 h-32 text-4xl' : 'w-40 h-40 text-5xl'}`}
                style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                {formData.fullName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <h1 className={`font-bold mb-4 text-slate-900 leading-tight ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-6xl'}`}>
              {formData.fullName || 'Your Name'}
            </h1>
            <p className={`font-semibold mb-6 ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'}`} style={{ color: pc }}>
              {formData.headline || 'Your Professional Title'}
            </p>
            <p className={`text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'}`}>
              {formData.bio || 'Your bio will appear here...'}
            </p>
            {formData.email && (
              <a href={`mailto:${formData.email}`}
                className={`rounded-full text-white font-bold shadow-2xl hover:scale-105 transition inline-flex items-center gap-3 no-underline ${isMobile ? 'px-6 py-3 text-base' : 'px-10 py-4 text-lg'}`}
                style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                Get In Touch
              </a>
            )}
          </div>
        </section>
      );
    }

    case 'specialties':
      return [1, 2, 3, 4].some(n => formData[`specialty${n}`]) ? (
        <section data-section="specialties" key="specialties" className={`bg-slate-50 ${isMobile ? 'py-8' : 'py-16'}`}>
          <div className={`max-w-5xl mx-auto ${isMobile ? 'px-4' : 'px-8'}`}>
            <div className={`flex justify-center flex-wrap ${isMobile ? 'gap-2' : 'gap-4'}`}>
              {[1, 2, 3, 4].map(n => formData[`specialty${n}`] ? (
                <div key={n} className={`bg-white rounded-full border-2 font-semibold flex items-center gap-3 shadow-sm ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'}`} style={{ borderColor: pc, color: pc }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2L11.5 7.5L17 8L13 12L14 17.5L9 15L4 17.5L5 12L1 8L6.5 7.5L9 2Z" /></svg>
                  {formData[`specialty${n}`]}
                </div>
              ) : null)}
            </div>
          </div>
        </section>
      ) : null;

    case 'samples':
      return [1, 2, 3, 4].some(n => formData[`sample${n}Title`]) ? (
        <section data-section="samples" key="samples" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`font-black text-slate-900 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>Featured Work</h2>
            </div>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {[1, 2, 3, 4].map(n => {
                if (!formData[`sample${n}Title`]) return null;
                return (
                  <article key={n} className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="h-48 flex items-center justify-center text-6xl" style={{ background: `linear-gradient(135deg, ${pc}20, ${ac}20)` }}>📄</div>
                    <div className="p-6">
                      <span className="inline-block rounded-full text-xs font-bold uppercase tracking-wide mb-3 px-4 py-1" style={{ background: `${pc}15`, color: pc }}>{formData[`sample${n}Type`] || 'Article'}</span>
                      <h3 className="font-bold text-slate-900 mb-3 text-xl">{formData[`sample${n}Title`]}</h3>
                      <p className="text-slate-600 text-sm mb-4">{formData[`sample${n}Description`]}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null;

    case 'testimonials':
      return [1, 2, 3].some(n => formData[`testimonial${n}`]) ? (
        <section key="testimonials" data-section="testimonials" className={`bg-slate-50 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className={`font-black text-slate-900 text-center mb-16 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>Client Testimonials</h2>
            <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {[1, 2, 3].map(n => {
                if (!formData[`testimonial${n}`]) return null;
                const author = formData[`testimonial${n}Author`] || 'Anonymous';
                return (
                  <div key={n} className="bg-white border-2 border-slate-200 rounded-3xl p-8">
                    <div className="text-yellow-400 mb-4 text-2xl">★★★★★</div>
                    <p className="text-slate-900 italic mb-6 text-lg">"{formData[`testimonial${n}`]}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{author}</p>
                        <p className="text-sm text-slate-500">{formData[`testimonial${n}Role`] || 'Client'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null;

    case 'contact':
      return (
        <section key="contact" data-section="contact" className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-6' : 'py-20 px-8'}`}>
          <div className="max-w-5xl mx-auto">
            <div className="rounded-3xl text-center text-white relative overflow-hidden p-16" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
              <h2 className="font-black text-5xl mb-4">Let's Create Something Amazing</h2>
              <p className="text-2xl mb-8 opacity-95">Ready to elevate your content?</p>
              <a href={`mailto:${formData.email}`} className="bg-white rounded-full font-bold hover:scale-105 transition inline-flex items-center gap-2 px-10 py-4 text-xl" style={{ color: pc }}>
                Start a Conversation
              </a>
            </div>
          </div>
        </section>
      );

    case 'footer':
      return (
        <footer key="footer" data-section="footer" className="py-8 text-center bg-slate-50">
          <p className="text-slate-500">Built with <span className="text-blue-600 font-semibold">Porfilr</span> ✨</p>
        </footer>
      );

    default:
      return null;
  }
}
