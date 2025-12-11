const Feature = () => {
  return (
    <div className="grid grid-cols-1 gap-12 py-10 px-4 md:px-12 lg:px-24">
      {/* Box 1 */}
      <div className="rounded-4xl flex flex-col lg:flex-row items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Effortless & Fast Setup
          </h2>
          <p className="text-gray-900 text-md md:text-lg font-semibold">
            Create a personalized portfolio by simply filling out a form. No coding required!
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature4.jpg"
            alt="Effortless Portfolio Creation"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>

      {/* Box 2 */}
      <div className="rounded-4xl flex flex-col lg:flex-row-reverse items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Beautiful Template Selection
          </h2>
          <p className="text-gray-900 text-md md:text-lg font-semibold">
            Choose from a variety of professionally designed templates to make your portfolio stand out.
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature5.jpg"
            alt="Template Selection"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>

      {/* Box 3 */}
      <div className="rounded-4xl flex flex-col lg:flex-row items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Free & Instant Access
          </h2>
          <p className="text-gray-700 text-md md:text-lg font-semibold">
            Generate your portfolio website for free and access it instantly with a custom link.
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature6.jpg"
            alt="Free and Instant Access"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>

      {/* Box 4 */}
      <div className="rounded-4xl flex flex-col lg:flex-row-reverse items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Responsive Design
          </h2>
          <p className="text-gray-700 text-md md:text-lg font-semibold">
            Your portfolio will look stunning on all devices, from desktops to mobile phones.
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature8.jpg"
            alt="Responsive Design"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default Feature;
