import Navbar from "../components/Navbar";
import Hero from "../components/HeroSection";
import SampleSection from "../components/SampleSection";
import CreatorTypes from "../components/CreatorTypesSection";
import Feature from "../components/FeatureSection";
import HowItWorks from "../components/HowItWorksSection";
import ComparisonSection from "../components/ComparisonSection";
import SeeItInAction from "../components/SeeItInActionSection";
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
      <SampleSection />
      <CreatorTypes />
      <Feature />
      <HowItWorks />
      <ComparisonSection />
      <SeeItInAction />
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
