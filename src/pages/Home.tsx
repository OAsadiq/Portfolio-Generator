import Navbar from "../components/Navbar";
import Hero from "../components/HeroSection";
import SampleSection from "../components/SampleSection";
import Feature from "../components/FeatureSection";
import HowItWorks from "../components/HowItWorksSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-white p-6">
      <Navbar />
      <Hero />
      <SampleSection />
      <Feature />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Home;
