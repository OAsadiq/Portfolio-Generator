/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

const ContactMain = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [honeypot, setHoneypot] = useState(''); // Bot trap
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const DISPOSABLE_DOMAINS = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'throwaway.email',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org',
    'getnada.com',
    'maildrop.cc',
    'trashmail.com'
  ];

  const validateEmail = (email: string): { valid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return { valid: false, error: 'Please use a permanent email address' };
    }

    if (email.includes('noreply') || email.includes('donotreply')) {
      return { valid: false, error: 'Please use a real email address' };
    }

    return { valid: true };
  };

  const validateName = (name: string): { valid: boolean; error?: string } => {
    if (name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (name.length > 100) {
      return { valid: false, error: 'Name is too long' };
    }

    if (/^\d+$/.test(name)) {
      return { valid: false, error: 'Please enter a valid name' };
    }

    if (/(http|www\.|\.com|\.net|\.org)/i.test(name)) {
      return { valid: false, error: 'Name cannot contain URLs' };
    }

    return { valid: true };
  };

  const validateMessage = (message: string): { valid: boolean; error?: string } => {
    if (message.trim().length < 10) {
      return { valid: false, error: 'Message must be at least 10 characters' };
    }

    if (message.length > 5000) {
      return { valid: false, error: 'Message is too long (max 5000 characters)' };
    }

    const urlPattern = /(http|www\.|\.com|\.net|\.org)/gi;
    const urlMatches = message.match(urlPattern);
    if (urlMatches && urlMatches.length > 3) {
      return { valid: false, error: 'Message contains too many links' };
    }

    const spamKeywords = ['viagra', 'casino', 'lottery', 'click here', 'buy now', 'limited time'];
    const lowerMessage = message.toLowerCase();
    const hasSpam = spamKeywords.some(keyword => lowerMessage.includes(keyword));
    if (hasSpam) {
      return { valid: false, error: 'Message contains prohibited content' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (honeypot) {
      console.log('Bot detected via honeypot');
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      return;
    }

    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    if (timeSinceLastSubmit < 5000) { 
      setStatus('Please wait a moment before sending another message.');
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      setStatus('Please fill in all fields.');
      return;
    }

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      setStatus(nameValidation.error || 'Invalid name');
      return;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setStatus(emailValidation.error || 'Invalid email');
      return;
    }

    const messageValidation = validateMessage(formData.message);
    if (!messageValidation.valid) {
      setStatus(messageValidation.error || 'Invalid message');
      return;
    }

    setIsSubmitting(true);
    setStatus('Sending...');
    lastSubmitTime.current = now;

    try {
      const response = await fetch('https://formsubmit.co/ajax/hello.foliobase@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          message: formData.message.trim(),
          _subject: `Foliobase Contact Form: ${formData.name}`,
          _captcha: 'false', 
          _template: 'table',
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('✅ Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('❌ Failed to send message. Please try again or email us directly.');
      }
    } catch {
      setStatus('❌ Error sending message. Please email us directly at Foliobase Support Team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (status) setStatus('');
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
          {/* Social Links & Sponsorship */}
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

            {/* Additional Contact Info */}
            <div className="mt-8 border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold mb-3 text-slate-50">Direct Contact</h3>
              <p className="text-slate-400 text-sm">
                Email: <a href="mailto:sadiqolayinka17@gmail.com" className="text-yellow-400 hover:underline">hello.foliobase@gmail.com</a>
              </p>
              <p className="text-slate-400 text-xs mt-2">
                We typically respond within 24 hours
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot field - hidden from humans, visible to bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute left-[-9999px]"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label className="block mb-1 font-semibold text-slate-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  maxLength={100}
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  maxLength={100}
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-300">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message... (minimum 10 characters)"
                  maxLength={5000}
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 resize-none disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.message.length}/5000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {status && (
                <p className={`text-center text-sm ${
                  status.includes('✅') || status.includes('success') 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactMain;