import "./loadEnv";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import { logger } from "./utils/logger";
import { asyncLocalStorage } from "./utils/requestContext";
import { attachLogger } from "./middleware/loggerMiddleware";

import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";

const app = express();
const isTestEnv: boolean = process.env.NODE_ENV === "test";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, _res, next) => {
  const reqId: string = req.headers["x-request-id"]?.toString() || crypto.randomUUID();

  const userId: string | null = req.body?.userId || null;

  asyncLocalStorage.run({ reqId, userId }, () => {
    next();
  });
});

if (isTestEnv) {
  app.use(attachLogger);
} else {
  app.use(
    pinoHttp({
      logger,

      genReqId: (req) => {
        return req.headers["x-request-id"] || crypto.randomUUID();
      },

      customLogLevel: (req, res, err): "error" | "warn" | "info" => {
        if (err) return "error";

        const statusCode: number = res.statusCode ?? 200;

        if (statusCode >= 500) return "error";
        if (statusCode >= 400) return "warn";

        return "info";
      },
    }),
  );
}

app.use("/api/users", userRoutes);
app.use("/api/ai", chatRoutes);

export default app;