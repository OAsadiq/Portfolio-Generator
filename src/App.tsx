import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PortfolioForm from "./pages/PortfolioForm";
import TemplateSelection from "./pages/TemplateSelection";
import PreviewPage from "./pages/PreviewPage";
import MultiStepModalForm from "./components/FormInput";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<PortfolioForm />} />
          <Route path="/templates" element={<TemplateSelection />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/form-sample" element={<MultiStepModalForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
