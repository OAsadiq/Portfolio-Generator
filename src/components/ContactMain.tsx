/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

const ContactMain = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('https://formsubmit.co/sadiqolayinka17@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setStatus('Error sending message. Please try again.');
    }
  };

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="text-slate-50">
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-slate-50">
            Get in <span className="text-yellow-400">Touch</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Have a question, feedback, or need support? Fill out the form and we'll get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl p-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-50">Follow Us On</h2>

            <div className="flex gap-4">
              <a
                href="https://x.com/oasadiq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-yellow-400 text-slate-900 rounded-full hover:bg-yellow-300 transition"
                aria-label="Follow us on Twitter"
              >
                <FaXTwitter size={20} />
              </a>
              
              <a
                href="https://linkedin.com/in/oasadiq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-yellow-400 text-slate-900 rounded-full hover:bg-yellow-300 transition"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>

            <div className="mt-8 border-t border-slate-700 pt-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-50">Sponsorship Opportunities</h3>
              <p className="text-slate-400 mb-4">
                Interested in partnering with us? Let's explore collaboration opportunities together.
              </p>
              <a
                href="mailto:sadiqolayinka17@gmail.com"
                className="inline-block w-full text-center bg-yellow-400 text-slate-900 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
              >
                Become a Sponsor
              </a>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl p-8 space-y-5">
            <div>
              <label className="block mb-1 font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-300">Message</label>
              <textarea
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600"
                required
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
            >
              Send Message
            </button>

            {status && (
              <p className={`text-center ${status.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {status}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactMain;