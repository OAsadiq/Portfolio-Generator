import Navbar from "../components/Navbar";
import Hero from "../components/HeroSection";
import SampleSection from "../components/SampleSection";
import Feature from "../components/FeatureSection";
import HowItWorks from "../components/HowItWorksSection";
import PricingSection from "../components/PricingSection"
import CallToActionSection from "../components/CallToActionSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 pt-6 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        
        {/* 1. Gradient Mesh Background - Colorful Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-blob animation-delay-6000"></div>
        </div>

        {/* 2. Animated Grid Lines */}
        <div className="absolute inset-0">
          {/* Horizontal lines */}
          <div className="absolute inset-0 bg-grid-horizontal"></div>
          {/* Vertical lines */}
          <div className="absolute inset-0 bg-grid-vertical"></div>
          {/* Animated glow on grid */}
          <div className="absolute inset-0 bg-grid-glow"></div>
        </div>

        {/* 3. Connecting Lines Animation - Network Effect */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Connection Line 1 */}
          <line
            x1="10%"
            y1="20%"
            x2="30%"
            y2="40%"
            stroke="url(#gradient1)"
            strokeWidth="1"
            className="animate-draw"
          />
          {/* Connection Line 2 */}
          <line
            x1="30%"
            y1="40%"
            x2="70%"
            y2="30%"
            stroke="url(#gradient2)"
            strokeWidth="1"
            className="animate-draw animation-delay-1000"
          />
          {/* Connection Line 3 */}
          <line
            x1="70%"
            y1="30%"
            x2="90%"
            y2="60%"
            stroke="url(#gradient3)"
            strokeWidth="1"
            className="animate-draw animation-delay-2000"
          />
          {/* Connection Line 4 */}
          <line
            x1="20%"
            y1="70%"
            x2="50%"
            y2="80%"
            stroke="url(#gradient4)"
            strokeWidth="1"
            className="animate-draw animation-delay-3000"
          />
          {/* Connection Line 5 */}
          <line
            x1="50%"
            y1="80%"
            x2="80%"
            y2="90%"
            stroke="url(#gradient5)"
            strokeWidth="1"
            className="animate-draw animation-delay-4000"
          />
          {/* Connection Line 6 - Vertical */}
          <line
            x1="15%"
            y1="30%"
            x2="15%"
            y2="70%"
            stroke="url(#gradient6)"
            strokeWidth="1"
            className="animate-draw animation-delay-1500"
          />
          {/* Connection Line 7 */}
          <line
            x1="60%"
            y1="20%"
            x2="40%"
            y2="60%"
            stroke="url(#gradient7)"
            strokeWidth="1"
            className="animate-draw animation-delay-2500"
          />

          {/* Connection Points (Dots) */}
          <circle cx="10%" cy="20%" r="3" fill="#fbbf24" className="animate-pulse-slow" />
          <circle cx="30%" cy="40%" r="3" fill="#3b82f6" className="animate-pulse-slow animation-delay-1000" />
          <circle cx="70%" cy="30%" r="3" fill="#a855f7" className="animate-pulse-slow animation-delay-2000" />
          <circle cx="90%" cy="60%" r="3" fill="#10b981" className="animate-pulse-slow animation-delay-3000" />
          <circle cx="20%" cy="70%" r="3" fill="#ec4899" className="animate-pulse-slow animation-delay-4000" />
          <circle cx="50%" cy="80%" r="3" fill="#06b6d4" className="animate-pulse-slow animation-delay-1500" />
          <circle cx="80%" cy="90%" r="3" fill="#f59e0b" className="animate-pulse-slow animation-delay-2500" />
          <circle cx="15%" cy="30%" r="3" fill="#8b5cf6" className="animate-pulse-slow animation-delay-3500" />
          <circle cx="60%" cy="20%" r="3" fill="#14b8a6" className="animate-pulse-slow animation-delay-500" />
          <circle cx="40%" cy="60%" r="3" fill="#f97316" className="animate-pulse-slow animation-delay-4500" />

          {/* Gradient Definitions for Lines */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient6" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <SampleSection />
        <Feature />
        <HowItWorks />
        <PricingSection/>
        <CallToActionSection />
        <Footer />
      </div>

      {/* CSS Animations and Styles */}
      <style>{`
        /* ===== 1. GRADIENT MESH BLOB ANIMATION ===== */
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 20s infinite ease-in-out;
        }

        /* ===== 2. ANIMATED GRID LINES ===== */
        .bg-grid-horizontal {
          background-image: linear-gradient(
            rgba(148, 163, 184, 0.03) 1px,
            transparent 1px
          );
          background-size: 100% 50px;
          animation: gridMoveVertical 20s linear infinite;
        }

        .bg-grid-vertical {
          background-image: linear-gradient(
            90deg,
            rgba(148, 163, 184, 0.03) 1px,
            transparent 1px
          );
          background-size: 50px 100%;
          animation: gridMoveHorizontal 20s linear infinite;
        }

        .bg-grid-glow {
          background: 
            radial-gradient(
              circle at 20% 30%,
              rgba(251, 191, 36, 0.03) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(59, 130, 246, 0.03) 0%,
              transparent 50%
            );
          animation: glowPulse 8s ease-in-out infinite;
        }

        @keyframes gridMoveVertical {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 50px;
          }
        }

        @keyframes gridMoveHorizontal {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 0;
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        /* ===== 3. CONNECTING LINES ANIMATION ===== */
        @keyframes draw {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -1000;
            opacity: 0;
          }
        }

        .animate-draw {
          animation: draw 8s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        /* ===== ANIMATION DELAYS ===== */
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-2500 { animation-delay: 2.5s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-3500 { animation-delay: 3.5s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-4500 { animation-delay: 4.5s; }
        .animation-delay-6000 { animation-delay: 6s; }

        /* ===== RADIAL GRADIENT VIGNETTE ===== */
        .bg-radial-gradient {
          background: radial-gradient(
            circle at 50% 50%,
            transparent 0%,
            rgba(15, 23, 42, 0.2) 50%,
            rgba(15, 23, 42, 0.6) 100%
          );
        }

        /* ===== ACCESSIBILITY ===== */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-draw,
          .animate-pulse-slow,
          .bg-grid-horizontal,
          .bg-grid-vertical,
          .bg-grid-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;