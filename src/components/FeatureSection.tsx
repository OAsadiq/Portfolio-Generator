const Feature = () => {
  return (
    <div className="grid grid-cols-1 gap-12 py-10 px-4 md:px-12 lg:px-24">
      {/* Box 1 */}
      <div className="rounded-4xl flex flex-col lg:flex-row items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Showcase Your Best Work
          </h2>
          <p className="text-gray-900 text-md md:text-lg font-semibold">
            Display your writing samples with links to published articles. Let your words speak for themselves and win more clients.
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature4.jpg"
            alt="Showcase Writing Samples"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>

      {/* Box 2 */}
      <div className="rounded-4xl flex flex-col lg:flex-row-reverse items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Templates Built for Writers
          </h2>
          <p className="text-gray-900 text-md md:text-lg font-semibold">
            Clean, professional designs that put your writing front and center. No distracting elements—just your content.
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature5.jpg"
            alt="Professional Writer Templates"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>

      {/* Box 3 */}
      <div className="rounded-4xl flex flex-col lg:flex-row items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Live in Minutes, Not Days
          </h2>
          <p className="text-gray-700 text-md md:text-lg font-semibold">
            Stop spending hours on WordPress or hiring designers. Get your portfolio live instantly and start pitching clients today.
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature6.jpg"
            alt="Quick Portfolio Setup"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>

      {/* Box 4 */}
      <div className="rounded-4xl flex flex-col lg:flex-row-reverse items-center shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 text-center p-8 md:p-12">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">
            Client Testimonials Built In
          </h2>
          <p className="text-gray-700 text-md md:text-lg font-semibold">
            Showcase what past clients say about your work. Social proof that helps you land more gigs.
          </p>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/feature8.jpg"
            alt="Client Testimonials"
            className="object-cover w-full h-64 md:h-[50vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default Feature;