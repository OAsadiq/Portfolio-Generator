import Navbar from "../components/Navbar";
import Hero from "../components/HeroSection";
import SampleSection from "../components/SampleSection";
import Feature from "../components/FeatureSection";
import HowItWorks from "../components/HowItWorksSection";
import PricingSection from "../components/PricingSection"
import CallToActionSection from "../components/CallToActionSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-white pt-6">
      <Navbar />
      <Hero />
      <SampleSection />
      <Feature />
      <HowItWorks />
      <PricingSection/>
      <CallToActionSection />
      <Footer />
    </div>
  );
};

export default Home;
