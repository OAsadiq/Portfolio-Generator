const ContactMain = () => {
  return (
    <div className="text-gray-900">

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Get in <span className="text-yellow-500">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Have a question, feedback, or need support? Fill out the form and we’ll get back to you.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Main Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>

            <div className="space-y-4 text-gray-700">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                support@oaportfoliogenerator.xyz
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                +1 678 951 6618
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
            <div>
              <label className="block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Message</label>
              <textarea
                rows={4}
                placeholder="Write your message..."
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>

    </div>
  );
};

export default ContactMain;
