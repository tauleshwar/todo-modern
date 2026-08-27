import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { taskRouter } from "./routes/tasks";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/tasks", taskRouter);
app.get("/api/health", (_request, response) => response.json({ ok: true }));

// The backend is now fully independent and strictly serves as an API.
// Static file serving for the frontend has been removed as the frontend should be deployed independently.

app.listen(port, () => {
  console.log(`Todo API listening on http://localhost:${port}`);
});
