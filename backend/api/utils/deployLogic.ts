import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function deployPortfolio({ portfolioId }: { portfolioId: string }) {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  if (!portfolioId) throw new Error("portfolioId is required");
  if (!VERCEL_TOKEN) throw new Error("Vercel token missing");

  // check file in repo portfolios (if you're generating into src/portfolios)
  const filePath = path.join(process.cwd(), "src", "portfolios", `${portfolioId}.html`);
  if (!fs.existsSync(filePath)) throw new Error("Portfolio HTML file not found");

  const fileContent = fs.readFileSync(filePath, "utf8");

  // create deployment
  const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `portfolio-${portfolioId}`,
      files: [{ file: "index.html", data: fileContent }],
      projectSettings: { framework: null },
      public: true
    }),
  });

  const deployData = (await deployRes.json()) as any;
  if (!deployRes.ok) {
    throw new Error("Vercel deployment failed: " + JSON.stringify(deployData));
  }

  const deploymentId: string = deployData.id;
  // get deployment details
  const detailsRes = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  const detailsData = (await detailsRes.json()) as any;

  // try to find an alias or url
  let finalUrl: string | null = null;
  if (Array.isArray(detailsData.aliases) && detailsData.aliases.length > 0) {
    const alias = detailsData.aliases[0];
    const candidate = alias?.domain || alias?.url || null;
    if (candidate) finalUrl = `https://${candidate.replace(/^https?:\/\//, "")}`;
  }

  if (!finalUrl && detailsData.url) finalUrl = `https://${detailsData.url}`;
  if (!finalUrl && deployData.url) finalUrl = `https://${deployData.url}`;

  return { deploymentId, url: finalUrl };
}
