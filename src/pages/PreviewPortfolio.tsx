import { useParams } from "react-router-dom";

const PreviewPortfolio = () => {
  const { id } = useParams();
  const portfolioUrl = `${import.meta.env.VITE_API_URL}/portfolios/${id}.html`;

  return (
    <iframe
      src={portfolioUrl}
      title="Portfolio Preview"
      className="w-full h-screen border-none"
    />
  );
};

export default PreviewPortfolio;
