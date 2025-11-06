export const generatePortfolioId = () => {
  return "portfolio_" + Math.random().toString(36).substring(2, 9);
};
