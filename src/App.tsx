import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import AuthCallback from './components/Auth/AuthCallback';
import TemplateSelection from './pages/TemplateSelection';
import CreatePortfolio from './pages/CreatePortfolio';
import PreviewPortfolio from './pages/PreviewPortfolio';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Success from './pages/Success';
import ProDashboard from './pages/ProDashboard';
import EditPortfolio from './pages/EditPortfolio';
import TradeJournal from './pages/TradeJournal';
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
            <Route path="/create/:templateId" element={
              <ProtectedRoute>
                <CreatePortfolio />
              </ProtectedRoute>
            } />
            <Route path="/success" element={
              <ProtectedRoute>
                <Success />
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