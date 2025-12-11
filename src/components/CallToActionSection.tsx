import { Link } from "react-router-dom";

const CallToActionSection = () => {
  return (
    <div className="bg-gray-100 py-20 px-6 md:px-24">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 md:w-1/2">
          Ready to create your personalized portfolio?
        </h2>

        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-0">
          
          <p className="text-gray-600 md:w-1/2 text-base md:text-lg">
            Take the next step and showcase your skills and projects in a custom-built portfolio.
          </p>

          <div className="flex flex-row gap-4">
            <Link to="/templates">
              <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-300 hover:text-black">
                Get Started
              </button>
            </Link>
            
            <Link to="/contact">
              <button className="bg-yellow-400 border-2 px-6 py-3 rounded-lg hover:bg-yellow-500">
                Contact Us
              </button>
            </Link>
            
          </div>

        </div>

      </div>
    </div>
  );
};

export default CallToActionSection;
