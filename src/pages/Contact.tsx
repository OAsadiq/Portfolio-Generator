import Navbar from "../components/Navbar";
import ContactMain from "../components/ContactMain";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 pt-6 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
      
        {/* Animated Grid Lines */}
        <div className="absolute inset-0">
          {/* Horizontal lines */}
          <div className="absolute inset-0 bg-grid-horizontal"></div>
          {/* Vertical lines */}
          <div className="absolute inset-0 bg-grid-vertical"></div>
          {/* Animated glow on grid */}
          <div className="absolute inset-0 bg-grid-glow"></div>
        </div>

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />
        <ContactMain />
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

export default Contact;
