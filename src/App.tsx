import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PortfolioForm from "./pages/PortfolioForm";
import TemplateSelection from "./pages/TemplateSelection";
import PreviewPage from "./pages/PreviewPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<PortfolioForm />} />
          <Route path="/templates" element={<TemplateSelection />} />
          <Route path="/preview" element={<PreviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
