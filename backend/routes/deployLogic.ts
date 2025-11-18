import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function deployPortfolio({ portfolioId }: { portfolioId: string }) {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

  if (!portfolioId) throw new Error("portfolioId is required");
  if (!VERCEL_TOKEN) throw new Error("Vercel token missing");

  const filePath = path.join(process.cwd(), "src/portfolios", `${portfolioId}.html`);
  if (!fs.existsSync(filePath)) {
    throw new Error("Portfolio HTML file not found");
  }

  const fileContent = fs.readFileSync(filePath, "utf8");

  // 1) Create deployment
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
    }),
  });

  const deployData = (await deployRes.json()) as {
    id?: string;
    url?: string;
  };

  if (!deployRes.ok) {
    throw new Error("Vercel deployment failed: " + JSON.stringify(deployData));
  }

  const deploymentId = deployData.id;

  // 2) Get details
  const detailsRes = await fetch(
    `https://api.vercel.com/v13/deployments/${deploymentId}`,
    {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    }
  );

  const detailsData = (await detailsRes.json()) as {
    aliases?: { domain?: string; url?: string }[];
  };

  let finalUrl = deployData.url || "";

  if (detailsData.aliases?.length) {
    const alias = detailsData.aliases[0];
    const candidate =
      alias?.domain ||
      alias?.url ||
      null;

    if (candidate) {
      finalUrl = `https://${candidate.replace(/^https?:\/\//, "")}`;
    }
  }
}
