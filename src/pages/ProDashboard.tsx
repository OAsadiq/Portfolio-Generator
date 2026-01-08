/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
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

interface CustomDomain {
  id: string;
  domain: string;
  portfolio_slug: string;
  portfolio_name: string;
  verified: boolean;
  created_at: string;
}

const ProDashboard = () => {
  const { user, isPro, signOut } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPortfolios: 0,
    totalViews: 0,
    templatesUsed: 0,
    lastCreated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolios' | 'templates' | 'domains'>('overview');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; slug: string; name: string } | null>(null);
  
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchCustomDomains();
    }
  }, [user?.id]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
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
      // In a real implementation, you'd fetch from a custom_domains table
      // For now, we'll extract from portfolios
      const domains = portfolios
        .filter(p => p.custom_domain)
        .map(p => ({
          id: p.id,
          domain: p.custom_domain!,
          portfolio_slug: p.slug,
          portfolio_name: p.user_name,
          verified: p.domain_verified || false,
          created_at: p.created_at
        }));
      
      setCustomDomains(domains);
    } catch (err) {
      console.error('Error fetching custom domains:', err);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain || !selectedPortfolio) {
      showToast('Please enter a domain and select a portfolio', 'error');
      return;
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(newDomain)) {
      showToast('Please enter a valid domain (e.g., myportfolio.com)', 'error');
      return;
    }

    try {
      // In a real implementation, you'd save to a custom_domains table
      const portfolio = portfolios.find(p => p.slug === selectedPortfolio);
      
      const newCustomDomain: CustomDomain = {
        id: Date.now().toString(),
        domain: newDomain,
        portfolio_slug: selectedPortfolio,
        portfolio_name: portfolio?.user_name || 'Portfolio',
        verified: false,
        created_at: new Date().toISOString()
      };

      setCustomDomains(prev => [...prev, newCustomDomain]);
      showToast('Domain added! Please configure your DNS settings.', 'success');
      setShowDomainForm(false);
      setNewDomain('');
      setSelectedPortfolio('');
    } catch (err: any) {
      showToast(err.message || 'Failed to add domain', 'error');
    }
  };

  const handleRemoveDomain = (domainId: string) => {
    setCustomDomains(prev => prev.filter(d => d.id !== domainId));
    showToast('Domain removed successfully', 'success');
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id, slug, template_id, user_name, status, deployed_url, created_at, views')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (portfolioError) {
        console.error('Portfolio error:', portfolioError);
        throw portfolioError;
      }

      const { data: usageData, error: usageError } = await supabase
        .from('user_portfolio_usage')
        .select('template_id')
        .eq('user_id', user.id);

      if (usageError) {
        console.error('Usage error:', usageError);
      }

      const uniqueTemplates = new Set(usageData?.map(u => u.template_id) || []);
      const totalViews = portfolioData?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

      setPortfolios(portfolioData || []);
      setStats({
        totalPortfolios: portfolioData?.length || 0,
        totalViews: totalViews,
        templatesUsed: uniqueTemplates.size,
        lastCreated: portfolioData?.[0]?.created_at || null
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string, portfolioSlug: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId)
        .eq('user_id', user?.id);

      if (deleteError) {
        throw new Error(deleteError.message || 'Failed to delete portfolio');
      }

      try {
        const filePath = `portfolios/${portfolioSlug}.html`;
        const { error: storageError } = await supabase.storage
          .from('portfolios')
          .remove([filePath]);
        
        if (storageError) {
          console.warn(storageError);
        }
      } catch (storageErr) {
        console.warn('Failed to delete from storage:', storageErr);
      }

      try {
        const { error: usageError } = await supabase
          .from('user_portfolio_usage')
          .delete()
          .eq('portfolio_slug', portfolioSlug)
          .eq('user_id', user?.id);
        
        if (usageError) {
          console.warn('Usage delete error:', usageError);
        }
      } catch (usageErr) {
        console.warn('Failed to delete usage record:', usageErr);
      }

      setDeleteConfirm(null);
      showToast('Portfolio deleted successfully!', 'success');
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error deleting portfolio:', err);
      showToast(err.message || 'Failed to delete portfolio', 'error');
      setDeleteConfirm(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Pro Dashboard</h2>
          <p className="text-slate-400 mb-6">This dashboard is only available for Pro members.</p>
          <Link to="/">
            <button className="w-full bg-yellow-400 text-slate-900 py-3 px-6 rounded-xl font-bold hover:bg-yellow-300 transition">
              Upgrade to Pro
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/" className="text-2xl font-bold text-yellow-400">
                  Foliobase
                </Link>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-full">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-yellow-400 text-xs font-bold">PRO</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Link to="/templates">
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition">
                    Create New
                  </button>
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-slate-400 hover:text-slate-300 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-3">
              Welcome back, {user?.email?.split('@')[0]}
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-400">Manage your portfolios and explore new templates.</p>
          </div>

          {/* Stats Cards */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400">{error}</span>
              <button
                onClick={() => fetchDashboardData()}
                className="ml-auto text-red-400 hover:text-red-300 underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {/* Loading Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 animate-pulse">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl mb-4"></div>
                    <div className="h-8 bg-slate-700 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-32"></div>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-slate-400 py-8">
                <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mb-2"></div>
                <p>Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats cards - keeping original implementation */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-50">{stats.totalPortfolios}</p>
                  <p className="text-slate-400 text-sm">Total Portfolios</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-50">{stats.totalViews}</p>
                  <p className="text-slate-400 text-sm">Total Views</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-50">{stats.templatesUsed}</p>
                  <p className="text-slate-400 text-sm">Templates Used</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-slate-800/50 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 hover:border-yellow-400/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-50">
                    {stats.lastCreated 
                      ? new Date(stats.lastCreated).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  <p className="text-slate-400 text-sm">Last Created</p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { 
                    id: 'overview', 
                    label: 'Overview', 
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  },
                  { 
                    id: 'portfolios', 
                    label: 'My Portfolios', 
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  },
                  { 
                    id: 'templates', 
                    label: 'Templates', 
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                  },
                  { 
                    id: 'domains', 
                    label: 'Custom Domains', 
                    icon: <Globe className="w-5 h-5" />
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content - Overview and Portfolios tabs remain the same */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-slate-50 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link to="/templates">
                        <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 py-4 px-6 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create New Portfolio
                        </button>
                      </Link>
                      <button
                        onClick={() => setActiveTab('templates')}
                        className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 py-4 px-6 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        Browse Templates
                      </button>
                      <button
                        onClick={() => setActiveTab('domains')}
                        className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 py-4 px-6 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Globe className="w-5 h-5" />
                        Manage Domains
                      </button>
                    </div>
                  </div>

                  {/* Recent Portfolios */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-50">Recent Portfolios</h2>
                      <button
                        onClick={() => setActiveTab('portfolios')}
                        className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold flex items-center gap-1"
                      >
                        View All
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                    
                    {portfolios.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-400 mb-4">No portfolios yet</p>
                        <Link to="/templates">
                          <button className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition">
                            Create Your First Portfolio
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {portfolios.slice(0, 3).map((portfolio) => (
                          <div
                            key={portfolio.id}
                            className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:border-yellow-400/30 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-slate-50">{portfolio.user_name}</h3>
                                <p className="text-sm text-slate-400">
                                  {new Date(portfolio.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={`${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolio.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg text-sm font-semibold transition"
                                >
                                  View
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'portfolios' && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-slate-50 mb-6">All Portfolios</h2>
                  
                  {portfolios.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-slate-400 mb-4">No portfolios yet</p>
                      <Link to="/templates">
                        <button className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition">
                          Create Your First Portfolio
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {portfolios.map((portfolio) => (
                        <div
                          key={portfolio.id}
                          className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 hover:border-yellow-400/30 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-50">{portfolio.user_name}</h3>
                              <p className="text-sm text-slate-400">{portfolio.template_id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              portfolio.status === 'active' 
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-slate-600/20 text-slate-400'
                            }`}>
                              {portfolio.status}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {portfolio.views || 0} views
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(portfolio.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <a
                              href={`${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolio.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-200 py-2 px-4 rounded-lg text-sm font-semibold text-center transition"
                            >
                              Preview
                            </a>
                            <Link to={`/edit/${portfolio.slug}`} className="flex-1">
                              <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-2 px-4 rounded-lg text-sm font-semibold transition">
                                Edit
                              </button>
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm({ id: portfolio.id, slug: portfolio.slug, name: portfolio.user_name })}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {portfolio.deployed_url && (
                            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                              <a
                                href={portfolio.deployed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 text-xs hover:underline break-all"
                              >
                                {portfolio.deployed_url}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-slate-50 mb-4">Available Templates</h2>
                    <div className="flex items-center gap-2 mb-6">
                      <p className="text-slate-400">All templates are unlocked for Pro members</p>
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <Link to="/templates">
                      <button className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition flex items-center gap-2">
                        Browse All Templates
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                {/* Coming Soon */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xl font-bold text-slate-50">Coming Soon</h2>
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { 
                          name: 'Developer Portfolio', 
                          icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
                          color: 'blue' 
                        },
                        { 
                          name: 'Designer Showcase', 
                          icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
                          color: 'purple' 
                        },
                        { 
                          name: 'Photography Portfolio', 
                          icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                          color: 'pink' 
                        }
                      ].map((template, idx) => (
                        <div key={idx} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 opacity-60">
                          <div className={`w-12 h-12 bg-${template.color}-500/20 rounded-xl flex items-center justify-center mb-3 text-${template.color}-400`}>
                            {template.icon}
                          </div>
                          <h3 className="font-semibold text-slate-50">{template.name}</h3>
                          <p className="text-sm text-slate-400 mt-1">Coming Soon</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NEW: Custom Domains Tab */}
              {activeTab === 'domains' && (
                <div className="space-y-6">
                  {/* Setup Guide */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-50 mb-2">Custom Domain Setup</h2>
                        <p className="text-slate-400">Connect your own domain to any of your portfolios</p>
                      </div>
                    </div>
                  </div>

                  {/* Add Domain Button */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-50">Your Custom Domains</h3>
                      <button
                        onClick={() => setShowDomainForm(!showDomainForm)}
                        className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Domain
                      </button>
                    </div>

                    {/* Add Domain Form */}
                    {showDomainForm && (
                      <div className="mb-6 bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-50 mb-4">Add New Domain</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Domain Name
                            </label>
                            <input
                              type="text"
                              value={newDomain}
                              onChange={(e) => setNewDomain(e.target.value)}
                              placeholder="myportfolio.com"
                              className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                            <p className="text-xs text-slate-500 mt-1">Enter without http:// or https://</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Select Portfolio
                            </label>
                            <select
                              value={selectedPortfolio}
                              onChange={(e) => setSelectedPortfolio(e.target.value)}
                              className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            >
                              <option value="">Choose a portfolio...</option>
                              {portfolios.map((p) => (
                                <option key={p.slug} value={p.slug}>
                                  {p.user_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleAddDomain}
                              className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-3 px-6 rounded-xl font-bold transition"
                            >
                              Add Domain
                            </button>
                            <button
                              onClick={() => {
                                setShowDomainForm(false);
                                setNewDomain('');
                                setSelectedPortfolio('');
                              }}
                              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Domains List */}
                    {customDomains.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Globe className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-2">No custom domains added yet</p>
                        <p className="text-slate-500 text-sm">Click "Add Domain" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customDomains.map((domain) => (
                          <div
                            key={domain.id}
                            className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 hover:border-yellow-400/30 transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-bold text-slate-50">{domain.domain}</h4>
                                  {domain.verified ? (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                      <CheckCircle className="w-3 h-3" />
                                      Verified
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                                      <Clock className="w-3 h-3" />
                                      Pending
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-400">Portfolio: {domain.portfolio_name}</p>
                                <p className="text-xs text-slate-500">Added {new Date(domain.created_at).toLocaleDateString()}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveDomain(domain.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                                title="Remove domain"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {!domain.verified && (
                              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                                  <h5 className="font-semibold text-slate-50">DNS Configuration Required</h5>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">
                                  Add these DNS records to your domain provider to complete setup:
                                </p>

                                {/* DNS Records */}
                                <div className="space-y-3">
                                  {/* A Record */}
                                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-bold text-slate-400 uppercase">A Record</span>
                                      <button
                                        onClick={() => copyToClipboard('76.76.21.21', `a-${domain.id}`)}
                                        className="p-1 hover:bg-slate-700 rounded transition"
                                      >
                                        {copiedField === `a-${domain.id}` ? (
                                          <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <Copy className="w-4 h-4 text-slate-400" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <p className="text-slate-500 text-xs mb-1">Name</p>
                                        <p className="text-slate-300 font-mono">@</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-500 text-xs mb-1">Value</p>
                                        <p className="text-slate-300 font-mono">76.76.21.21</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* CNAME Record for www */}
                                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-bold text-slate-400 uppercase">CNAME Record</span>
                                      <button
                                        onClick={() => copyToClipboard(`cname.vercel-dns.com`, `cname-${domain.id}`)}
                                        className="p-1 hover:bg-slate-700 rounded transition"
                                      >
                                        {copiedField === `cname-${domain.id}` ? (
                                          <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <Copy className="w-4 h-4 text-slate-400" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <p className="text-slate-500 text-xs mb-1">Name</p>
                                        <p className="text-slate-300 font-mono">www</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-500 text-xs mb-1">Value</p>
                                        <p className="text-slate-300 font-mono break-all">cname.vercel-dns.com</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-blue-400">
                                    DNS changes can take up to 48 hours to propagate. Check back later to verify your domain.
                                  </p>
                                </div>
                              </div>
                            )}

                            {domain.verified && (
                              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-green-400 font-semibold text-sm">Domain is live!</p>
                                  <a
                                    href={`https://${domain.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-300 hover:text-green-200 text-xs flex items-center gap-1 mt-1"
                                  >
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
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-50 mb-4">Setup Instructions</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-50 mb-1">Add Your Domain</h4>
                          <p className="text-sm text-slate-400">
                            Click "Add Domain" above and enter your domain name (e.g., myportfolio.com). Select which portfolio you want to connect it to.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-50 mb-1">Configure DNS Settings</h4>
                          <p className="text-sm text-slate-400 mb-2">
                            Go to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.) and add the DNS records shown above:
                          </p>
                          <ul className="text-sm text-slate-400 space-y-1 ml-4">
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>An A record pointing @ to 76.76.21.21</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>A CNAME record pointing www to cname.vercel-dns.com</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-50 mb-1">Wait for Verification</h4>
                          <p className="text-sm text-slate-400">
                            DNS changes typically take 1-48 hours to propagate. Once verified, your custom domain will be live!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Common Providers Guide */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-50 mb-4">Popular Domain Providers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: 'GoDaddy', url: 'https://www.godaddy.com/help/add-an-a-record-19238' },
                        { name: 'Namecheap', url: 'https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/' },
                        { name: 'Cloudflare', url: 'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/' },
                      ].map((provider) => (
                        <a
                          key={provider.name}
                          href={provider.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl hover:border-yellow-400/30 transition-all group"
                        >
                          <span className="font-semibold text-slate-300 group-hover:text-slate-50">{provider.name}</span>
                          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-yellow-400" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Troubleshooting */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-50 mb-4">Troubleshooting</h3>
                    <div className="space-y-4">
                      <details className="bg-slate-700/30 border border-slate-600/30 rounded-xl overflow-hidden">
                        <summary className="p-4 cursor-pointer font-semibold text-slate-50 hover:bg-slate-700/50 transition">
                          My domain isn't verifying
                        </summary>
                        <div className="p-4 pt-0 text-sm text-slate-400 space-y-2">
                          <p>• DNS changes can take up to 48 hours to propagate globally</p>
                          <p>• Verify you've added both the A record and CNAME record correctly</p>
                          <p>• Check that there are no conflicting DNS records</p>
                          <p>• Try clearing your DNS cache or using a different browser</p>
                        </div>
                      </details>

                      <details className="bg-slate-700/30 border border-slate-600/30 rounded-xl overflow-hidden">
                        <summary className="p-4 cursor-pointer font-semibold text-slate-50 hover:bg-slate-700/50 transition">
                          SSL certificate issues
                        </summary>
                        <div className="p-4 pt-0 text-sm text-slate-400 space-y-2">
                          <p>• SSL certificates are automatically provisioned after DNS verification</p>
                          <p>• This usually takes 5-10 minutes after verification</p>
                          <p>• Try accessing your site with https:// after waiting</p>
                        </div>
                      </details>

                      <details className="bg-slate-700/30 border border-slate-600/30 rounded-xl overflow-hidden">
                        <summary className="p-4 cursor-pointer font-semibold text-slate-50 hover:bg-slate-700/50 transition">
                          Can I use a subdomain?
                        </summary>
                        <div className="p-4 pt-0 text-sm text-slate-400 space-y-2">
                          <p>• Yes! You can use subdomains like portfolio.yoursite.com</p>
                          <p>• Add a CNAME record with your subdomain name pointing to cname.vercel-dns.com</p>
                          <p>• Follow the same verification process</p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-50">Delete Portfolio</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-50">"{deleteConfirm.name}"</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 px-4 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePortfolio(deleteConfirm.id, deleteConfirm.slug)}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 px-4 rounded-xl font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border animate-slideIn ${
              toast.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
            }`}
          >
            {toast.type === 'success' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 hover:opacity-70 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* CSS */}
      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 20s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProDashboard;