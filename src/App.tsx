import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PortfolioForm from "./pages/CreatePortfolio";
import TemplateSelection from "./pages/TemplateSelection";
import CreatePortfolio from "./pages/CreatePortfolio";
import PreviewPortfolio from "./pages/PreviewPortfolio";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/form" element={<PortfolioForm />} />
          <Route path="/templates" element={<TemplateSelection />} />
          <Route path="/create/:templateId" element={<CreatePortfolio />} />
          <Route path="/preview/:id" element={<PreviewPortfolio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
