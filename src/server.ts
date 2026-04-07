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

    genReqId: (req) => {
      return req.headers["x-request-id"] || crypto.randomUUID();
    },

    customProps: (req) => {
      return {
        userId: req.body?.userId || null,
      }
    },

    customLogLevel: (res, err): "error" | "warn" | "info" => {
      if (err) return "error";

      const statusCode: number = res.statusCode ?? 200;

      if (statusCode >= 500) return "error";
      if (statusCode >= 400) return "warn";

      return "info";
    },
  }),
);

export default app;