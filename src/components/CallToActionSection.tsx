/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const CallToActionSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({ firstName: '', email: '' });
  const [honeypot, setHoneypot] = useState(''); // Bot trap
  const lastSubmitTime = useRef<number>(0);

  const sectionId = "waitlist";

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

    if (email.includes('test') || email.includes('spam')) {
      return { valid: false, error: 'Please use a real email address' };
    }

    return { valid: true };
  };

  const validateName = (name: string): { valid: boolean; error?: string } => {
    if (name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (/^\d+$/.test(name)) {
      return { valid: false, error: 'Please enter a valid name' };
    }

    const specialCharCount = (name.match(/[^a-zA-Z\s-']/g) || []).length;
    if (specialCharCount > 2) {
      return { valid: false, error: 'Name contains invalid characters' };
    }

    return { valid: true };
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWaitlistSubmit = async () => {
    if (honeypot) {
      console.log('Bot detected via honeypot');
      setSubmitMessage('🎉 Successfully joined the waitlist!');
      setFormData({ firstName: '', email: '' });
      return;
    }

    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    if (timeSinceLastSubmit < 3000) {
      setSubmitMessage('Please wait a moment before submitting again.');
      return;
    }

    if (!formData.firstName || !formData.email) {
      setSubmitMessage('Please fill in all fields.');
      return;
    }

    const nameValidation = validateName(formData.firstName);
    if (!nameValidation.valid) {
      setSubmitMessage(nameValidation.error || 'Invalid name');
      return;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setSubmitMessage(emailValidation.error || 'Invalid email');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');
    lastSubmitTime.current = now;

    try {
      console.log({
        email: formData.email,
        firstName: formData.firstName
      });

      const { data, error } = await supabase
        .from('waitlist')
        .insert({
          email: formData.email.toLowerCase().trim(), // Normalize email
          first_name: formData.firstName.trim(),
          source: 'website',
          created_at: new Date().toISOString()
        })
        .select();

      console.log({ data, error });

      if (error) {
        if (error.code === '23505') {
          setSubmitMessage('✅ You\'re already on the waitlist!');
        } else if (error.message) {
          setSubmitMessage(`Error: ${error.message}`);
        } else {
          throw error;
        }
      } else {
        setSubmitMessage('🎉 Successfully joined the waitlist!');
        setFormData({ firstName: '', email: '' });
      }
    } catch (error: any) {
      console.error('Waitlist submission error:', error);
      setSubmitMessage(`Unable to join: ${error.message || 'Please try again later.'}`);
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
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-50">
            Stop Losing Clients. Build Your Portfolio in 10 Minutes.
          </h2>

          <p className="text-slate-300 text-base md:text-lg">
            Don't let another client slip away. Join our waitlist and be the first to try Foliobase.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-8">
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

          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 md:w-full">
            <input
              type="text"
              name="firstName"
              placeholder="Your name"
              value={formData.firstName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={50}
              className="w-full px-6 py-3 bg-slate-900/50 backdrop-blur-sm text-slate-100 placeholder-slate-400 rounded-lg border-2 border-slate-700/50 focus:border-yellow-400/60 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={100}
              className="w-full px-6 py-3 bg-slate-900/50 backdrop-blur-sm text-slate-100 placeholder-slate-400 rounded-lg border-2 border-slate-700/50 focus:border-yellow-400/60 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            />
            <button
              onClick={handleWaitlistSubmit}
              disabled={isSubmitting}
              className="w-full lg:w-1/3 bg-yellow-400 text-slate-900 px-6 py-3 text-base rounded-lg hover:bg-yellow-300 transition font-semibold shadow-lg shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </div>

          {submitMessage && (
            <p className={`text-center text-sm ${
              submitMessage.includes('🎉') || submitMessage.includes('✅') 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {submitMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;