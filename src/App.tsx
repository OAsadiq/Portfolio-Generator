import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import AuthCallback from './components/Auth/AuthCallback';
import TemplateSelection from './pages/TemplateSelection';
import TraderKit from './pages/TraderKit';
import CreatePortfolio from './pages/CreatePortfolio';
import PreviewPortfolio from './pages/PreviewPortfolio';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Success from './pages/Success';
import TemplateSuccess from './pages/TemplateSuccess';
import ProDashboard from './pages/ProDashboard';
import EditPortfolio from './pages/EditPortfolio';
import TradeJournal from './pages/TradeJournal';
import JournalEntry from './pages/JournalEntry';
import PortfolioVisualBuilder from './components/PortfolioVisualBuilder';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PricingPage from './pages/Pricing';
import NicheLanding from './pages/niches/NicheLanding';
import { NICHES } from './pages/niches/nicheConfig';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-stone-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* SEO niche landing pages */}
            {NICHES.map(n => (
              <Route key={n.slug} path={`/${n.slug}`} element={<NicheLanding config={n} />} />
            ))}
            
            {/* Auth callback route - handles OAuth redirect */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            {/* Public so visitors can browse/preview templates before signing up.
                The "Use this" action gates on login (via /create being protected). */}
            <Route path="/templates" element={<TemplateSelection />} />
            <Route path="/trading-journal" element={<TraderKit />} />
            {/* Old path. Vercel 301s this in production; the client route is the fallback
                for local dev and for anyone already inside the SPA. */}
            <Route path="/trader-kit" element={<Navigate to="/trading-journal" replace />} />
            {/* Public: logged-out visitors can fill a template in and only hit the
                signup wall at Publish. CreatePortfolio still shows the Pro/kit paywall
                for paid templates, so only the free Minimal form is truly open. */}
            <Route path="/create/:templateId" element={<CreatePortfolio />} />
            <Route path="/success" element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            } />
            <Route path="/template-success" element={
              <ProtectedRoute>
                <TemplateSuccess />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ProDashboard />
              </ProtectedRoute>
            } />
            <Route path="/edit/:slug" element={
              <ProtectedRoute>
                <EditPortfolio />
              </ProtectedRoute>
            } />
            <Route path="/builder/:slug" element={
              <ProtectedRoute>
                <PortfolioVisualBuilder />
              </ProtectedRoute>
            } />
            {/* Bare /journal resolves (or creates) the user's journal and redirects, so
                a trader can start logging without publishing a page first. */}
            <Route path="/journal" element={
              <ProtectedRoute>
                <JournalEntry />
              </ProtectedRoute>
            } />
            <Route path="/journal/:slug" element={
              <ProtectedRoute>
                <TradeJournal />
              </ProtectedRoute>
            } />

            {/* Preview is public */}
            <Route path="/preview/:id" element={<PreviewPortfolio />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;