import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import templateRoutes from "./routes/templatesRoutes";
import deployRoutes from "./routes/deploy";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "https://oa-portfolio-generator.vercel.app",
      "https://*.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));
app.use("/portfolios", express.static(path.join(process.cwd(), "src/portfolios")));

app.use("/api/templates", templateRoutes);
app.use("/api/vercel", deployRoutes);

app.get("/", (req, res) => {
  res.send("✅ Portfolio Generator Backend is Live!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
