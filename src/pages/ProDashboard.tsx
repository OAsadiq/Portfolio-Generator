/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Portfolio {
  id: string;
  slug: string;
  template_id: string;
  user_name: string;
  status: string;
  deployed_url: string | null;
  created_at: string;
  views?: number;
}

interface Stats {
  totalPortfolios: number;
  totalViews: number;
  templatesUsed: number;
  lastCreated: string | null;
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

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user?.id]); // Only re-fetch when user ID changes

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch portfolios
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id, slug, template_id, user_name, status, deployed_url, created_at, views')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (portfolioError) {
        console.error('Portfolio error:', portfolioError);
        throw portfolioError;
      }

      // Fetch template usage count
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
    if (!confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) return;

    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId)
        .eq('user_id', user.id); // Double check ownership

      if (deleteError) throw deleteError;

      // Try to delete from storage (don't fail if this errors)
      try {
        await supabase.storage
          .from('portfolios')
          .remove([`portfolios/${portfolioSlug}.html`]);
      } catch (storageErr) {
        console.warn('Failed to delete from storage:', storageErr);
      }

      // Refresh data
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error deleting portfolio:', err);
      alert('Failed to delete portfolio: ' + err.message);
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
                <Link to="/" className="text-xl font-bold text-yellow-400">
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
                  <button className="px-4 py-2 text-sm lg:text-md bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition">
                    Create New
                  </button>
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm lg:text-md text-slate-400 hover:text-red-600 transition"
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
              Welcome back, {user?.email?.split('@')[0]} 👋
            </h1>
            <p className="text-slate-400 text-md">Manage your portfolios and explore new templates.</p>
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
              {/* Loading Skeleton for Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 animate-pulse">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl mb-4"></div>
                    <div className="h-8 bg-slate-700 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-32"></div>
                  </div>
                ))}
              </div>
              
              {/* Loading text */}
              <div className="text-center text-slate-400 py-8">
                <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mb-2"></div>
                <p>Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Portfolios */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-50">{stats.totalPortfolios}</p>
                  <p className="text-slate-400 text-sm">Total Portfolios</p>
                </div>

                {/* Total Views */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-50">{stats.totalViews}</p>
                  <p className="text-slate-400 text-sm">Total Views</p>
                </div>

                {/* Templates Used */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-50">{stats.templatesUsed}</p>
                  <p className="text-slate-400 text-sm">Templates Used</p>
                </div>

                {/* Last Created */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-slate-800/50 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 hover:border-yellow-400/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xl lg:text-3xl font-bold text-slate-50">
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
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'portfolios', label: 'My Portfolios', icon: '📁' },
                  { id: 'templates', label: 'Templates', icon: '🎨' },
                  { id: 'domains', label: 'Domains', icon: '🌐' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-slate-50 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link to="/templates">
                        <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 py-4 px-6 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-yellow-400/20">
                          ✨ Create New Portfolio
                        </button>
                      </Link>
                      <button
                        onClick={() => setActiveTab('templates')}
                        className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 py-4 px-6 rounded-xl font-bold hover:bg-slate-700 transition-all"
                      >
                        🎨 Browse Templates
                      </button>
                      <button
                        onClick={() => setActiveTab('domains')}
                        className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 py-4 px-6 rounded-xl font-bold hover:bg-slate-700 transition-all"
                      >
                        🌐 Manage Domains
                      </button>
                    </div>
                  </div>

                  {/* Recent Portfolios */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-50">Recent Portfolios</h2>
                      <button
                        onClick={() => setActiveTab('portfolios')}
                        className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                      >
                        View All →
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
                              onClick={() => handleDeletePortfolio(portfolio.id, portfolio.slug)}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {portfolio.deployed_url && (
                            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <a
                                href={portfolio.deployed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 text-xs hover:underline break-all"
                              >
                                🌐 {portfolio.deployed_url}
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
                  {/* Available Templates */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-slate-50 mb-4">Available Templates</h2>
                    <p className="text-slate-400 mb-6">All templates are unlocked for Pro members ✨</p>
                    <Link to="/templates">
                      <button className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition">
                        Browse All Templates →
                      </button>
                    </Link>
                  </div>

                  {/* Coming Soon */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-slate-50 mb-4">Coming Soon 🚀</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: 'Developer Portfolio', icon: '💻', color: 'blue' },
                        { name: 'Designer Showcase', icon: '🎨', color: 'purple' },
                        { name: 'Photography Portfolio', icon: '📸', color: 'pink' }
                      ].map((template, idx) => (
                        <div key={idx} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 opacity-60">
                          <div className={`w-12 h-12 bg-${template.color}-500/20 rounded-xl flex items-center justify-center mb-3`}>
                            <span className="text-2xl">{template.icon}</span>
                          </div>
                          <h3 className="font-semibold text-slate-50">{template.name}</h3>
                          <p className="text-sm text-slate-400 mt-1">Coming Soon</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'domains' && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-slate-50 mb-4">Custom Domains</h2>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-blue-400 font-semibold mb-1">Custom Domains Coming Soon!</p>
                        <p className="text-slate-400 text-sm">
                          We're working on allowing you to connect your own domain to your portfolios. Stay tuned!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Placeholder for domain management */}
                  <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <p className="text-slate-400 mb-2">No custom domains yet</p>
                    <p className="text-slate-500 text-sm">Domain management will be available soon</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
      `}</style>
    </div>
  );
};

export default ProDashboard;