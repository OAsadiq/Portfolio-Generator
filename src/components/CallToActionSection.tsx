import { Link } from "react-router-dom";

const CallToActionSection = () => {
  return (
    <div className="py-20 px-6 md:px-24">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-yellow-500/10 to-slate-800/50 border border-yellow-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-xl shadow-yellow-500/10 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-6">
          
          <h2 className="text-2xl md:text-4xl font-bold text-slate-50 md:w-3/4">
            Ready to land your next writing client?
          </h2>

          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-0">
            
            <p className="text-slate-300 md:w-1/2 text-base md:text-lg">
              Stop losing clients to writers with better portfolios. Create yours in 10 minutes and start pitching with confidence.
            </p>

            <div className="flex flex-row gap-4">
              <Link to="/templates">
                <button className="bg-yellow-400 text-slate-900 px-8 sm:px-10 md:px-12  py-3 text-base sm:text-lg rounded-lg hover:bg-yellow-300 transition font-semibold shadow-lg shadow-yellow-400/20">
                  Create Portfolio
                </button>
              </Link>
              
              <Link to="/contact">
                <button className="bg-slate-700/50 border border-slate-600/50 text-slate-200 text-base sm:text-lg px-8 sm:px-10 md:px-12  py-3 rounded-lg hover:bg-slate-700 hover:text-yellow-400 transition font-semibold">
                  Contact Us
                </button>
              </Link>
              
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CallToActionSection;