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
    <div className="text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">
            Get in <span className="text-yellow-500">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Have a question, feedback, or need support? Fill out the form and we'll get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Follow Us On</h2>

            <div className="flex gap-4">
              <a
                href="https://x.com/oasadiq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-yellow-500 text-gray-800 rounded-full hover:bg-yellow-600 transition"
                aria-label="Follow us on Twitter"
              >
                <FaXTwitter size={20} />
              </a>
              
              <a
                href="https://linkedin.com/in/oasadiq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-yellow-500 text-gray-800 rounded-full hover:bg-yellow-600 transition"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>

            <div className="mt-8 border-t border-gray-400">
              <h3 className="text-lg sm:text-xl font-bold mb-3 pt-4 text-gray-800">Sponsorship Opportunities</h3>
              <p className="text-gray-600 mb-4">
                Interested in partnering with us? Let's explore collaboration opportunities together.
              </p>
              <a
                href="mailto:sadiqolayinka17@gmail.com"
                className="inline-block w-full text-center bg-yellow-500 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition"
              >
                Become a Sponsor
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
            <div>
              <label className="block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Message</label>
              <textarea
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Send Message
            </button>

            {status && (
              <p className={`text-center ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
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