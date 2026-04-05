import "./loadEnv";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import { logger } from "./utils/logger";

import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRoutes);
app.use("/api/ai", chatRoutes);

app.use(
  pinoHttp({
    logger,
    customLogLevel: (res, err): "error" | "warn" | "info" => {
      const statusCode: number = res.statusCode ?? 200;

      if (statusCode >= 500 || err) return "error";
      if (statusCode >= 400) return "warn";
      return "info";
    },
  }),
);

export default app;