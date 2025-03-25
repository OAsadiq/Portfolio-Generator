const Portfolio = require("../models/Portfolio"); 

exports.savePortfolio = async (req, res) => {
  const { name, about, skills, projects, experience } = req.body;

  try {
    const portfolio = await Portfolio.create({ name, about, skills, projects, experience });
    res.json({ portfolioId: portfolio._id });
  } catch (error) {
    res.status(500).json({ error: "Failed to save portfolio" });
  }
};

exports.selectTemplate = async (req, res) => {
  const { portfolioId, templateId } = req.body;

  try {
    const portfolio = await Portfolio.findByIdAndUpdate(portfolioId, { templateId });
    res.json({ message: "Template selected successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to select template" });
  }
};

exports.getPreview = (req, res) => {
  const { templateId } = req.params;

  res.render(`templates/template${templateId}`);
};
