// Updated SampleSection.tsx - Bento Card Style (Based on Reference)

const SampleSection = () => {
    const scrollToWaitlist = () => {
        const waitlistSection = document.getElementById('waitlist');
        if (waitlistSection) {
            waitlistSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // const scrollToLiveDemo = () => {
    //     const liveDemoSection = document.getElementById('LiveDemo');
    //     if (liveDemoSection) {
    //         liveDemoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //     }
    // };

    const scrollToHowItWorks = () => {
        const howItWorksSection = document.getElementById('HowItWorks');
        if (howItWorksSection) {
            howItWorksSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="py-10 px-4 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">

                {/* Bento Grid - 3 Portfolio Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

                    {/* Card 1 - Minimal Writer (Left) */}
                    <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden hover:border-yellow-400/40 transition-all duration-300 hover:scale-[1.02]">
                        {/* Glow effect on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/10 group-hover:to-transparent rounded-3xl blur-xl transition-all duration-300"></div>

                        <div className="relative p-6 space-y-4">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold text-lg border-2 border-slate-600">
                                    SC
                                </div>
                                <div>
                                    <h3 className="text-slate-50 font-bold text-lg">Saro Chen</h3>
                                    <p className="text-slate-400 text-sm">Copywriter</p>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Freelance writer specializing in B2B SaaS and enterprise tech. Published in TechCrunch, Forbes.
                            </p>

                            {/* Skills */}
                            <div>
                                <p className="text-slate-500 text-xs font-semibold mb-2">Specialties</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">SaaS</span>
                                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">B2B Tech</span>
                                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">Product</span>
                                </div>
                            </div>

                            {/* Articles Preview */}
                            <div className="space-y-2 pt-2">
                                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                                    <p className="text-slate-200 text-xs font-semibold mb-1">How AI is Transforming SaaS</p>
                                    <p className="text-slate-500 text-[10px]">Published in TechCrunch</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                                    <p className="text-slate-200 text-xs font-semibold mb-1">The Future of Remote Work</p>
                                    <p className="text-slate-500 text-[10px]">Published in Forbes</p>
                                </div>
                            </div>

                            {/* Template Badge */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                <span className="text-slate-500 text-xs">Minimal Template</span>
                                <div className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-[10px] font-semibold">
                                    FREE
                                </div>
                            </div>

                            {/* View Button */}
                            <a href="/templates/minimal-template/preview.html" target="_blank" rel="noopener noreferrer">
                                <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 group">
                                    View Full Portfolio
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Card 2 - Modern Writer (Center) */}
                    <div className="group relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-blue-500/30 rounded-3xl overflow-hidden hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/10">
                        {/* Popular Badge */}
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-bl-2xl rounded-tr-3xl text-[10px] font-bold">
                            ⭐ POPULAR
                        </div>

                        {/* Glow effect on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 rounded-3xl blur-xl transition-all duration-300"></div>

                        <div className="relative p-6 space-y-4">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-blue-400/50 shadow-lg shadow-blue-500/30">
                                    SM
                                </div>
                                <div>
                                    <h3 className="text-slate-50 font-bold text-lg">Sarah Mitchell</h3>
                                    <p className="text-blue-300 text-sm font-semibold">Freelance Writerr</p>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Content strategist helping SaaS companies 10x their organic traffic. 5+ years in growth marketing.
                            </p>

                            {/* Skills */}
                            <div>
                                <p className="text-blue-300 text-xs font-semibold mb-2">Specialties</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs border border-blue-500/30">SEO</span>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs border border-purple-500/30">Growth</span>
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs border border-blue-500/30">Content Strategy</span>
                                </div>
                            </div>

                            {/* Articles Preview */}
                            <div className="space-y-2 pt-2">
                                <div className="bg-slate-800/60 rounded-lg p-3 border border-blue-500/20">
                                    <p className="text-slate-100 text-xs font-semibold mb-1">Complete Guide to SaaS SEO</p>
                                    <p className="text-blue-300 text-[10px]">15K+ views</p>
                                </div>
                                <div className="bg-slate-800/60 rounded-lg p-3 border border-purple-500/20">
                                    <p className="text-slate-100 text-xs font-semibold mb-1">Content Marketing Playbook</p>
                                    <p className="text-purple-300 text-[10px]">Featured on ProductHunt</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-slate-800/40 rounded-lg p-3 border border-blue-500/20">
                                    <p className="text-blue-400 text-lg font-bold">50+</p>
                                    <p className="text-slate-400 text-[10px]">Articles Published</p>
                                </div>
                                <div className="bg-slate-800/40 rounded-lg p-3 border border-purple-500/20">
                                    <p className="text-purple-400 text-lg font-bold">2M+</p>
                                    <p className="text-slate-400 text-[10px]">Total Readers</p>
                                </div>
                            </div>

                            {/* Template Badge */}
                            <div className="flex items-center justify-between pt-4 border-t border-blue-500/20">
                                <span className="text-slate-400 text-xs">Modern Template</span>
                                <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/40 rounded-full text-[10px] font-semibold">
                                    PRO
                                </div>
                            </div>

                            {/* View Button */}
                            <a href="/templates/modern-writer-template/preview.html" target="_blank" rel="noopener noreferrer">
                                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/30">
                                    View Full Portfolio
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Card 3 - Professional Writer (Right) */}
                    <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden hover:border-green-400/40 transition-all duration-300 hover:scale-[1.02]">
                        {/* Glow effect on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-green-400/0 to-green-400/0 group-hover:from-green-400/10 group-hover:to-transparent rounded-3xl blur-xl transition-all duration-300"></div>

                        <div className="relative p-6 space-y-4">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-green-400/50">
                                    RP
                                </div>
                                <div>
                                    <h3 className="text-slate-50 font-bold text-lg">Jane Smith</h3>
                                    <p className="text-slate-400 text-sm">B2B Content Writer</p>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Explaining complex tech simply. API docs, dev tutorials, and technical guides for startups.
                            </p>

                            {/* Skills */}
                            <div>
                                <p className="text-slate-500 text-xs font-semibold mb-2">Specialties</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">API Docs</span>
                                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">Dev Tools</span>
                                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">Tutorials</span>
                                </div>
                            </div>

                            {/* Articles Preview */}
                            <div className="space-y-2 pt-2">
                                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                                    <p className="text-slate-200 text-xs font-semibold mb-1">Getting Started with GraphQL</p>
                                    <p className="text-slate-500 text-[10px]">Dev.to • 8K views</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                                    <p className="text-slate-200 text-xs font-semibold mb-1">REST API Best Practices</p>
                                    <p className="text-slate-500 text-[10px]">Hashnode • Featured</p>
                                </div>
                            </div>

                            {/* Testimonial */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <div className="flex gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-green-200 text-[10px] italic">"Clearest API docs we've ever had"</p>
                                <p className="text-green-300 text-[9px] mt-1">— CTO, TechStartup</p>
                            </div>

                            {/* Template Badge */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                <span className="text-slate-500 text-xs">Professional Template</span>
                                <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-[10px] font-semibold">
                                    PRO
                                </div>
                            </div>

                            {/* View Button */}
                            <a href="/templates/professional-writer-template/preview.html" target="_blank" rel="noopener noreferrer">
                                <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 group">
                                    View Full Portfolio
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </a>
                        </div>
                    </div>

                </div>

                {/* CTA Below Cards */}
                <div className="text-center mt-16 space-y-6">
                    <p className="text-slate-400 text-sm">
                        Each portfolio built in <span className="text-yellow-400 font-semibold">under 10 minutes</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a>
                            <button onClick={scrollToWaitlist} className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all transform hover:scale-105">
                                Build Yours Now (Free)
                                <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </a>

                        <a>
                            <button onClick={scrollToHowItWorks} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all">
                                See How It Works
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SampleSection;