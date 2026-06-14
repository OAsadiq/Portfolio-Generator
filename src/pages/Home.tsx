import Navbar from "../components/Navbar";
import Hero from "../components/HeroSection";
import CreatorTypes from "../components/CreatorTypesSection";
import SampleSection from "../components/SampleSection";
import Feature from "../components/FeatureSection";
import ComparisonSection from "../components/ComparisonSection";
import HowItWorks from "../components/HowItWorksSection";
import TestimonialsSection from "../components/TestimonialsSection";
import PricingSection from "../components/PricingSection";
import FinalCTASection from "../components/FinalCTASection";
import UpgradeHandler from "../components/UpgradeHandler";
import NewsletterSection from "../components/NewsletterSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />
      <Hero />
      <CreatorTypes />
      <SampleSection />
      <Feature />
      <ComparisonSection />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
      <UpgradeHandler />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default Home;
