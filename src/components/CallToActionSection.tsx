/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';

const CallToActionSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({ firstName: '', email: '' });

  // Add id to section for scroll navigation
  const sectionId = "waitlist";

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWaitlistSubmit = async () => {
    if (!formData.firstName || !formData.email) {
      setSubmitMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('https://app.loops.so/api/v1/contacts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_LOOPS_API_KEY`, // Replace with your actual API key
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          email: formData.email,
        }),
      });

      if (response.ok) {
        setSubmitMessage('🎉 Successfully joined the waitlist!');
        setFormData({ firstName: '', email: '' });
      } else {
        setSubmitMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Unable to connect. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: { key: string; }) => {
    if (e.key === 'Enter') {
      handleWaitlistSubmit();
    }
  };

  return (
    <div id={sectionId} className="py-20 px-6 md:px-24">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-yellow-500/10 to-slate-800/50 border border-yellow-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-xl shadow-yellow-500/10 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4">
          
          <h2 className="text-2xl md:text-4xl font-bold text-slate-50">
            Ready to land your next writing client?
          </h2>

          <p className="text-slate-300 text-base md:text-lg">
            Stop losing clients to writers with better portfolios. Create yours in 10 minutes and start pitching with confidence.
          </p>

        </div>

        <div className="flex flex-col gap-4 mt-8">
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 md:w-full">
            <input
              type="text"
              name="firstName"
              placeholder="Your name"
              value={formData.firstName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-3 bg-slate-900/50 backdrop-blur-sm text-slate-100 placeholder-slate-400 rounded-lg border-2 border-slate-700/50 focus:border-yellow-400/60 focus:outline-none transition-all duration-300"
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-3 bg-slate-900/50 backdrop-blur-sm text-slate-100 placeholder-slate-400 rounded-lg border-2 border-slate-700/50 focus:border-yellow-400/60 focus:outline-none transition-all duration-300"
            />
            <button
              onClick={handleWaitlistSubmit}
              disabled={isSubmitting}
              className="w-full lg:w-1/3 bg-yellow-400 text-slate-900 px-6 py-3 text-base rounded-lg hover:bg-yellow-300 transition font-semibold shadow-lg shadow-yellow-400/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </div>
          
          {submitMessage && (
            <p className={`text-center text-sm ${submitMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {submitMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;