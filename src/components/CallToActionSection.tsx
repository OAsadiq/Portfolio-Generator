const CallToActionSection = () => {
  return (
    <div className="bg-gray-100 md:py-48">
      <div className="mx-24 flex flex-col items-right px-8">
        {/* Text Section */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 w-[50%]">
            Ready to create your personalized portfolio?
        </h2>

        <div className="flex flex-row justify-between">
            <div>
                <p className="text-gray-600 mt-2">
                    Take the next step and showcase your skills and projects in a custom-built portfolio.
                </p>
            </div>

            {/* Button Section */}
            <div className="mt-6 md:mt-0 space-x-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-300 hover:text-black">
                    Get Started
                </button>
                <button className="bg-yellow-400 border-2 px-6 py-3 rounded-lg hover:bg-yellow-500">
                    Contact Us
                </button>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default CallToActionSection;
