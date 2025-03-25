const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  name: String,
  about: String,
  skills: String,
  projects: Array,
  experience: Array,
  templateId: String,
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);

mongoose.connect('mongodb://localhost:27017/portfolioDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));