import pino from "pino";
import { getRequestContext } from "./requestContext";
import { RequestContext } from "./types";

const isDevEnv: boolean = process.env.NODE_ENV === "development";
const isTestEnv: boolean = process.env.NODE_ENV === "test";
const isProdEnv: boolean = process.env.NODE_ENV === "production";

function getLogEnv(): string {
    if(isTestEnv) return "silent";
    if(isDevEnv) return "debug";
    return "info";
}

export const logger: pino.Logger<never, boolean> = pino({
  level: getLogEnv(),

  formatters: {
    level(label) {
      return { level: label };
    },
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  mixin() {
    const context: RequestContext | undefined = getRequestContext();

    if (!context) return {};

    return {
      reqId: context.reqId,
      userId: context.userId,
    };
  },

  ...(isDevEnv && !isTestEnv
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),

  transport: isProdEnv
    ? {
        target: "pino-loki",
        options: {
          host: process.env.LOKI_HOST,
          basicAuth: {
            username: process.env.LOKI_USER,
            password: process.env.LOKI_API_KEY,
          },

          labels: {
            app: "my-backend",
            env: process.env.NODE_ENV,
          },

          batching: true,
          interval: 5,
        },
      }
    : {
        target: "pino-pretty",
      },
});
