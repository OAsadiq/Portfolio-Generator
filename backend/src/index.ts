import express from "express";
import cors from "cors";
import templateRoutes from "./routes/templatesRoutes";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "https://cautious-barnacle-q5jx4gxq49phx75x-4173.app.github.dev",
      "https://*.github.dev"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/portfolios", express.static(path.join(__dirname, "portfolios")));

app.use("/api/templates", templateRoutes);

app.get("/", (req, res) => {
  res.send("Portfolio Generator Backend Running");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
