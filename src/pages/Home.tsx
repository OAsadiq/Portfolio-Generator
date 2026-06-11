import Navbar from "../components/Navbar";
import Hero from "../components/HeroSection";
import SampleSection from "../components/SampleSection";
import Feature from "../components/FeatureSection";
import HowItWorks from "../components/HowItWorksSection";
import SeeItInAction from "../components/SeeItInActionSection";
import PricingSection from "../components/PricingSection";
import UpgradeHandler from "../components/UpgradeHandler";
import NewsletterSection from "../components/NewsletterSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />
      <Hero />
      <SampleSection />
      <Feature />
      <HowItWorks />
      <SeeItInAction />
      <PricingSection />
      <UpgradeHandler />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default Home;
