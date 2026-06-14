/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

const INPUT = 'w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition disabled:opacity-50';
const LABEL = 'block text-xs font-semibold text-stone-600 mb-1.5';

const DISPOSABLE_DOMAINS = ['tempmail.com','guerrillamail.com','10minutemail.com','throwaway.email','mailinator.com','yopmail.com','temp-mail.org','getnada.com','maildrop.cc','trashmail.com'];

const ContactMain = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const validateEmail = (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: 'Please enter a valid email address' };
    if (DISPOSABLE_DOMAINS.includes(email.split('@')[1]?.toLowerCase())) return { valid: false, error: 'Please use a permanent email address' };
    if (email.includes('noreply') || email.includes('donotreply')) return { valid: false, error: 'Please use a real email address' };
    return { valid: true };
  };

  const validateName = (name: string) => {
    if (name.trim().length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (name.length > 100) return { valid: false, error: 'Name is too long' };
    if (/^\d+$/.test(name)) return { valid: false, error: 'Please enter a valid name' };
    if (/(http|www\.|\.com|\.net|\.org)/i.test(name)) return { valid: false, error: 'Name cannot contain URLs' };
    return { valid: true };
  };

  const validateMessage = (message: string) => {
    if (message.trim().length < 10) return { valid: false, error: 'Message must be at least 10 characters' };
    if (message.length > 5000) return { valid: false, error: 'Message is too long (max 5000 characters)' };
    const urlMatches = message.match(/(http|www\.|\.com|\.net|\.org)/gi);
    if (urlMatches && urlMatches.length > 3) return { valid: false, error: 'Message contains too many links' };
    const lowerMessage = message.toLowerCase();
    if (['viagra','casino','lottery','click here','buy now','limited time'].some(k => lowerMessage.includes(k))) return { valid: false, error: 'Message contains prohibited content' };
    return { valid: true };
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (honeypot) { setStatus('Message sent successfully!'); setFormData({ name: '', email: '', message: '' }); return; }

    const now = Date.now();
    if (now - lastSubmitTime.current < 5000) { setStatus('Please wait a moment before sending another message.'); return; }
    if (!formData.name || !formData.email || !formData.message) { setStatus('Please fill in all fields.'); return; }

    const nv = validateName(formData.name); if (!nv.valid) { setStatus(nv.error || 'Invalid name'); return; }
    const ev = validateEmail(formData.email); if (!ev.valid) { setStatus(ev.error || 'Invalid email'); return; }
    const mv = validateMessage(formData.message); if (!mv.valid) { setStatus(mv.error || 'Invalid message'); return; }

    setIsSubmitting(true); setStatus('Sending...'); lastSubmitTime.current = now;
    try {
      const response = await fetch('https://formsubmit.co/ajax/support@porfilr.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), email: formData.email.toLowerCase().trim(), message: formData.message.trim(), _subject: `Porfilr Contact Form: ${formData.name}`, _captcha: 'false', _template: 'table' }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('✅ Message sent! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('❌ Failed to send. Please try again or email us directly.');
      }
    } catch {
      setStatus('❌ Error sending message. Please email us at hello@porfilr.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status) setStatus('');
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3">
          Get in Touch
        </h1>
        <p className="text-stone-500 max-w-xl mx-auto">
          Have a question, feedback, or need support? Fill out the form and we'll get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-8">
          <div>
            <h2 className="text-base font-bold text-stone-900 mb-4">Follow Us</h2>
            <div className="flex gap-3">
              <a href="https://x.com/oasadiq" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-stone-900 text-white rounded-full hover:bg-stone-700 transition"
                aria-label="Follow us on X">
                <FaXTwitter size={18} />
              </a>
              <a href="https://linkedin.com/in/oasadiq" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-stone-900 text-white rounded-full hover:bg-stone-700 transition"
                aria-label="Follow us on LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-6">
            <h3 className="text-base font-bold text-stone-900 mb-2">Sponsorship</h3>
            <p className="text-stone-500 text-sm mb-4">
              Interested in partnering with us? Let's explore collaboration opportunities.
            </p>
            <a href="mailto:hello@porfilr.com"
              className="inline-block w-full text-center bg-orange-600 hover:bg-orange-500 text-white py-2.5 px-6 rounded-xl text-sm font-semibold transition">
              Become a Sponsor
            </a>
          </div>

          <div className="border-t border-stone-100 pt-6">
            <h3 className="text-base font-bold text-stone-900 mb-2">Direct Contact</h3>
            <p className="text-stone-500 text-sm">
              Email:{' '}
              <a href="mailto:support@porfilr.com" className="text-orange-600 hover:underline font-medium">
                support@porfilr.com
              </a>
            </p>
            <p className="text-stone-400 text-xs mt-1">We typically respond within 24 hours</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
              className="absolute left-[-9999px]" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div>
              <label className={LABEL}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Your name" maxLength={100} className={INPUT} required disabled={isSubmitting} />
            </div>

            <div>
              <label className={LABEL}>Email Address <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" maxLength={100} className={INPUT} required disabled={isSubmitting} />
            </div>

            <div>
              <label className={LABEL}>Message <span className="text-red-500">*</span></label>
              <textarea rows={5} name="message" value={formData.message} onChange={handleChange}
                placeholder="Write your message... (minimum 10 characters)" maxLength={5000}
                className={`${INPUT} resize-none`} required disabled={isSubmitting} />
              <p className="text-xs text-stone-400 mt-1">{formData.message.length}/5000 characters</p>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {status && (
              <p className={`text-center text-sm ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-500' : 'text-stone-500'}`}>
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default ContactMain;
