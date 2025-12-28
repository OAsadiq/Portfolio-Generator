import Navbar from "../components/Navbar";
import ContactMain from "../components/ContactMain";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 pt-6">
      <Navbar />
      <ContactMain />
      <Footer />
    </div>
  );
};

export default Contact;
