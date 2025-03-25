const express = require("express");
const router = express.Router();
const { savePortfolio, selectTemplate, getPreview } = require("../controllers/apiController");

router.post("/create-portfolio", savePortfolio);

router.post("/select-template", selectTemplate);

router.get("/preview-template/:templateId", getPreview);

module.exports = router;
