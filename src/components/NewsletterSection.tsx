/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { track } from "../lib/track";

const DISPOSABLE_DOMAINS = ["tempmail.com","guerrillamail.com","10minutemail.com","throwaway.email","mailinator.com","yopmail.com","temp-mail.org","getnada.com","maildrop.cc","trashmail.com"];

const NewsletterSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [formData, setFormData] = useState({ firstName: "", email: "" });
  const [honeypot, setHoneypot] = useState("");
  const lastSubmitTime = useRef<number>(0);

  const validateEmail = (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: "Please enter a valid email address" };
    const domain = email.split("@")[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) return { valid: false, error: "Please use a permanent email address" };
    return { valid: true };
  };

  const validateName = (name: string) => {
    if (name.trim().length < 2) return { valid: false, error: "Name must be at least 2 characters" };
    if (/^\d+$/.test(name)) return { valid: false, error: "Please enter a valid name" };
    return { valid: true };
  };

  const handleSubmit = async () => {
    if (honeypot) { setSubmitMessage("🎉 Subscribed!"); return; }
    if (Date.now() - lastSubmitTime.current < 3000) { setSubmitMessage("Please wait a moment."); return; }
    if (!formData.firstName || !formData.email) { setSubmitMessage("Please fill in all fields."); return; }

    const nameCheck = validateName(formData.firstName);
    if (!nameCheck.valid) { setSubmitMessage(nameCheck.error || "Invalid name"); return; }
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) { setSubmitMessage(emailCheck.error || "Invalid email"); return; }

    setIsSubmitting(true);
    setSubmitMessage("");
    lastSubmitTime.current = Date.now();

    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: formData.email.toLowerCase().trim(),
        first_name: formData.firstName.trim(),
        source: "website",
        subscribed_at: new Date().toISOString(),
        is_active: true,
      });

      if (error) {
        setSubmitMessage(error.code === "23505" ? "You're already subscribed!" : error.message);
      } else {
        setSubmitMessage("Subscribed! You'll hear from us soon.");
        setFormData({ firstName: "", email: "" });
        track("newsletter_subscribed", { source: "website" });
      }
    } catch (err: any) {
      setSubmitMessage(err.message || "Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuccess = submitMessage.includes("Subscribed") || submitMessage.includes("already");

  return (
    <section id="newsletter" className="py-24 px-6 bg-stone-50 border-t border-stone-100">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-4">Stay in the loop</p>
        <h2
          className="text-3xl md:text-4xl font-bold text-stone-900 mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Portfolio tips, straight to your inbox.
        </h2>
        <p className="text-stone-500 text-base mb-10">
          Weekly tips on building better portfolios, winning clients, and growing your creative business. No spam.
        </p>

        <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px]" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={50}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={100}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-stone-900 hover:bg-stone-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </button>
        </div>

        {submitMessage && (
          <p className={`mt-4 text-sm ${isSuccess ? "text-emerald-600" : "text-red-500"}`}>
            {submitMessage}
          </p>
        )}

        <p className="text-stone-400 text-xs mt-4">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  );
};

export default NewsletterSection;
