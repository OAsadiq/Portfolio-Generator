/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Globe, Copy, Check, ExternalLink, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Portfolio {
  id: string;
  slug: string;
  template_id: string;
  user_name: string;
  status: string;
  deployed_url: string | null;
  custom_domain?: string | null;
  domain_verified?: boolean;
  created_at: string;
  views?: number;
}

interface Stats {
  totalPortfolios: number;
  totalViews: number;
  templatesUsed: number;
  lastCreated: string | null;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

interface CustomDomain {
  id: string;
  domain: string;
  portfolio_slug: string;
  portfolio_name: string;
  verified: boolean;
  created_at: string;
}

const PROFESSIONAL_TEMPLATES = ['professional-writer-template', 'modern-writer-template'];

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition';

const ProDashboard = () => {
  const { user, isPro, subscriptionLoading, signOut } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPortfolios: 0, totalViews: 0, templatesUsed: 0, lastCreated: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolios' | 'templates' | 'domains' | 'billing'>('portfolios');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; slug: string; name: string } | null>(null);

  const [showDomainForm, setShowDomainForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (user) { fetchDashboardData(); fetchCustomDomains(); fetchSubscription(); }
  }, [user?.id]);

  const fetchSubscription = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end, stripe_customer_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!user?.id) return;
    setBillingLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-portal-session', userId: user.id }),
      });
      const data = await res.json();
      console.log('[billing portal] status:', res.status, 'body:', data);
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Failed to open billing portal', 'error');
      }
    } catch (err) {
      console.error('[billing portal] fetch error:', err);
      showToast('Failed to open billing portal', 'error');
    } finally {
      setBillingLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchCustomDomains = async () => {
    if (!user?.id) return;
    try {
      const domains = portfolios
        .filter(p => p.custom_domain)
        .map(p => ({ id: p.id, domain: p.custom_domain!, portfolio_slug: p.slug, portfolio_name: p.user_name, verified: p.domain_verified || false, created_at: p.created_at }));
      setCustomDomains(domains);
    } catch (err) {
      console.error('Error fetching custom domains:', err);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain || !selectedPortfolio) { showToast('Please enter a domain and select a portfolio', 'error'); return; }
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(newDomain)) { showToast('Please enter a valid domain (e.g., myportfolio.com)', 'error'); return; }

    try {
      const { error } = await supabase.from('portfolios').update({ custom_domain: newDomain.toLowerCase(), domain_verified: false }).eq('slug', selectedPortfolio).eq('user_id', user?.id);
      if (error) throw error;
      const portfolio = portfolios.find(p => p.slug === selectedPortfolio);
      fetch('/api/notify/domain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ record: { custom_domain: newDomain.toLowerCase(), slug: selectedPortfolio, user_name: portfolio?.user_name || '', user_email: user?.email || '' } }) }).catch(() => {});
      showToast('Domain saved! Configure your DNS then click Verify.', 'success');
      setShowDomainForm(false); setNewDomain(''); setSelectedPortfolio('');
      await fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add domain', 'error');
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    try {
      const { error } = await supabase.from('portfolios').update({ custom_domain: null, domain_verified: false }).eq('id', domainId).eq('user_id', user?.id);
      if (error) throw error;
      showToast('Domain removed successfully', 'success');
      await fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove domain', 'error');
    }
  };

  const handleVerifyDomain = async (domain: string, portfolioSlug: string, portfolioId: string) => {
    showToast('Checking DNS...', 'info');
    try {
      const res = await fetch('/api/domains/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain, portfolioSlug, portfolioId }) });
      const data = await res.json();
      if (data.verified) { showToast('Domain verified! Your portfolio is live.', 'success'); await fetchDashboardData(); }
      else showToast('DNS not detected yet. Changes can take up to 48 hours.', 'error');
    } catch {
      showToast('Verification check failed. Try again.', 'error');
    }
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true); setError(null);
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios').select('id, slug, template_id, user_name, status, deployed_url, created_at, views, custom_domain, domain_verified').eq('user_id', user.id).order('created_at', { ascending: false });
      if (portfolioError) throw portfolioError;
      const { data: usageData, error: usageError } = await supabase.from('user_portfolio_usage').select('template_id').eq('user_id', user.id);
      if (usageError) console.error('Usage error:', usageError);
      const uniqueTemplates = new Set(usageData?.map(u => u.template_id) || []);
      const totalViews = portfolioData?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      setPortfolios(portfolioData || []);
      setStats({ totalPortfolios: portfolioData?.length || 0, totalViews, templatesUsed: uniqueTemplates.size, lastCreated: portfolioData?.[0]?.created_at || null });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string, portfolioSlug: string) => {
    try {
      const { error: deleteError } = await supabase.from('portfolios').delete().eq('id', portfolioId).eq('user_id', user?.id);
      if (deleteError) throw new Error(deleteError.message || 'Failed to delete portfolio');
      try { await supabase.storage.from('portfolios').remove([`portfolios/${portfolioSlug}.html`]); } catch {}
      try { await supabase.from('user_portfolio_usage').delete().eq('portfolio_slug', portfolioSlug).eq('user_id', user?.id); } catch {}
      setDeleteConfirm(null);
      showToast('Portfolio deleted successfully!', 'success');
      await fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete portfolio', 'error');
      setDeleteConfirm(null);
    }
  };

  const getEditRoute = (portfolio: Portfolio) =>
    PROFESSIONAL_TEMPLATES.includes(portfolio.template_id) ? `/builder/${portfolio.slug}` : `/edit/${portfolio.slug}`;

  if (!user || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-[3px] border-stone-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Pro Dashboard</h2>
          <p className="text-stone-500 mb-6">This dashboard is only available for Pro members.</p>
          <Link to="/pricing">
            <button className="w-full bg-stone-900 hover:bg-stone-700 text-white py-3 px-6 rounded-xl font-bold transition">
              Upgrade to Pro
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { icon: <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, bg: 'bg-blue-50', value: stats.totalPortfolios, label: 'Total Portfolios' },
    { icon: <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>, bg: 'bg-emerald-50', value: stats.totalViews, label: 'Total Views' },
    { icon: <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>, bg: 'bg-violet-50', value: stats.templatesUsed, label: 'Templates Used' },
    { icon: <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: 'bg-orange-50', value: stats.lastCreated ? new Date(stats.lastCreated).toLocaleDateString() : 'N/A', label: 'Last Created' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/"><Logo size={28} /></Link>
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-orange-600 text-xs font-bold">PRO</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/templates">
                <button className="px-4 py-2 bg-stone-900 hover:bg-stone-700 text-white rounded-lg text-sm font-semibold transition">
                  Create New
                </button>
              </Link>
              <button onClick={signOut} className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm transition">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">
            Welcome back, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-stone-500">Manage your portfolios and explore new templates.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600 text-sm">{error}</span>
            <button onClick={fetchDashboardData} className="ml-auto text-red-500 hover:text-red-400 text-sm underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 animate-pulse">
                  <div className="w-10 h-10 bg-stone-100 rounded-xl mb-4"></div>
                  <div className="h-7 bg-stone-100 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-stone-100 rounded w-28"></div>
                </div>
              ))}
            </div>
            <div className="text-center text-stone-400 py-8">
              <div className="inline-block w-8 h-8 border-[3px] border-stone-200 border-t-orange-600 rounded-full animate-spin mb-2"></div>
              <p className="text-sm">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {STAT_CARDS.map((card, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-all">
                  <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                    {card.icon}
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{card.value}</p>
                  <p className="text-stone-500 text-sm mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {[
                { id: 'portfolios', label: 'Portfolios' },
                { id: 'domains', label: 'Domains' },
                { id: 'billing', label: 'Billing' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {/* Portfolios Tab */}
            {activeTab === 'portfolios' && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-stone-900">All Portfolios</h2>
                  <Link to="/templates">
                    <button className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      New portfolio
                    </button>
                  </Link>
                </div>
                {portfolios.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-stone-400 text-sm mb-4">No portfolios yet</p>
                    <Link to="/templates">
                      <button className="bg-stone-900 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">
                        Create Your First Portfolio
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {portfolios.map((portfolio) => {
                      const liveUrl = portfolio.deployed_url || `https://porfilr.com/p/${portfolio.slug}`;
                      const displayUrl = liveUrl.replace(/^https?:\/\//, '');
                      const tplLabel = portfolio.template_id === 'modern-writer-template' ? 'Modern'
                        : portfolio.template_id === 'professional-writer-template' ? 'Professional'
                        : portfolio.template_id === 'minimal-template' ? 'Minimal' : portfolio.template_id;
                      const copyId = `url-${portfolio.id}`;
                      const maxViews = Math.max(...portfolios.map(p => p.views || 0));
                      const isTop = (portfolio.views || 0) > 0 && (portfolio.views || 0) === maxViews && portfolios.length > 1;
                      return (
                      <div key={portfolio.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-stone-900 truncate">{portfolio.user_name}</h3>
                              {isTop && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  Most viewed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">{tplLabel}</p>
                          </div>
                          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            portfolio.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {portfolio.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <strong className="text-stone-700">{portfolio.views || 0}</strong> views
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(portfolio.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Public URL + share actions */}
                        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-1.5 py-1.5 mb-3">
                          <span className="flex-1 text-xs text-stone-600 font-medium truncate">{displayUrl}</span>
                          <button onClick={() => copyToClipboard(liveUrl, copyId)} title="Copy link"
                            className="p-1.5 rounded-md hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition">
                            {copiedField === copyId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <a href={liveUrl} target="_blank" rel="noopener noreferrer" title="Open live"
                            className="p-1.5 rounded-md hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                        {/* QR code (collapsible) */}
                        <details className="mb-3">
                          <summary className="text-xs text-stone-500 hover:text-stone-700 cursor-pointer select-none list-none flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 3h3m0 0h3m-3 0v3m0-3v-3" /></svg>
                            Show QR code
                          </summary>
                          <div className="mt-2 flex justify-center p-3 bg-stone-50 border border-stone-200 rounded-lg">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(liveUrl)}`} alt="Portfolio QR code" width={150} height={150} loading="lazy" />
                          </div>
                        </details>

                        <div className="flex gap-2">
                          <Link to={getEditRoute(portfolio)} className="flex-1">
                            <button className="w-full bg-stone-900 hover:bg-stone-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition">
                              Edit
                            </button>
                          </Link>
                          <a href={`${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolio.slug}`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 py-2 px-3 rounded-lg text-sm font-semibold text-center transition">
                            Preview
                          </a>
                          <button
                            onClick={() => setDeleteConfirm({ id: portfolio.id, slug: portfolio.slug, name: portfolio.user_name })}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Templates Tab */}
            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-5">

                {/* Current Plan */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-stone-900 mb-5">Current Plan</h2>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-stone-900 text-lg">Pro Plan</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            subscription?.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : subscription?.status === 'past_due'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-stone-100 text-stone-500'
                          }`}>
                            {subscription?.status === 'active' ? 'Active' : subscription?.status === 'past_due' ? 'Past due' : subscription?.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-stone-500 text-sm">$19 one-time · Premium templates, custom domain & more</p>
                        <p className="text-stone-400 text-xs mt-1">Lifetime access — one-time payment, nothing to renew.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What's included */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <h3 className="font-bold text-stone-900 mb-4">What's included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'All premium templates',
                      'Custom domain support',
                      'Portfolio view analytics',
                      'Remove Porfilr branding',
                      'Priority support',
                      'Early access to new features',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5 text-sm text-stone-700">
                        <div className="w-5 h-5 bg-green-50 border border-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manage billing */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-stone-900 mb-1">Payment & Receipt</h3>
                      <p className="text-stone-500 text-sm">View your payment details and download a receipt from the Stripe portal. Pro is a one-time purchase — there's nothing to renew or cancel.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenBillingPortal}
                    disabled={billingLoading}
                    className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {billingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        View Receipt
                      </>
                    )}
                  </button>
                  <p className="text-stone-400 text-xs mt-3">You'll be redirected to a secure Stripe page. No payment details are stored on our servers.</p>
                </div>

                {/* Past due warning */}
                {subscription?.status === 'past_due' && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-700 text-sm">Payment failed</p>
                      <p className="text-red-600 text-sm mt-0.5">Your last payment didn't go through. Please update your payment method to keep your Pro features active.</p>
                      <button onClick={handleOpenBillingPortal} className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold transition">
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Domains Tab */}
            {activeTab === 'domains' && (
              <div className="space-y-5">
                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">Custom Domain Setup</h2>
                      <p className="text-stone-500 text-sm">Connect your own domain to any of your portfolios</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-stone-900">Your Custom Domains</h3>
                    <button onClick={() => setShowDomainForm(!showDomainForm)}
                      className="bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Domain
                    </button>
                  </div>

                  {showDomainForm && (
                    <div className="mb-5 bg-stone-50 border border-stone-200 rounded-xl p-5">
                      <h4 className="font-semibold text-stone-900 mb-4 text-sm">Add New Domain</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Domain Name</label>
                          <input type="text" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="myportfolio.com" className={INPUT} />
                          <p className="text-xs text-stone-400 mt-1">Enter without http:// or https://</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Select Portfolio</label>
                          <select value={selectedPortfolio} onChange={(e) => setSelectedPortfolio(e.target.value)} className={INPUT}>
                            <option value="">Choose a portfolio...</option>
                            {portfolios.map((p) => <option key={p.slug} value={p.slug}>{p.user_name}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={handleAddDomain} className="flex-1 bg-stone-900 hover:bg-stone-700 text-white py-2.5 px-5 rounded-xl text-sm font-bold transition">
                            Add Domain
                          </button>
                          <button onClick={() => { setShowDomainForm(false); setNewDomain(''); setSelectedPortfolio(''); }}
                            className="px-5 py-2.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-xl text-sm font-semibold transition">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {customDomains.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl">
                      <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-stone-400" />
                      </div>
                      <p className="text-stone-500 text-sm mb-1">No custom domains added yet</p>
                      <p className="text-stone-400 text-xs">Click "Add Domain" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customDomains.map((domain) => (
                        <div key={domain.id} className="bg-stone-50 border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-stone-900">{domain.domain}</h4>
                                {domain.verified ? (
                                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" />Verified
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                    <Clock className="w-3 h-3" />Pending
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500">Portfolio: {domain.portfolio_name}</p>
                              <p className="text-xs text-stone-400">Added {new Date(domain.created_at).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => handleRemoveDomain(domain.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {!domain.verified && (
                            <div className="mt-3 p-4 bg-white border border-stone-200 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <h5 className="font-semibold text-stone-900 text-sm">DNS Configuration Required</h5>
                              </div>
                              <p className="text-xs text-stone-500 mb-3">Add these DNS records to your domain provider to complete setup:</p>
                              <div className="space-y-2.5">
                                {[
                                  { type: 'A Record', name: '@', value: '76.76.21.21', copyId: `a-${domain.id}`, copyVal: '76.76.21.21' },
                                  { type: 'CNAME Record', name: 'www', value: 'cname.vercel-dns.com', copyId: `cname-${domain.id}`, copyVal: 'cname.vercel-dns.com' },
                                ].map(rec => (
                                  <div key={rec.type} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-bold text-stone-500 uppercase">{rec.type}</span>
                                      <button onClick={() => copyToClipboard(rec.copyVal, rec.copyId)} className="p-1 hover:bg-stone-200 rounded transition">
                                        {copiedField === rec.copyId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div><p className="text-stone-400 mb-0.5">Name</p><p className="text-stone-700 font-mono">{rec.name}</p></div>
                                      <div><p className="text-stone-400 mb-0.5">Value</p><p className="text-stone-700 font-mono break-all">{rec.value}</p></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-600">DNS changes can take up to 48 hours to propagate.</p>
                              </div>
                              <button onClick={() => handleVerifyDomain(domain.domain, domain.portfolio_slug, domain.id)}
                                className="mt-3 w-full bg-stone-900 hover:bg-stone-700 text-white py-2.5 rounded-xl text-sm font-bold transition">
                                Check Verification
                              </button>
                            </div>
                          )}

                          {domain.verified && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-green-700 font-semibold text-sm">Domain is live!</p>
                                <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-500 text-xs flex items-center gap-1 mt-0.5">
                                  Visit https://{domain.domain}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Setup Instructions */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <h3 className="font-bold text-stone-900 mb-4">Setup Instructions</h3>
                  <div className="space-y-5">
                    {[
                      { n: 1, title: 'Add Your Domain', body: 'Click "Add Domain" above and enter your domain name (e.g., myportfolio.com). Select which portfolio you want to connect it to.' },
                      { n: 2, title: 'Configure DNS Settings', body: 'Go to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.) and add an A record pointing @ to 76.76.21.21 and a CNAME record pointing www to cname.vercel-dns.com.' },
                      { n: 3, title: 'Wait for Verification', body: 'DNS changes typically take 1–48 hours to propagate. Once verified, your custom domain will be live!' },
                    ].map(step => (
                      <div key={step.n} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{step.n}</div>
                        <div>
                          <h4 className="font-semibold text-stone-900 text-sm mb-1">{step.title}</h4>
                          <p className="text-stone-500 text-sm">{step.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Providers */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <h3 className="font-bold text-stone-900 mb-4">Popular Domain Providers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: 'GoDaddy', url: 'https://www.godaddy.com/help/add-an-a-record-19238' },
                      { name: 'Namecheap', url: 'https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/' },
                      { name: 'Cloudflare', url: 'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/' },
                    ].map((p) => (
                      <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl hover:border-stone-300 transition group">
                        <span className="font-semibold text-stone-700 text-sm group-hover:text-stone-900">{p.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6">
                  <h3 className="font-bold text-stone-900 mb-4">Troubleshooting</h3>
                  <div className="space-y-3">
                    {[
                      { q: "My domain isn't verifying", a: ["DNS changes can take up to 48 hours to propagate globally", "Verify you've added both the A record and CNAME record correctly", "Check that there are no conflicting DNS records", "Try clearing your DNS cache or using a different browser"] },
                      { q: "SSL certificate issues", a: ["SSL certificates are automatically provisioned after DNS verification", "This usually takes 5–10 minutes after verification", "Try accessing your site with https:// after waiting"] },
                      { q: "Can I use a subdomain?", a: ["Yes! You can use subdomains like portfolio.yoursite.com", "Add a CNAME record with your subdomain name pointing to cname.vercel-dns.com", "Follow the same verification process"] },
                    ].map((item) => (
                      <details key={item.q} className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
                        <summary className="p-4 cursor-pointer font-semibold text-stone-900 text-sm hover:bg-stone-100 transition">{item.q}</summary>
                        <div className="px-4 pb-4 space-y-1.5">
                          {item.a.map((line, i) => <p key={i} className="text-sm text-stone-500">• {line}</p>)}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Delete Portfolio</h3>
                <p className="text-xs text-stone-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-stone-600 text-sm mb-5">
              Are you sure you want to delete <span className="font-semibold text-stone-900">"{deleteConfirm.name}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 px-4 rounded-xl text-sm font-semibold transition">
                Cancel
              </button>
              <button onClick={() => handleDeletePortfolio(deleteConfirm.id, deleteConfirm.slug)} className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slideIn ${
            toast.type === 'success' ? 'bg-white border-green-200 text-green-700'
            : toast.type === 'error' ? 'bg-white border-red-200 text-red-600'
            : 'bg-white border-stone-200 text-stone-700'
          }`}>
            {toast.type === 'success' && <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            {toast.type === 'error' && <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
            {toast.type === 'info' && <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            <span>{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-1 hover:opacity-60 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ProDashboard;
