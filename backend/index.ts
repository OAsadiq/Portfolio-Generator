import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: ["https://oaportfoliogenerator.vercel.app"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
