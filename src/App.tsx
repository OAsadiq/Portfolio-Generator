// src/App.tsx
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-900">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Auth callback route - handles OAuth redirect */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            <Route path="/templates" element={
              <ProtectedRoute>
                <TemplateSelection />
              </ProtectedRoute>
            } />
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

            {/* Preview is public */}
            <Route path="/preview/:id" element={<PreviewPortfolio />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;