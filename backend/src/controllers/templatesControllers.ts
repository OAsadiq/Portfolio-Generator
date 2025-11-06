import { Request, Response } from "express";
import { generatePortfolioId } from "../utils/idGenerator";

export const selectTemplate = (req: Request, res: Response) => {
  const { templateId } = req.body;

  if (!templateId) {
    return res.status(400).json({ error: "Template ID is required" });
  }

  // Generate a unique portfolio ID
  const portfolioId = generatePortfolioId();

  // In a real app, you'd store this in a database
  return res.status(200).json({
    message: "Template selected successfully",
    portfolioId,
  });
};
