import pino from "pino";
import { getRequestContext } from "./requestContext";
import { RequestContext } from "./types";

const isDevEnv: boolean = process.env.NODE_ENV === "development";
const isTestEnv: boolean = process.env.NODE_ENV === "test";

function getLogEnv(): string {
    if(isTestEnv) return "silent";
    if(isDevEnv) return "debug";
    return "info";
}

export const logger: pino.Logger<never, boolean> = pino({
  level: getLogEnv(),

  mixin() {
    const context: RequestContext | undefined = getRequestContext();

    if(!context) return {};

    return {
      reqId: context.reqId,
      userId: context.userId,
    }
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
    } : {}),
});
